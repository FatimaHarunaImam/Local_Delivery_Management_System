import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton Supabase client for frontend use
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API base URL for our server
export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-aaf007a1`;

// Enhanced API client with robust offline fallback and error handling
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Always fallback to offline mode immediately to prevent fetch errors
  console.log(`API call to ${endpoint} - using offline mode for demo`);
  return await getOfflineFallback(endpoint, options);
  
  // The following code is commented out to prevent fetch errors
  // Uncomment when Supabase backend is properly configured
  
  /*
  try {
    // Set a reasonable timeout for API calls
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced timeout

    let session = null;
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && data) {
        session = data.session;
      }
    } catch (sessionErr) {
      console.log('Session check failed, continuing with offline mode');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Check if this is a public endpoint
    const publicEndpoints = ['/health', '/auth/signup', '/auth/test'];
    const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.startsWith(publicPath));

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else if (!isPublicEndpoint) {
      console.log('No session found, using offline mode for:', endpoint);
      clearTimeout(timeoutId);
      return await getOfflineFallback(endpoint, options);
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`API call failed (${response.status}), falling back to offline mode for:`, endpoint);
      return await getOfflineFallback(endpoint, options);
    }

    const result = await response.json();
    console.log(`API call to ${endpoint} succeeded`);
    return result;
  } catch (error: any) {
    console.log(`API call failed (${error.message}), using offline fallback for:`, endpoint);
    
    // Return offline fallback instead of throwing
    return await getOfflineFallback(endpoint, options);
  }
  */
}

// Offline fallback system with mock data and localStorage persistence
const getOfflineFallback = async (endpoint: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  // Add small delay to simulate network
  await new Promise(resolve => setTimeout(resolve, 200));

  switch (endpoint) {
    case '/auth/test':
      return { success: true, message: 'Offline mode active' };

    case '/deliveries/available':
      // Return fresh mock deliveries with realistic data
      return [
        {
          id: 'mock-delivery-' + Date.now(),
          packageSize: 'Medium',
          deliveryFee: 600,
          pickup: 'Pantami Market, Gombe',
          dropoff: 'Federal Lowcost, Gombe',
          receiverName: 'Ahmad Yusuf',
          receiverPhone: '+234 803 123 4567',
          createdAt: new Date().toISOString(),
          paymentStatus: 'completed'
        },
        {
          id: 'mock-delivery-' + (Date.now() + 1),
          packageSize: 'Small',
          deliveryFee: 600,
          pickup: 'Gombe Central Market',
          dropoff: 'Tudun Wada, Gombe',
          receiverName: 'Fatima Ali',
          receiverPhone: '+234 805 987 6543',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          paymentStatus: 'completed'
        },
        {
          id: 'mock-delivery-' + (Date.now() + 2),
          packageSize: 'Large',
          deliveryFee: 900,
          pickup: 'Nasarawo Market',
          dropoff: 'Bolari Estate',
          receiverName: 'Ibrahim Sani',
          receiverPhone: '+234 806 555 7890',
          createdAt: new Date(Date.now() - 180000).toISOString(),
          paymentStatus: 'completed'
        }
      ];

    case '/rider/earnings':
      // Dynamic earnings based on time of day
      const now = new Date();
      const hour = now.getHours();
      const baseEarnings = hour < 12 ? 1200 : hour < 18 ? 2400 : 3600;
      
      return {
        wallet: { balance: 15750 + Math.floor(Math.random() * 5000) },
        completedDeliveries: 47 + Math.floor(hour / 2),
        todayEarnings: baseEarnings + Math.floor(Math.random() * 1000)
      };

    case '/rider/active-delivery':
      // Check localStorage for active delivery
      const activeDelivery = localStorage.getItem('activeDelivery');
      if (activeDelivery) {
        return JSON.parse(activeDelivery);
      }
      return null;

    case '/sme/dashboard':
      // Get or create SME data
      let smeData = JSON.parse(localStorage.getItem('smeData') || 'null');
      if (!smeData) {
        smeData = {
          sme: {
            userId: 'mock-sme-user',
            plan: 'standard',
            unitsRemaining: 25,
            totalUnitsUsed: 75,
            subscriptionDate: new Date().toISOString(),
            isActive: true
          },
          wallet: { balance: 45000 },
          deliveries: generateMockSMEDeliveries(),
          totalDeliveries: 15,
          completedDeliveries: 12
        };
        localStorage.setItem('smeData', JSON.stringify(smeData));
      }
      return smeData;

    case '/sme/initialize':
      if (method === 'POST') {
        const newSMEData = {
          sme: {
            userId: 'mock-sme-user',
            plan: 'standard',
            unitsRemaining: 10,
            totalUnitsUsed: 0,
            subscriptionDate: new Date().toISOString(),
            isActive: true
          },
          wallet: { balance: 0 },
          deliveries: [],
          totalDeliveries: 0,
          completedDeliveries: 0
        };
        localStorage.setItem('smeData', JSON.stringify(newSMEData));
        
        return {
          success: true,
          message: 'SME account initialized successfully',
          ...newSMEData
        };
      }
      break;

    case '/delivery/create':
      if (method === 'POST') {
        const deliveryId = 'delivery-' + Date.now();
        const delivery = {
          id: deliveryId,
          ...body,
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Store in localStorage for tracking
        const existingDeliveries = JSON.parse(localStorage.getItem('allDeliveries') || '[]');
        existingDeliveries.push(delivery);
        localStorage.setItem('allDeliveries', JSON.stringify(existingDeliveries));
        
        return {
          success: true,
          delivery
        };
      }
      break;

    case '/delivery/payment':
      if (method === 'POST') {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          paymentId: 'payment-' + Date.now(),
          message: 'Payment processed successfully'
        };
      }
      break;

    case '/delivery/payment/verify':
      if (method === 'POST') {
        // Simulate payment verification with 95% success rate
        const isSuccess = Math.random() > 0.05;
        if (isSuccess) {
          return {
            success: true,
            verified: true,
            message: 'Payment verified successfully'
          };
        } else {
          throw new Error('Payment verification failed. Please try again.');
        }
      }
      break;

    case '/sme/create-delivery':
      if (method === 'POST') {
        const deliveryId = 'sme-delivery-' + Date.now();
        const delivery = {
          id: deliveryId,
          ...body,
          status: 'pending',
          createdAt: new Date().toISOString(),
          customerName: body.recipientName
        };
        
        // Update SME data
        const smeData = JSON.parse(localStorage.getItem('smeData') || '{}');
        if (!smeData.deliveries) smeData.deliveries = [];
        
        smeData.deliveries.unshift(delivery);
        smeData.totalDeliveries = (smeData.totalDeliveries || 0) + 1;
        
        // Deduct one unit
        if (smeData.sme) {
          smeData.sme.unitsRemaining = Math.max(0, (smeData.sme.unitsRemaining || 0) - 1);
          smeData.sme.totalUnitsUsed = (smeData.sme.totalUnitsUsed || 0) + 1;
        }
        
        localStorage.setItem('smeData', JSON.stringify(smeData));
        
        return {
          success: true,
          delivery,
          message: 'Delivery created successfully'
        };
      }
      break;

    case '/sme/purchase-units':
      if (method === 'POST') {
        const { units, totalCost, paymentMethod } = body || {};
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 95% success rate for demo
        if (Math.random() > 0.05) {
          // Update SME data
          const smeData = JSON.parse(localStorage.getItem('smeData') || '{}');
          
          // Initialize if needed
          if (!smeData.sme) {
            smeData.sme = {
              userId: 'mock-sme-user',
              plan: 'standard',
              unitsRemaining: 0,
              totalUnitsUsed: 0,
              subscriptionDate: new Date().toISOString(),
              isActive: true
            };
          }
          
          if (!smeData.wallet) {
            smeData.wallet = { balance: 50000 }; // Default wallet balance
          }
          
          // Add purchased units
          smeData.sme.unitsRemaining = (smeData.sme.unitsRemaining || 0) + units;
          
          // Deduct from wallet if paying with wallet
          if (paymentMethod === 'wallet') {
            smeData.wallet.balance = Math.max(0, (smeData.wallet.balance || 0) - totalCost);
          }
          
          localStorage.setItem('smeData', JSON.stringify(smeData));
          
          return {
            success: true,
            message: `Successfully purchased ${units} delivery units`,
            transaction: {
              id: 'txn-' + Date.now(),
              units,
              amount: totalCost,
              paymentMethod,
              timestamp: new Date().toISOString()
            }
          };
        } else {
          throw new Error('Payment processing failed. Please try again.');
        }
      }
      break;

    case '/auth/signup':
      if (method === 'POST') {
        // Simulate successful signup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          user: {
            id: 'mock-user-' + Date.now(),
            email: body.email,
            name: body.name,
            userType: body.userType,
            phone: body.phone
          },
          success: true
        };
      }
      break;

    default:
      // Handle wallet-related API calls
      if (endpoint.startsWith('/wallet/')) {
        const userId = endpoint.split('/')[2];
        
        // Determine user type from localStorage or default
        const demoUser = localStorage.getItem('jetdash_demo_user');
        let userType = 'customer';
        
        if (demoUser) {
          try {
            const userData = JSON.parse(demoUser);
            userType = userData.userType || 'customer';
          } catch (e) {
            console.log('Failed to parse demo user data');
          }
        }
        
        // Generate appropriate wallet data based on user type
        const isRider = userType === 'rider';
        const isSME = userType === 'sme';
        const isCustomer = userType === 'customer';
        
        const mockBalance = isRider ? 15750 + Math.floor(Math.random() * 5000) 
                          : isSME ? 25000 + Math.floor(Math.random() * 15000)
                          : Math.floor(Math.random() * 1000);
        
        const mockTransactions = isRider ? [
          {
            id: '1',
            type: 'credit',
            amount: 540,
            description: 'Delivery payment (Package to Federal Lowcost)',
            timestamp: new Date().toISOString(),
            status: 'completed'
          },
          {
            id: '2', 
            type: 'credit',
            amount: 810,
            description: 'Delivery payment (Package to Gombe Central)',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'completed'
          },
          {
            id: '3',
            type: 'credit',
            amount: 720,
            description: 'Delivery payment (Package to Tudun Wada)',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'completed'
          }
        ] : isSME ? [
          {
            id: '1',
            type: 'debit',
            amount: 600,
            description: 'Delivery unit used (Order #JD001)',
            timestamp: new Date().toISOString(),
            status: 'completed'
          },
          {
            id: '2',
            type: 'credit',
            amount: 25000,
            description: 'Purchased 40 delivery units',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: 'completed'
          },
          {
            id: '3',
            type: 'debit',
            amount: 600,
            description: 'Delivery unit used (Order #JD002)',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'completed'
          }
        ] : [
          {
            id: '1',
            type: 'debit',
            amount: 660,
            description: 'Package delivery to Federal Lowcost',
            timestamp: new Date().toISOString(),
            status: 'completed'
          }
        ];
        
        return {
          balance: mockBalance,
          currency: 'NGN',
          transactions: mockTransactions
        };
      }
      
      // Handle wallet top-up
      if (endpoint === '/wallet/topup' && method === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        
        const amount = body?.amount || 0;
        const newBalance = 1000 + amount; // Mock new balance
        
        return {
          success: true,
          newBalance,
          transaction: {
            id: 'topup-' + Date.now(),
            type: 'credit',
            amount,
            description: `Wallet top-up via ${body?.paymentMethod || 'card'}`,
            timestamp: new Date().toISOString(),
            status: 'completed'
          }
        };
      }
      console.log('No offline fallback available for:', endpoint);
      return {
        success: false,
        error: 'Offline mode - endpoint not available',
        offline: true
      };
  }

  return {
    success: false,
    error: 'Offline mode - operation not supported',
    offline: true
  };
};

// Helper function to generate mock SME deliveries
const generateMockSMEDeliveries = () => {
  const statuses = ['completed', 'pending', 'accepted', 'in_transit'];
  const locations = ['Pantami', 'Federal Lowcost', 'Gombe Central', 'Tudun Wada', 'Nasarawo'];
  const customers = ['Ahmad Hassan', 'Fatima Ibrahim', 'Yusuf Aliyu', 'Aisha Mohammed', 'Ibrahim Sani'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `sme-delivery-${Date.now()}-${i}`,
    customerName: customers[i % customers.length],
    pickupLocation: locations[Math.floor(Math.random() * locations.length)],
    dropoffLocation: locations[Math.floor(Math.random() * locations.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - (i * 3600000)).toISOString(), // Spread over hours
    completedAt: i % 3 === 0 ? new Date(Date.now() - (i * 3600000) + 1800000).toISOString() : undefined
  }));
};

// Enhanced real-time functionality with robust fallback
export const simulateRealTimeUpdates = () => {
  console.log('🔄 Starting real-time updates (offline mode)...');
  
  // Skip Supabase real-time connection to prevent errors
  // Focus on local simulation for now
  let subscription: any = null;
  
  // Comment out Supabase real-time to prevent fetch errors
  /*
  try {
    // Subscribe to delivery table changes
    subscription = supabase
      .channel('deliveries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deliveries'
      }, (payload) => {
        console.log('📡 Real-time update received:', payload);
        window.dispatchEvent(new CustomEvent('deliveryUpdate', { detail: payload }));
      })
      .subscribe((status) => {
        console.log('📡 Supabase real-time status:', status);
      });

    // Also subscribe to rider status changes
    const riderSubscription = supabase
      .channel('rider_status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'riders'
      }, (payload) => {
        console.log('📡 Rider status update:', payload);
        window.dispatchEvent(new CustomEvent('riderStatusUpdate', { detail: payload }));
      })
      .subscribe();
  } catch (error) {
    console.log('📡 Supabase real-time not available, using fallback:', error);
  }
  */
  
  // Enhanced simulation with more frequent updates for better responsiveness
  const updateInterval = setInterval(() => {
    // Update active deliveries status with more realistic progression
    const deliveries = JSON.parse(localStorage.getItem('allDeliveries') || '[]');
    let updated = false;
    
    deliveries.forEach((delivery: any) => {
      const timeSinceCreated = Date.now() - new Date(delivery.createdAt).getTime();
      const minutesElapsed = timeSinceCreated / (1000 * 60);
      
      if (delivery.status === 'pending' && minutesElapsed > 2 && Math.random() > 0.6) {
        delivery.status = 'accepted';
        delivery.acceptedAt = new Date().toISOString();
        delivery.riderId = 'rider-' + Math.floor(Math.random() * 100);
        updated = true;
        console.log('🚀 Delivery accepted:', delivery.id);
      } else if (delivery.status === 'accepted' && minutesElapsed > 5 && Math.random() > 0.7) {
        delivery.status = 'picked_up';
        delivery.pickedUpAt = new Date().toISOString();
        updated = true;
        console.log('📦 Package picked up:', delivery.id);
      } else if (delivery.status === 'picked_up' && minutesElapsed > 10 && Math.random() > 0.8) {
        delivery.status = 'in_transit';
        delivery.inTransitAt = new Date().toISOString();
        updated = true;
        console.log('🚚 Package in transit:', delivery.id);
      } else if (delivery.status === 'in_transit' && minutesElapsed > 15 && Math.random() > 0.9) {
        delivery.status = 'completed';
        delivery.completedAt = new Date().toISOString();
        updated = true;
        console.log('✅ Delivery completed:', delivery.id);
      }
    });
    
    if (updated) {
      localStorage.setItem('allDeliveries', JSON.stringify(deliveries));
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('deliveryUpdate', { detail: deliveries }));
    }
    
    // Also simulate new delivery requests appearing
    if (Math.random() > 0.85) {
      const newDelivery = {
        id: 'new-delivery-' + Date.now(),
        packageSize: ['Small', 'Medium', 'Large'][Math.floor(Math.random() * 3)],
        deliveryFee: [600, 800, 1000][Math.floor(Math.random() * 3)],
        pickup: ['Pantami Market', 'Gombe Central', 'Nasarawo Market'][Math.floor(Math.random() * 3)],
        dropoff: ['Federal Lowcost', 'Tudun Wada', 'Bolari Estate'][Math.floor(Math.random() * 3)],
        receiverName: ['Ahmad Hassan', 'Fatima Ali', 'Ibrahim Sani'][Math.floor(Math.random() * 3)],
        receiverPhone: '+234 ' + (800 + Math.floor(Math.random() * 100)) + ' ' + Math.floor(Math.random() * 900 + 100) + ' ' + Math.floor(Math.random() * 9000 + 1000),
        createdAt: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'completed'
      };
      
      const existingDeliveries = JSON.parse(localStorage.getItem('allDeliveries') || '[]');
      existingDeliveries.unshift(newDelivery);
      localStorage.setItem('allDeliveries', JSON.stringify(existingDeliveries));
      
      console.log('🆕 New delivery request:', newDelivery.id);
      window.dispatchEvent(new CustomEvent('newDeliveryRequest', { detail: newDelivery }));
    }
  }, 5000); // Update every 5 seconds for better real-time feel
  
  return () => {
    try {
      clearInterval(updateInterval);
      if (subscription) {
        subscription.unsubscribe();
      }
    } catch (cleanupError) {
      console.log('Cleanup error (safe to ignore):', cleanupError);
    }
  };
};

// Email verification simulation
export const sendVerificationEmail = async (email: string) => {
  console.log('Sending verification email to:', email);
  
  // Store verification code in localStorage for demo
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem('verificationCode', verificationCode);
  localStorage.setItem('verificationEmail', email);
  
  // Show the code in console for demo purposes
  console.log('🔐 Your verification code is:', verificationCode);
  console.log('👆 Copy this code from the console for demo purposes');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true, message: 'Verification code sent' };
};

export const verifyEmailCode = async (email: string, code: string) => {
  const storedCode = localStorage.getItem('verificationCode');
  const storedEmail = localStorage.getItem('verificationEmail');
  
  if (storedEmail !== email) {
    throw new Error('Email mismatch');
  }
  
  if (storedCode !== code) {
    throw new Error('Invalid verification code');
  }
  
  // Clear stored verification data
  localStorage.removeItem('verificationCode');
  localStorage.removeItem('verificationEmail');
  
  return { success: true, verified: true };
};

// Optional function to test Supabase connectivity
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    if (error) {
      console.log('Supabase connection test failed:', error.message);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.log('Supabase connection test error:', error);
    return false;
  }
};

// Enable real Supabase functionality (call this when you want to try real connections)
export const enableRealSupabase = () => {
  console.log('🔄 Enabling real Supabase functionality...');
  // You can uncomment the actual API calls in apiCall function when ready
  console.log('To enable real Supabase, uncomment the implementation in apiCall function');
};