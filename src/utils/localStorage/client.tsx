// Simple localStorage-based client as alternative to Supabase

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'customer' | 'rider' | 'sme';
  phone: string;
  password?: string; // Only stored temporarily for demo
  riderInfo?: any;
}

interface Delivery {
  id: string;
  customerId: string;
  riderId?: string;
  pickup: string;
  dropoff: string;
  packageSize: string;
  packageDescription?: string;
  receiverName: string;
  receiverPhone: string;
  deliveryFee: number;
  paymentMethod: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

class LocalStorageDB {
  private users: User[] = [];
  private deliveries: Delivery[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const usersData = localStorage.getItem('jetdash_users');
      const deliveriesData = localStorage.getItem('jetdash_deliveries');
      const currentUserData = localStorage.getItem('jetdash_current_user');

      if (usersData) this.users = JSON.parse(usersData);
      if (deliveriesData) this.deliveries = JSON.parse(deliveriesData);
      if (currentUserData) this.currentUser = JSON.parse(currentUserData);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }

  private saveData() {
    try {
      localStorage.setItem('jetdash_users', JSON.stringify(this.users));
      localStorage.setItem('jetdash_deliveries', JSON.stringify(this.deliveries));
      if (this.currentUser) {
        localStorage.setItem('jetdash_current_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('jetdash_current_user');
      }
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  // Auth methods
  async signup(userData: Omit<User, 'id'> & { password: string }) {
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user: User = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    this.users.push(user);
    this.saveData();

    return { user: { ...user, password: undefined } };
  }

  async login(email: string, password: string) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    this.currentUser = user;
    this.saveData();

    return {
      user: { ...user, password: undefined },
      session: {
        access_token: 'mock_token_' + Date.now(),
        refresh_token: 'mock_refresh_' + Date.now()
      }
    };
  }

  async logout() {
    this.currentUser = null;
    localStorage.removeItem('jetdash_current_user');
    return { success: true };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getSession() {
    return {
      user: this.currentUser,
      session: this.currentUser ? {
        access_token: 'mock_token',
        refresh_token: 'mock_refresh'
      } : null
    };
  }

  // Delivery methods
  async createDelivery(deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'status'>) {
    const delivery: Delivery = {
      ...deliveryData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.deliveries.push(delivery);
    this.saveData();

    return { success: true, delivery };
  }

  async getAvailableDeliveries() {
    return this.deliveries.filter(d => d.status === 'pending');
  }

  async getActiveDelivery(riderId: string) {
    return this.deliveries.find(d => d.riderId === riderId && 
      ['accepted', 'picked_up', 'in_transit'].includes(d.status));
  }

  async acceptDelivery(deliveryId: string, riderId: string) {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    if (delivery.status !== 'pending') {
      throw new Error('Delivery is no longer available');
    }

    delivery.status = 'accepted';
    delivery.riderId = riderId;
    this.saveData();

    return { success: true, delivery };
  }

  async updateDeliveryStatus(deliveryId: string, status: Delivery['status']) {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    delivery.status = status;
    this.saveData();

    return { success: true, delivery };
  }

  // Wallet methods
  async getWalletBalance(userId: string) {
    // Mock wallet balance
    const user = this.users.find(u => u.id === userId);
    if (!user) return { balance: 0 };

    // Return mock balance based on user type
    const balances = {
      customer: 25000,
      rider: 15750,
      sme: 50000
    };

    return { balance: balances[user.userType] || 0 };
  }

  async getRiderEarnings(riderId: string) {
    const completedDeliveries = this.deliveries.filter(d => 
      d.riderId === riderId && d.status === 'delivered'
    );

    const todayDeliveries = completedDeliveries.filter(d => {
      const today = new Date();
      const deliveryDate = new Date(d.createdAt);
      return deliveryDate.toDateString() === today.toDateString();
    });

    const todayEarnings = todayDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
    const wallet = await this.getWalletBalance(riderId);

    return {
      wallet,
      completedDeliveries: completedDeliveries.length,
      todayEarnings
    };
  }

  // SME methods
  async purchaseUnits(userId: string, units: number, totalCost: number, paymentMethod: string) {
    // Mock purchase
    return { success: true, units, totalCost };
  }

  async getSMEUnits(userId: string) {
    // Mock SME units
    return { units: 25, totalPurchased: 150, totalUsed: 125 };
  }
}

// Create singleton instance
const localDB = new LocalStorageDB();

// API call wrapper that uses localStorage
export async function localApiCall(endpoint: string, options: any = {}) {
  const { method = 'GET', body } = options;
  const data = body ? JSON.parse(body) : {};

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    switch (endpoint) {
      case '/auth/signup':
        return await localDB.signup(data);
      
      case '/auth/login':
        return await localDB.login(data.email, data.password);
      
      case '/auth/logout':
        return await localDB.logout();
      
      case '/auth/test':
        return { success: true, user: localDB.getCurrentUser() };
      
      case '/deliveries/available':
        return await localDB.getAvailableDeliveries();
      
      case '/rider/active-delivery':
        const currentUser = localDB.getCurrentUser();
        if (!currentUser) throw new Error('Not authenticated');
        return await localDB.getActiveDelivery(currentUser.id);
      
      case '/rider/earnings':
        const user = localDB.getCurrentUser();
        if (!user) throw new Error('Not authenticated');
        return await localDB.getRiderEarnings(user.id);
      
      case '/delivery/create':
        return await localDB.createDelivery(data);
      
      default:
        if (endpoint.startsWith('/delivery/') && endpoint.endsWith('/accept')) {
          const deliveryId = endpoint.split('/')[2];
          const currentUser = localDB.getCurrentUser();
          if (!currentUser) throw new Error('Not authenticated');
          return await localDB.acceptDelivery(deliveryId, currentUser.id);
        }
        
        if (endpoint.startsWith('/wallet/')) {
          const userId = endpoint.split('/')[2];
          return await localDB.getWalletBalance(userId);
        }
        
        if (endpoint === '/sme/purchase-units') {
          const currentUser = localDB.getCurrentUser();
          if (!currentUser) throw new Error('Not authenticated');
          return await localDB.purchaseUnits(currentUser.id, data.units, data.totalCost, data.paymentMethod);
        }
        
        if (endpoint === '/sme/units') {
          const currentUser = localDB.getCurrentUser();
          if (!currentUser) throw new Error('Not authenticated');
          return await localDB.getSMEUnits(currentUser.id);
        }
        
        throw new Error(`Endpoint not found: ${endpoint}`);
    }
  } catch (error: any) {
    console.error('LocalDB API Error:', error);
    throw error;
  }
}

// Mock auth object similar to Supabase
export const localAuth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const result = await localDB.login(email, password);
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  },

  async signOut() {
    try {
      await localDB.logout();
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  async getSession() {
    try {
      const session = localDB.getSession();
      return { data: { session: session.session, user: session.user }, error: null };
    } catch (error: any) {
      return { data: { session: null, user: null }, error: { message: error.message } };
    }
  },

  async setSession({ access_token, refresh_token }: { access_token: string; refresh_token: string }) {
    return { data: { session: { access_token, refresh_token } }, error: null };
  }
};

export { localDB };