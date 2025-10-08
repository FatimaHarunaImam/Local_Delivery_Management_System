import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Utility function to verify user authentication
async function verifyUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  console.log('Auth header received:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Invalid authorization header format');
    return { error: 'No access token provided', status: 401 };
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    console.log('No access token found in header');
    return { error: 'No access token provided', status: 401 };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log('Supabase auth error:', error);
      return { error: 'Authentication failed: ' + error.message, status: 401 };
    }
    
    if (!user) {
      console.log('No user found for token');
      return { error: 'User not found', status: 401 };
    }

    console.log('User authenticated successfully:', user.id);
    return { user };
  } catch (error) {
    console.log('Exception during user verification:', error);
    return { error: 'Authentication error', status: 401 };
  }
}

// Health check endpoint
app.get("/make-server-aaf007a1/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth test endpoint
app.get("/make-server-aaf007a1/auth/test", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error, authenticated: false }, auth.status);
  }
  
  return c.json({ 
    authenticated: true, 
    userId: auth.user.id,
    email: auth.user.email,
    message: "Authentication successful" 
  });
});

// SME account test endpoint
app.get("/make-server-aaf007a1/sme/test", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const userProfile = await kv.get(`user:${auth.user.id}`);
    const smeData = await kv.get(`sme:${auth.user.id}`);
    const wallet = await kv.get(`wallet:${auth.user.id}`);
    
    return c.json({
      userId: auth.user.id,
      userProfile,
      smeData,
      wallet,
      hasUserProfile: !!userProfile,
      hasSmeData: !!smeData,
      hasWallet: !!wallet,
      userType: userProfile?.userType
    });
  } catch (error) {
    console.log('SME test error:', error);
    return c.json({ error: 'Test failed', details: error.message }, 500);
  }
});

// Initialize SME account data if missing
app.post("/make-server-aaf007a1/sme/initialize", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const userId = auth.user.id;
    
    // Get or create user profile
    let userProfile = await kv.get(`user:${userId}`);
    if (!userProfile) {
      userProfile = {
        id: userId,
        email: auth.user.email,
        name: auth.user.user_metadata.name || 'SME User',
        userType: 'sme',
        phone: auth.user.user_metadata.phone || '',
        createdAt: new Date().toISOString()
      };
      await kv.set(`user:${userId}`, userProfile);
    }

    // Get or create SME data
    let smeData = await kv.get(`sme:${userId}`);
    if (!smeData) {
      smeData = {
        userId,
        plan: 'basic',
        unitsRemaining: 0,
        totalUnitsUsed: 0,
        subscriptionDate: new Date().toISOString(),
        isActive: false
      };
      await kv.set(`sme:${userId}`, smeData);
    }

    // Get or create wallet
    let wallet = await kv.get(`wallet:${userId}`);
    if (!wallet) {
      wallet = {
        userId,
        balance: 0,
        currency: 'NGN',
        transactions: [],
        lastUpdated: new Date().toISOString()
      };
      await kv.set(`wallet:${userId}`, wallet);
    }

    return c.json({
      success: true,
      message: 'SME account initialized successfully',
      userProfile,
      smeData,
      wallet
    });
  } catch (error) {
    console.log('SME initialization error:', error);
    return c.json({ error: 'Failed to initialize SME account', details: error.message }, 500);
  }
});

// User Registration
app.post("/make-server-aaf007a1/auth/signup", async (c) => {
  try {
    const { email, password, name, userType, phone } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType, phone },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user profile and wallet
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      userType,
      phone,
      createdAt: new Date().toISOString()
    });

    // Initialize wallet for all users
    await kv.set(`wallet:${userId}`, {
      userId,
      balance: userType === 'sme' ? 0 : 1000, // SMEs start with 0, others get ₦1000 welcome bonus
      currency: 'NGN',
      transactions: [],
      lastUpdated: new Date().toISOString()
    });

    // Initialize SME subscription if user is SME
    if (userType === 'sme') {
      const smeData = {
        userId,
        plan: 'basic',
        unitsRemaining: 0,
        totalUnitsUsed: 0,
        subscriptionDate: new Date().toISOString(),
        isActive: false
      };
      console.log('Creating SME data:', smeData);
      await kv.set(`sme:${userId}`, smeData);
    }

    return c.json({ 
      user: data.user,
      message: `Account created successfully! ${userType === 'sme' ? 'SME' : 'Welcome'} bonus applied.`
    });
  } catch (error) {
    console.log('Signup server error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get User Profile
app.get("/make-server-aaf007a1/user/profile", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const userProfile = await kv.get(`user:${auth.user.id}`);
    const wallet = await kv.get(`wallet:${auth.user.id}`);
    
    let smeData = null;
    if (userProfile?.userType === 'sme') {
      smeData = await kv.get(`sme:${auth.user.id}`);
    }

    return c.json({
      profile: userProfile,
      wallet,
      sme: smeData
    });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

// Get Wallet Balance
app.get("/make-server-aaf007a1/wallet/:userId", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const wallet = await kv.get(`wallet:${auth.user.id}`);
    return c.json(wallet || { balance: 0, currency: 'NGN', transactions: [] });
  } catch (error) {
    console.log('Wallet fetch error:', error);
    return c.json({ error: 'Failed to fetch wallet' }, 500);
  }
});

// Add Money to Wallet
app.post("/make-server-aaf007a1/wallet/topup", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const { amount, paymentMethod } = await c.req.json();
    
    if (!amount || amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const wallet = await kv.get(`wallet:${auth.user.id}`) || {
      userId: auth.user.id,
      balance: 0,
      currency: 'NGN',
      transactions: []
    };

    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'credit',
      amount,
      description: `Wallet top-up via ${paymentMethod}`,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    wallet.balance += amount;
    wallet.transactions.unshift(transaction);
    wallet.lastUpdated = new Date().toISOString();

    await kv.set(`wallet:${auth.user.id}`, wallet);

    return c.json({ 
      success: true, 
      newBalance: wallet.balance,
      transaction 
    });
  } catch (error) {
    console.log('Wallet topup error:', error);
    return c.json({ error: 'Failed to top up wallet' }, 500);
  }
});

// Process Card Payment for Delivery
app.post("/make-server-aaf007a1/delivery/payment", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const { deliveryId, amount, riderId, deliveryFee, paymentMethod, cardDetails } = await c.req.json();

    // Validate payment method
    if (paymentMethod === 'card' && (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
      return c.json({ error: 'Card details are required' }, 400);
    }

    // Simulate card payment processing
    if (paymentMethod === 'card') {
      // In a real app, this would integrate with payment processors like Paystack, Flutterwave, etc.
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      
      // Basic card validation
      if (cardNumber.length < 16) {
        return c.json({ error: 'Invalid card number' }, 400);
      }
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random payment failures (5% failure rate)
      if (Math.random() < 0.05) {
        return c.json({ error: 'Payment declined. Please try another card.' }, 400);
      }
    }

    // Get rider wallet
    const riderWallet = await kv.get(`wallet:${riderId}`) || {
      userId: riderId,
      balance: 0,
      currency: 'NGN',
      transactions: []
    };

    // Calculate platform fee (10% commission)
    const platformFee = Math.round(deliveryFee * 0.1);
    const riderEarning = deliveryFee - platformFee;

    // Create payment transaction record
    const paymentTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: auth.user.id,
      deliveryId,
      amount,
      deliveryFee,
      platformFee,
      riderEarning,
      paymentMethod,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    // Credit rider
    const riderTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'credit',
      amount: riderEarning,
      description: `Delivery earning - Order #${deliveryId}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      deliveryId
    };

    riderWallet.balance += riderEarning;
    riderWallet.transactions.unshift(riderTransaction);
    riderWallet.lastUpdated = new Date().toISOString();

    // Save rider wallet and payment record
    await kv.set(`wallet:${riderId}`, riderWallet);
    await kv.set(`payment:${paymentTransaction.id}`, paymentTransaction);

    // Update delivery status
    const delivery = await kv.get(`delivery:${deliveryId}`) || {};
    delivery.paymentStatus = 'completed';
    delivery.paymentMethod = paymentMethod;
    delivery.paidAt = new Date().toISOString();
    delivery.platformFee = platformFee;
    delivery.riderEarning = riderEarning;
    await kv.set(`delivery:${deliveryId}`, delivery);

    return c.json({ 
      success: true,
      paymentId: paymentTransaction.id,
      riderEarning,
      platformFee,
      message: 'Payment successful! Your delivery is confirmed.'
    });
  } catch (error) {
    console.log('Payment processing error:', error);
    return c.json({ error: 'Failed to process payment' }, 500);
  }
});

// SME Unit Purchase
app.post("/make-server-aaf007a1/sme/purchase-units", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const { units, totalCost } = await c.req.json();

    // Verify user is SME
    const userProfile = await kv.get(`user:${auth.user.id}`);
    if (userProfile?.userType !== 'sme') {
      return c.json({ error: 'Access denied. SME account required.' }, 403);
    }

    // Check wallet balance
    const wallet = await kv.get(`wallet:${auth.user.id}`);
    if (!wallet || wallet.balance < totalCost) {
      return c.json({ error: 'Insufficient wallet balance' }, 400);
    }

    // Get SME data
    const smeData = await kv.get(`sme:${auth.user.id}`) || {
      userId: auth.user.id,
      plan: 'basic',
      unitsRemaining: 0,
      totalUnitsUsed: 0,
      subscriptionDate: new Date().toISOString(),
      isActive: false
    };

    // Deduct from wallet
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'debit',
      amount: totalCost,
      description: `Purchase ${units} delivery units`,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    wallet.balance -= totalCost;
    wallet.transactions.unshift(transaction);
    wallet.lastUpdated = new Date().toISOString();

    // Add units to SME account
    smeData.unitsRemaining += units;
    smeData.isActive = true;
    smeData.lastPurchase = new Date().toISOString();

    // Save updates
    await kv.set(`wallet:${auth.user.id}`, wallet);
    await kv.set(`sme:${auth.user.id}`, smeData);

    return c.json({
      success: true,
      newBalance: wallet.balance,
      unitsRemaining: smeData.unitsRemaining,
      transaction
    });
  } catch (error) {
    console.log('SME unit purchase error:', error);
    return c.json({ error: 'Failed to purchase units' }, 500);
  }
});

// SME Delivery Creation (using units)
app.post("/make-server-aaf007a1/sme/create-delivery", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const deliveryData = await c.req.json();

    // Verify user is SME
    const userProfile = await kv.get(`user:${auth.user.id}`);
    if (userProfile?.userType !== 'sme') {
      return c.json({ error: 'Access denied. SME account required.' }, 403);
    }

    // Check SME units
    const smeData = await kv.get(`sme:${auth.user.id}`);
    if (!smeData || smeData.unitsRemaining <= 0) {
      return c.json({ error: 'No delivery units remaining. Please purchase more units.' }, 400);
    }

    // Create delivery
    const deliveryId = `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const delivery = {
      id: deliveryId,
      customerId: auth.user.id,
      customerType: 'sme',
      ...deliveryData,
      status: 'pending',
      paymentStatus: 'prepaid',
      createdAt: new Date().toISOString()
    };

    // Deduct unit
    smeData.unitsRemaining -= 1;
    smeData.totalUnitsUsed += 1;

    // Save delivery and update SME data
    await kv.set(`delivery:${deliveryId}`, delivery);
    await kv.set(`sme:${auth.user.id}`, smeData);

    return c.json({
      success: true,
      delivery,
      unitsRemaining: smeData.unitsRemaining
    });
  } catch (error) {
    console.log('SME delivery creation error:', error);
    return c.json({ error: 'Failed to create delivery' }, 500);
  }
});

// Get SME Dashboard Data
app.get("/make-server-aaf007a1/sme/dashboard", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    console.log('SME dashboard auth error:', auth.error);
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    console.log('Fetching SME dashboard for user:', auth.user.id);
    
    // Get user profile
    const userProfile = await kv.get(`user:${auth.user.id}`);
    console.log('User profile:', userProfile);
    
    if (!userProfile) {
      console.log('No user profile found');
      return c.json({ error: 'User profile not found' }, 404);
    }
    
    if (userProfile.userType !== 'sme') {
      console.log('User is not SME:', userProfile.userType);
      return c.json({ error: 'Access denied. SME account required.' }, 403);
    }

    // Get SME data - initialize if doesn't exist
    let smeData = await kv.get(`sme:${auth.user.id}`);
    if (!smeData) {
      console.log('No SME data found, creating default');
      smeData = {
        userId: auth.user.id,
        plan: 'basic',
        unitsRemaining: 0,
        totalUnitsUsed: 0,
        subscriptionDate: new Date().toISOString(),
        isActive: false
      };
      await kv.set(`sme:${auth.user.id}`, smeData);
    }

    // Get wallet - initialize if doesn't exist
    let wallet = await kv.get(`wallet:${auth.user.id}`);
    if (!wallet) {
      console.log('No wallet found, creating default');
      wallet = {
        userId: auth.user.id,
        balance: 0,
        currency: 'NGN',
        transactions: [],
        lastUpdated: new Date().toISOString()
      };
      await kv.set(`wallet:${auth.user.id}`, wallet);
    }
    
    // Get deliveries for this SME with error handling
    let smeDeliveries = [];
    try {
      const allKeys = await kv.getByPrefix('delivery:');
      console.log('Total deliveries found:', allKeys.length);
      
      smeDeliveries = allKeys.filter(item => {
        return item.value && 
               item.value.customerId === auth.user.id && 
               item.value.customerType === 'sme';
      });
      console.log('SME deliveries found:', smeDeliveries.length);
    } catch (deliveryError) {
      console.log('Error fetching deliveries:', deliveryError);
      // Continue with empty deliveries rather than failing
      smeDeliveries = [];
    }

    const dashboardData = {
      sme: smeData,
      wallet,
      deliveries: smeDeliveries.map(item => item.value),
      totalDeliveries: smeDeliveries.length,
      completedDeliveries: smeDeliveries.filter(item => 
        item.value && item.value.status === 'completed'
      ).length
    };

    console.log('SME dashboard data prepared successfully');
    return c.json(dashboardData);
    
  } catch (error) {
    console.log('SME dashboard error:', error);
    console.log('Error details:', error.message, error.stack);
    return c.json({ 
      error: 'Failed to fetch SME dashboard', 
      details: error.message 
    }, 500);
  }
});

// Create Regular Delivery
app.post("/make-server-aaf007a1/delivery/create", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const deliveryData = await c.req.json();
    const deliveryId = `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const delivery = {
      id: deliveryId,
      customerId: auth.user.id,
      customerType: 'customer',
      ...deliveryData,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    await kv.set(`delivery:${deliveryId}`, delivery);

    return c.json({
      success: true,
      delivery
    });
  } catch (error) {
    console.log('Delivery creation error:', error);
    return c.json({ error: 'Failed to create delivery' }, 500);
  }
});

// Get Available Deliveries (for riders)
app.get("/make-server-aaf007a1/deliveries/available", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const allDeliveries = await kv.getByPrefix('delivery:');
    const availableDeliveries = allDeliveries
      .filter(item => item.value.status === 'pending' && !item.value.riderId)
      .map(item => item.value);

    return c.json(availableDeliveries);
  } catch (error) {
    console.log('Available deliveries fetch error:', error);
    return c.json({ error: 'Failed to fetch available deliveries' }, 500);
  }
});

// Accept Delivery (rider)
app.post("/make-server-aaf007a1/delivery/:deliveryId/accept", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const deliveryId = c.req.param('deliveryId');
    const delivery = await kv.get(`delivery:${deliveryId}`);
    
    if (!delivery) {
      return c.json({ error: 'Delivery not found' }, 404);
    }

    if (delivery.status !== 'pending') {
      return c.json({ error: 'Delivery no longer available' }, 400);
    }

    if (delivery.riderId && delivery.riderId !== auth.user.id) {
      return c.json({ error: 'Delivery already accepted by another rider' }, 400);
    }

    // Get rider details
    const riderProfile = await kv.get(`user:${auth.user.id}`);
    
    delivery.riderId = auth.user.id;
    delivery.riderName = riderProfile?.name || 'Unknown Rider';
    delivery.riderPhone = riderProfile?.phone || '';
    delivery.status = 'accepted';
    delivery.acceptedAt = new Date().toISOString();
    delivery.estimatedArrival = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes from now

    await kv.set(`delivery:${deliveryId}`, delivery);

    return c.json({
      success: true,
      delivery
    });
  } catch (error) {
    console.log('Delivery acceptance error:', error);
    return c.json({ error: 'Failed to accept delivery' }, 500);
  }
});

// Update Delivery Status
app.put("/make-server-aaf007a1/delivery/:deliveryId/status", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const deliveryId = c.req.param('deliveryId');
    const { status } = await c.req.json();
    
    const delivery = await kv.get(`delivery:${deliveryId}`);
    if (!delivery) {
      return c.json({ error: 'Delivery not found' }, 404);
    }

    delivery.status = status;
    delivery.updatedAt = new Date().toISOString();

    if (status === 'completed') {
      delivery.completedAt = new Date().toISOString();
    }

    await kv.set(`delivery:${deliveryId}`, delivery);

    return c.json({
      success: true,
      delivery
    });
  } catch (error) {
    console.log('Delivery status update error:', error);
    return c.json({ error: 'Failed to update delivery status' }, 500);
  }
});

// Get Rider Earnings
app.get("/make-server-aaf007a1/rider/earnings", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const wallet = await kv.get(`wallet:${auth.user.id}`);
    const allDeliveries = await kv.getByPrefix('delivery:');
    const riderDeliveries = allDeliveries
      .filter(item => item.value.riderId === auth.user.id)
      .map(item => item.value);

    const totalEarnings = riderDeliveries
      .filter(delivery => delivery.status === 'completed')
      .reduce((sum, delivery) => sum + (delivery.riderEarning || delivery.deliveryFee || 0), 0);

    return c.json({
      wallet,
      totalEarnings,
      completedDeliveries: riderDeliveries.filter(d => d.status === 'completed').length,
      recentDeliveries: riderDeliveries.slice(0, 10)
    });
  } catch (error) {
    console.log('Rider earnings fetch error:', error);
    return c.json({ error: 'Failed to fetch rider earnings' }, 500);
  }
});

// Get Customer Deliveries
app.get("/make-server-aaf007a1/customer/deliveries", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const allDeliveries = await kv.getByPrefix('delivery:');
    const customerDeliveries = allDeliveries
      .filter(item => item.value.customerId === auth.user.id)
      .map(item => item.value)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(customerDeliveries);
  } catch (error) {
    console.log('Customer deliveries fetch error:', error);
    return c.json({ error: 'Failed to fetch customer deliveries' }, 500);
  }
});

// Get Active Delivery for Customer
app.get("/make-server-aaf007a1/customer/active-delivery", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const allDeliveries = await kv.getByPrefix('delivery:');
    const activeDelivery = allDeliveries
      .filter(item => 
        item.value.customerId === auth.user.id && 
        ['accepted', 'picked_up', 'in_transit'].includes(item.value.status)
      )
      .map(item => item.value)[0];

    return c.json(activeDelivery || null);
  } catch (error) {
    console.log('Active delivery fetch error:', error);
    return c.json({ error: 'Failed to fetch active delivery' }, 500);
  }
});

// Get Active Delivery for Rider
app.get("/make-server-aaf007a1/rider/active-delivery", async (c) => {
  const auth = await verifyUser(c.req.raw);
  if (auth.error) {
    return c.json({ error: auth.error }, auth.status);
  }

  try {
    const allDeliveries = await kv.getByPrefix('delivery:');
    const activeDelivery = allDeliveries
      .filter(item => 
        item.value.riderId === auth.user.id && 
        ['accepted', 'picked_up', 'in_transit'].includes(item.value.status)
      )
      .map(item => item.value)[0];

    return c.json(activeDelivery || null);
  } catch (error) {
    console.log('Active delivery fetch error:', error);
    return c.json({ error: 'Failed to fetch rider active delivery' }, 500);
  }
});

Deno.serve(app.fetch);