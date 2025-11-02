import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { 
  Menu, 
  User, 
  DollarSign, 
  MapPin, 
  Clock, 
  Package,
  Star,
  Bell,
  Wallet,
  LogOut,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Navigation,
  Phone,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import jetdashLogo from "figma:asset/65d0158fe7ae208ff3fd9bd401c0ba4ecb4059c8.png";
import { apiCall } from "../utils/supabase/client";
import { NotificationBanner } from "./NotificationBanner";

interface RiderHomeScreenProps {
  user: any;
  onViewRequest: (delivery: any) => void;
  onViewEarnings: () => void;
  onWallet: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

export function RiderHomeScreen({ 
  user, 
  onViewRequest, 
  onViewEarnings, 
  onWallet, 
  onProfile,
  onLogout 
}: RiderHomeScreenProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [availableDeliveries, setAvailableDeliveries] = useState<any[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchRiderData = async () => {
    try {
      setRefreshing(true);
      setError("");

      // Fetch available deliveries
      try {
        const deliveries = await apiCall('/deliveries/available');
        setAvailableDeliveries(Array.isArray(deliveries) ? deliveries : []);
      } catch (deliveryError) {
        console.log('Using mock deliveries for demo:', deliveryError);
        // Add some mock deliveries for demo purposes
        const mockDeliveries = [
          {
            id: 'mock-1',
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
            id: 'mock-2',
            packageSize: 'Small',
            deliveryFee: 600,
            pickup: 'Gombe Central Market',
            dropoff: 'Tudun Wada, Gombe',
            receiverName: 'Fatima Ali',
            receiverPhone: '+234 805 987 6543',
            createdAt: new Date(Date.now() - 600000).toISOString(),
            paymentStatus: 'completed'
          }
        ];
        setAvailableDeliveries(mockDeliveries);
      }

      // Fetch active delivery
      try {
        const active = await apiCall('/rider/active-delivery');
        setActiveDelivery(active);
      } catch (activeError) {
        console.log('No active delivery or error:', activeError);
      }

      // Fetch earnings
      try {
        const earningsData = await apiCall('/rider/earnings');
        setEarnings(earningsData);
      } catch (earningsError) {
        console.log('Using mock earnings:', earningsError);
        setEarnings({
          wallet: { balance: 15750 },
          completedDeliveries: 47,
          todayEarnings: 2400
        });
      }

    } catch (error: any) {
      console.error('Failed to fetch rider data:', error);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRiderData();
    
    // Start real-time updates with Supabase Realtime
    const { simulateRealTimeUpdates } = require('../utils/supabase/client');
    const cleanup = simulateRealTimeUpdates();
    
    // Listen for real-time delivery updates
    const handleDeliveryUpdate = (event: any) => {
      console.log('📡 Real-time delivery update received, refreshing data...');
      fetchRiderData();
    };
    
    const handleNewDelivery = (event: any) => {
      console.log('📡 New delivery request received!', event.detail);
      fetchRiderData();
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '🚀 New delivery request available!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    };
    
    const handlePollingUpdate = () => {
      if (isOnline) {
        fetchRiderData();
      }
    };
    
    window.addEventListener('deliveryUpdate', handleDeliveryUpdate);
    window.addEventListener('newDeliveryRequest', handleNewDelivery);
    window.addEventListener('pollingUpdate', handlePollingUpdate);
    
    // Reduced polling since we have real-time updates now
    // Only poll every 10 seconds as backup
    const interval = setInterval(() => {
      if (isOnline) {
        fetchRiderData();
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      cleanup();
      window.removeEventListener('deliveryUpdate', handleDeliveryUpdate);
      window.removeEventListener('newDeliveryRequest', handleNewDelivery);
      window.removeEventListener('pollingUpdate', handlePollingUpdate);
    };
  }, [isOnline]);

  const acceptDelivery = async (deliveryId: string) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, simulate the acceptance process
      const deliveryToAccept = availableDeliveries.find(d => d.id === deliveryId);
      if (!deliveryToAccept) {
        alert('Delivery not found');
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create accepted delivery object
      const acceptedDelivery = {
        ...deliveryToAccept,
        status: 'accepted',
        riderId: user?.id,
        riderName: user?.name,
        acceptedAt: new Date().toISOString()
      };

      // Remove from available deliveries and set as active
      setAvailableDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      setActiveDelivery(acceptedDelivery);
      
      // Show success message
      alert('Delivery accepted successfully! You can now start the delivery process.');
      
      // Navigate to active delivery screen
      onViewRequest(acceptedDelivery);
      
    } catch (error: any) {
      console.error('Failed to accept delivery:', error);
      alert('Failed to accept delivery. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const openMapNavigation = (address: string, label: string) => {
    const encodedAddress = encodeURIComponent(`${address}, Gombe, Nigeria`);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open Google Maps app first, fallback to web
      const googleMapsApp = `comgooglemaps://?q=${encodedAddress}`;
      const googleMapsWeb = `https://maps.google.com/maps?q=${encodedAddress}`;
      
      // Create a temporary link to try the app
      const tempLink = document.createElement('a');
      tempLink.href = googleMapsApp;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      
      // Fallback to web after a short delay
      setTimeout(() => {
        window.open(googleMapsWeb, '_blank');
      }, 500);
    } else {
      // Desktop - open Google Maps in new tab
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  };

  const callCustomer = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const getPackageIcon = (size: string) => {
    switch (size?.toLowerCase()) {
      case 'small': return '📄';
      case 'medium': return '📦';
      case 'large': return '📦';
      default: return '📦';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--jetdash-orange)] mx-auto"></div>
          <p className="text-muted-foreground">Loading rider dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <NotificationBanner showOfflineMode={true} showRealTimeUpdates={true} />
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <img 
                src={jetdashLogo} 
                alt="JetDash" 
                className="w-8 h-8"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Hello, {user?.name?.split(' ')[0] || 'Rider'}! 👋
              </h1>
              <p className="text-orange-100 text-sm">Ready to earn today?</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onWallet}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white"
            >
              <Wallet className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={fetchRiderData}
              disabled={refreshing}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onProfile}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Online Status Toggle - Premium Design with Switch */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-[var(--jetdash-green)] animate-pulse' : 'bg-gray-400'}`}></div>
              <div>
                <p className="font-medium text-white">
                  {isOnline ? 'You\'re Online' : 'You\'re Offline'}
                </p>
                <p className="text-xs text-orange-100">
                  {isOnline ? 'Actively receiving delivery requests' : 'Not receiving new requests'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-orange-100 font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <Switch
                checked={isOnline}
                onCheckedChange={setIsOnline}
                className="data-[state=checked]:bg-[var(--jetdash-green)] data-[state=unchecked]:bg-gray-500 scale-125"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Today's Stats - Premium Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] text-white hover:scale-105 transition-transform duration-300" onClick={onViewEarnings}>
            <CardContent className="p-4 text-center cursor-pointer">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                ₦{(earnings?.wallet?.balance || 0).toLocaleString()}
              </p>
              <p className="text-xs text-orange-100">Wallet Balance</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-[var(--jetdash-green)] to-green-500 text-white hover:scale-105 transition-transform duration-300" onClick={onViewEarnings}>
            <CardContent className="p-4 text-center cursor-pointer">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                {earnings?.completedDeliveries || 0}
              </p>
              <p className="text-xs text-green-100">Completed Today</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-amber-400 to-yellow-500 text-white hover:scale-105 transition-transform duration-300" onClick={onViewEarnings}>
            <CardContent className="p-4 text-center cursor-pointer">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">4.8</p>
              <p className="text-xs text-yellow-100">Your Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Earnings Quick View */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Today's Earnings</p>
                <p className="text-3xl font-bold text-white">₦{(earnings?.todayEarnings || 0).toLocaleString()}</p>
                <p className="text-orange-100 text-xs mt-1">
                  {earnings?.completedDeliveries || 0} deliveries completed
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-[var(--jetdash-orange)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Delivery - Enhanced Design */}
        {activeDelivery && (
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-[var(--jetdash-light-orange)]/10 to-[var(--jetdash-orange)]/10 border-l-4 border-l-[var(--jetdash-orange)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--jetdash-orange)] rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--jetdash-brown)]">Active Delivery</h3>
                    <p className="text-xs text-muted-foreground">#{activeDelivery.id?.slice(-8) || 'DEL-001'}</p>
                  </div>
                </div>
                <Badge className="bg-[var(--jetdash-orange)] text-white px-3 py-1 rounded-full">
                  {activeDelivery.status === 'accepted' ? 'Accepted' : 
                   activeDelivery.status === 'picked_up' ? 'Picked Up' : 
                   activeDelivery.status === 'in_transit' ? 'In Transit' : 'Active'}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">Pickup Location</p>
                      <p className="text-sm text-gray-600">{activeDelivery.pickup}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMapNavigation(activeDelivery.pickup, 'Pickup Location');
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-800">Drop-off Location</p>
                      <p className="text-sm text-gray-600">{activeDelivery.dropoff}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMapNavigation(activeDelivery.dropoff, 'Drop-off Location');
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] p-4 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-orange-100 text-sm">Your Earning</p>
                      <p className="text-2xl font-bold text-white">
                        ₦{(activeDelivery.riderEarning || activeDelivery.deliveryFee || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => onViewRequest(activeDelivery)}
                className="w-full mt-6 h-12 bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] text-white hover:from-[var(--jetdash-light-orange)] hover:to-[var(--jetdash-orange)] rounded-xl font-semibold shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Continue Delivery
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Deliveries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--jetdash-brown)]">
              Available Deliveries
            </h3>
            {refreshing && (
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>

          {error && (
            <Card className="shadow-sm border-0 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!isOnline ? (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <WifiOff className="w-10 h-10 text-gray-500" />
                </div>
                <h4 className="text-xl font-bold text-[var(--jetdash-brown)] mb-3">
                  You're Offline
                </h4>
                <p className="text-muted-foreground mb-6">
                  Go online to start receiving delivery requests and earn money
                </p>
                <Button 
                  onClick={() => setIsOnline(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                  <Wifi className="w-5 h-5 mr-2" />
                  Go Online Now
                </Button>
              </CardContent>
            </Card>
          ) : availableDeliveries.length === 0 ? (
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-[var(--jetdash-light-green)]/20 to-[var(--jetdash-green)]/10">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-[var(--jetdash-green)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-[var(--jetdash-green)]" />
                </div>
                <h4 className="text-xl font-bold text-[var(--jetdash-brown)] mb-3">
                  No Deliveries Available
                </h4>
                <p className="text-muted-foreground mb-4">
                  New delivery requests will appear here automatically
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-[var(--jetdash-green)]">
                  <div className="w-2 h-2 bg-[var(--jetdash-green)] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[var(--jetdash-green)] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[var(--jetdash-green)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="ml-2">Waiting for new deliveries...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {availableDeliveries.map((delivery, index) => (
                <Card 
                  key={delivery.id} 
                  className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:scale-102 bg-gradient-to-br from-white to-gray-50"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">{getPackageIcon(delivery.packageSize)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-[var(--jetdash-brown)] text-lg">
                            {delivery.packageSize || 'Medium'} Package
                          </p>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {formatTimeAgo(delivery.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">
                          ₦{delivery.deliveryFee?.toLocaleString() || '600'}
                        </p>
                        <p className="text-xs text-green-600 font-medium">Your Earning</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Pickup</p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.pickup || 'Pickup location'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMapNavigation(delivery.pickup || 'Pickup location', 'Pickup Location');
                          }}
                          className="text-[var(--jetdash-green)] border-[var(--jetdash-green)]/30"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Drop off</p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.dropoff || 'Delivery location'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMapNavigation(delivery.dropoff || 'Delivery location', 'Drop-off Location');
                          }}
                          className="text-[var(--jetdash-orange)] border-[var(--jetdash-orange)]/30"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                      
                      {delivery.receiverName && (
                        <div className="flex items-start space-x-3">
                          <User className="w-4 h-4 text-[var(--jetdash-brown)] mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Receiver</p>
                            <p className="text-sm text-muted-foreground">
                              {delivery.receiverName}
                            </p>
                          </div>
                          {delivery.receiverPhone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                callCustomer(delivery.receiverPhone);
                              }}
                              className="text-[var(--jetdash-brown)] border-[var(--jetdash-brown)]/30"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>~15 min trip</span>
                      </div>
                      
                      {delivery.paymentStatus === 'completed' && (
                        <div className="flex items-center space-x-1 text-[var(--jetdash-green)]">
                          <span>✓ Paid</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => acceptDelivery(delivery.id)}
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] text-white hover:from-[var(--jetdash-light-orange)] hover:to-[var(--jetdash-orange)] rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Accepting...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Accept Delivery
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deliveries */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--jetdash-brown)] mb-4">
            Recent Deliveries
          </h3>
          
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { name: 'Hauwa Musa', time: '1 hour ago', location: 'Federal Lowcost', amount: 850, status: 'completed' },
                  { name: 'Aisha Bala', time: '2 hours ago', location: 'Tudun Wada', amount: 750, status: 'completed' },
                  { name: 'Muhammad Ali', time: '4 hours ago', location: 'Pantami District', amount: 900, status: 'completed' },
                  { name: 'Fatima Ibrahim', time: '6 hours ago', location: 'Gombe Central', amount: 650, status: 'completed' }
                ].map((delivery, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[var(--jetdash-orange)]/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-[var(--jetdash-orange)]">
                          {delivery.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--jetdash-brown)]">{delivery.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{delivery.time}</span>
                          <span>•</span>
                          <span>{delivery.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--jetdash-green)]">₦{delivery.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-[var(--jetdash-orange)] text-[var(--jetdash-orange)] hover:bg-[var(--jetdash-orange)] hover:text-white"
                onClick={onViewEarnings}
              >
                View All Deliveries
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-[var(--jetdash-green)] to-green-500 text-white cursor-pointer hover:scale-105 transition-transform duration-300" onClick={onViewEarnings}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white">Detailed Earnings</p>
              <p className="text-xs text-green-100">View reports & history</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-xl border-0 bg-gradient-to-br from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] text-white cursor-pointer hover:scale-105 transition-transform duration-300" onClick={onWallet}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-white">Wallet</p>
              <p className="text-xs text-orange-100">Manage your money</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}