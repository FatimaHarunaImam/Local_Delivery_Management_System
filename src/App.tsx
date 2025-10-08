import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { CustomerHomeScreen } from './components/CustomerHomeScreen';
import { BookingScreen } from './components/BookingScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { CompletionScreen } from './components/CompletionScreen';
import { RiderHomeScreen } from './components/RiderHomeScreen';
import { IncomingRequestScreen } from './components/IncomingRequestScreen';
import { ActiveDeliveryScreen } from './components/ActiveDeliveryScreen';
import { EarningsScreen } from './components/EarningsScreen';
import { WalletScreen } from './components/WalletScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { SMEDashboard } from './components/SMEDashboard';
import { SMEPurchaseUnits } from './components/SMEPurchaseUnits';
import { SMECreateDelivery } from './components/SMECreateDelivery';
import { SMECreateMultipleDelivery } from './components/SMECreateMultipleDelivery';
import { MenuScreen } from './components/MenuScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthDebug } from './components/AuthDebug';
import { supabase, apiCall } from './utils/supabase/client';
import { localAuth, localApiCall } from './utils/localStorage/client';

type Screen = 
  | 'landing'
  | 'welcome'
  | 'login'
  | 'signup'
  | 'customer-home'
  | 'booking'
  | 'payment'
  | 'confirmation'
  | 'completion'
  | 'rider-home'
  | 'incoming-request'
  | 'active-delivery'
  | 'earnings'
  | 'wallet'
  | 'sme-dashboard'
  | 'sme-purchase-units'
  | 'sme-create-delivery'
  | 'sme-create-multiple-delivery'
  | 'menu'
  | 'profile'
  | 'auth-debug';

type UserType = 'customer' | 'rider' | 'sme' | null;

interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  phone: string;
}

interface DeliveryBooking {
  pickup: string;
  dropoff: string;
  packageSize: string;
  packageDescription: string;
  receiverName: string;
  receiverPhone: string;
  riderId: string;
  riderName: string;
  deliveryFee: number;
  paymentMethod: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userType, setUserType] = useState<UserType>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBooking, setCurrentBooking] = useState<DeliveryBooking | null>(null);

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
    
    // Start real-time simulation for the app
    try {
      import('./utils/supabase/client').then(({ simulateRealTimeUpdates }) => {
        try {
          const cleanup = simulateRealTimeUpdates();
          
          // Store cleanup function for later use
          (window as any).cleanupRealTime = cleanup;
        } catch (simError) {
          console.log('Real-time simulation failed to start:', simError);
        }
      }).catch(importError => {
        console.log('Failed to import real-time utilities:', importError);
      });
    } catch (error) {
      console.log('Failed to start real-time updates:', error);
    }
    
    // Fallback timeout to prevent indefinite loading
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout reached, showing landing page');
        setIsLoading(false);
        setCurrentScreen('landing');
      }
    }, 2000); // Further reduced to 2 second timeout for better UX
    
    return () => {
      clearTimeout(fallbackTimeout);
      // Cleanup real-time updates when app unmounts
      if ((window as any).cleanupRealTime) {
        (window as any).cleanupRealTime();
      }
    };
  }, []);

  const checkSession = async () => {
    try {
      // Skip session check for now to prevent fetch errors
      // This allows the app to work completely offline
      console.log('Skipping session check - running in offline demo mode');
      
      // Check for any locally stored user data (for demo purposes)
      const localUser = localStorage.getItem('jetdash_demo_user');
      if (localUser) {
        try {
          const userData = JSON.parse(localUser);
          setUser(userData);
          setUserType(userData.userType);
          
          const homeScreen = userData.userType === 'customer' ? 'customer-home' 
                           : userData.userType === 'rider' ? 'rider-home' 
                           : 'sme-dashboard';
          setCurrentScreen(homeScreen);
          return;
        } catch (parseError) {
          console.log('Failed to parse local user data');
          localStorage.removeItem('jetdash_demo_user');
        }
      }
      
      // No session found, show landing page
      setCurrentScreen('landing');
      
      /* Comment out Supabase session check to prevent fetch errors
      
      // Set a timeout for session check to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 3000)
      );
      
      const { data: { session }, error } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error('Session error:', error);
        // Clear any invalid session
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.log('Sign out failed:', signOutError);
        }
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        const userData = session.user.user_metadata;
        const userObj = {
          id: session.user.id,
          email: session.user.email || '',
          name: userData.name || '',
          userType: userData.userType || 'customer',
          phone: userData.phone || ''
        };
        
        setUser(userObj);
        setUserType(userData.userType || 'customer');
        
        // Navigate to appropriate home screen
        const homeScreen = userData.userType === 'customer' ? 'customer-home' 
                         : userData.userType === 'rider' ? 'rider-home' 
                         : 'sme-dashboard';
        setCurrentScreen(homeScreen);
      }
      
      */
      
    } catch (error: any) {
      console.log('Session check failed, continuing to landing page:', error?.message || error);
      // Clear any corrupted session data
      setUser(null);
      setUserType(null);
      setCurrentScreen('landing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    setCurrentScreen('signup');
  };

  const handleLogin = async (selectedUserType: 'customer' | 'rider' | 'sme', userData: User) => {
    setUserType(selectedUserType);
    setUser(userData);
    
    // Store user data locally for demo persistence
    localStorage.setItem('jetdash_demo_user', JSON.stringify(userData));
    
    const homeScreen = selectedUserType === 'customer' ? 'customer-home' 
                     : selectedUserType === 'rider' ? 'rider-home' 
                     : 'sme-dashboard';
    setCurrentScreen(homeScreen);
  };

  const handleSignup = async (selectedUserType: 'customer' | 'rider' | 'sme', userData: User) => {
    setUserType(selectedUserType);
    setUser(userData);
    
    // Store user data locally for demo persistence
    localStorage.setItem('jetdash_demo_user', JSON.stringify(userData));
    
    const homeScreen = selectedUserType === 'customer' ? 'customer-home' 
                     : selectedUserType === 'rider' ? 'rider-home' 
                     : 'sme-dashboard';
    setCurrentScreen(homeScreen);
  };

  const handleLogout = async () => {
    try {
      // Clear local demo data
      localStorage.removeItem('jetdash_demo_user');
      
      // Attempt Supabase sign out (but don't fail if it doesn't work)
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.log('Supabase sign out failed (offline mode):', supabaseError);
      }
      
      setUserType(null);
      setUser(null);
      setCurrentScreen('landing');
    } catch (error) {
      console.error('Logout error:', error);
      // Still proceed with logout even if there's an error
      setUserType(null);
      setUser(null);
      setCurrentScreen('landing');
    }
  };

  const navigateToHome = () => {
    const homeScreen = userType === 'customer' ? 'customer-home' 
                     : userType === 'rider' ? 'rider-home' 
                     : 'sme-dashboard';
    setCurrentScreen(homeScreen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--jetdash-brown)] to-[var(--jetdash-orange)] rounded-2xl flex items-center justify-center">
            <div className="text-white text-2xl font-bold">J</div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--jetdash-brown)] mb-2">JetDash</h2>
            <p className="text-muted-foreground">Loading your delivery experience...</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-[var(--jetdash-orange)] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[var(--jetdash-orange)] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-[var(--jetdash-orange)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} onLogin={() => setCurrentScreen('login')} />;
        
      case 'welcome':
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
        
      case 'login':
        return (
          <LoginScreen
            onBack={() => setCurrentScreen('landing')}
            onLogin={handleLogin}
            onSwitchToSignup={() => setCurrentScreen('signup')}
          />
        );
        
      case 'signup':
        return (
          <SignupScreen
            onBack={() => setCurrentScreen('landing')}
            onSignup={handleSignup}
            onSwitchToLogin={() => setCurrentScreen('login')}
          />
        );
        
      case 'customer-home':
        return (
          <CustomerHomeScreen
            user={user}
            onSendPackage={() => setCurrentScreen('booking')}
            onMenu={() => setCurrentScreen('menu')}
            onProfile={() => setCurrentScreen('profile')}
          />
        );
        
      case 'wallet':
        return (
          <WalletScreen
            user={user}
            onBack={navigateToHome}
          />
        );
        
      case 'menu':
        return (
          <MenuScreen
            userType={userType}
            onBack={navigateToHome}
            onProfile={() => setCurrentScreen('profile')}
            onWallet={() => setCurrentScreen('wallet')}
            onOrderHistory={() => {}}
            onSettings={() => {}}
            onHelp={() => {}}
            onLogout={handleLogout}
          />
        );
        
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onBack={navigateToHome}
            onLogout={handleLogout}
          />
        );
        
      case 'booking':
        return (
          <BookingScreen
            onBack={() => setCurrentScreen('customer-home')}
            onConfirmDelivery={(bookingData) => {
              setCurrentBooking(bookingData);
              if (bookingData.paymentMethod === 'online') {
                setCurrentScreen('payment');
              } else {
                setCurrentScreen('confirmation');
              }
            }}
          />
        );

      case 'payment':
        return currentBooking ? (
          <PaymentScreen
            onBack={() => setCurrentScreen('booking')}
            onPaymentSuccess={() => setCurrentScreen('confirmation')}
            deliveryData={{
              id: '', // Will be created during payment
              amount: currentBooking.paymentMethod === 'online' 
                ? Math.round(currentBooking.deliveryFee * 1.1) 
                : currentBooking.deliveryFee,
              deliveryFee: currentBooking.deliveryFee,
              riderId: currentBooking.riderId,
              description: `${currentBooking.packageSize} package delivery`,
              pickup: currentBooking.pickup,
              dropoff: currentBooking.dropoff,
              packageSize: currentBooking.packageSize,
              packageDescription: currentBooking.packageDescription,
              receiverName: currentBooking.receiverName,
              receiverPhone: currentBooking.receiverPhone
            }}
          />
        ) : null;
        
      case 'confirmation':
        return (
          <ConfirmationScreen
            user={user}
            onDeliveryComplete={() => setCurrentScreen('completion')}
            onCancel={() => setCurrentScreen('customer-home')}
          />
        );
        
      case 'completion':
        return (
          <CompletionScreen
            onBackToHome={() => setCurrentScreen('customer-home')}
          />
        );
        
      case 'rider-home':
        return (
          <RiderHomeScreen
            user={user}
            onViewRequest={(delivery) => {
              // Store the delivery if needed and navigate to active delivery
              setCurrentScreen('active-delivery');
            }}
            onViewEarnings={() => setCurrentScreen('earnings')}
            onWallet={() => setCurrentScreen('wallet')}
            onProfile={() => setCurrentScreen('profile')}
            onLogout={handleLogout}
          />
        );
        
      case 'incoming-request':
        return (
          <IncomingRequestScreen
            user={user}
            onBack={() => setCurrentScreen('rider-home')}
            onAccept={() => setCurrentScreen('active-delivery')}
            onDecline={() => setCurrentScreen('rider-home')}
          />
        );
        
      case 'active-delivery':
        return (
          <ActiveDeliveryScreen
            user={user}
            onBack={() => setCurrentScreen('rider-home')}
            onCompleteDelivery={() => setCurrentScreen('rider-home')}
          />
        );
        
      case 'earnings':
        return (
          <EarningsScreen
            user={user}
            onBack={() => setCurrentScreen('rider-home')}
            onWallet={() => setCurrentScreen('wallet')}
          />
        );

      case 'sme-dashboard':
        return (
          <SMEDashboard
            user={user}
            onPurchaseUnits={() => setCurrentScreen('sme-purchase-units')}
            onCreateDelivery={() => setCurrentScreen('sme-create-delivery')}
            onCreateMultipleDelivery={() => setCurrentScreen('sme-create-multiple-delivery')}
            onWallet={() => setCurrentScreen('wallet')}
            onProfile={() => setCurrentScreen('profile')}
            onMenu={() => setCurrentScreen('menu')}
          />
        );

      case 'sme-purchase-units':
        return (
          <SMEPurchaseUnits
            user={user}
            onBack={() => setCurrentScreen('sme-dashboard')}
            onPurchaseComplete={() => setCurrentScreen('sme-dashboard')}
          />
        );

      case 'sme-create-delivery':
        return (
          <SMECreateDelivery
            user={user}
            onBack={() => setCurrentScreen('sme-dashboard')}
            onDeliveryCreated={() => setCurrentScreen('sme-dashboard')}
          />
        );

      case 'sme-create-multiple-delivery':
        return (
          <SMECreateMultipleDelivery
            user={user}
            onBack={() => setCurrentScreen('sme-dashboard')}
            onDeliveryCreated={() => setCurrentScreen('sme-dashboard')}
          />
        );

      case 'auth-debug':
        return <AuthDebug />;
        
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen h-full bg-background">
      {renderScreen()}
    </div>
  );
}