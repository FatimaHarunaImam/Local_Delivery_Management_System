import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Menu, User, MapPin, Clock, Truck, Package, Eye, CheckCircle, AlertCircle, Navigation, Phone, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { NotificationBanner } from "./NotificationBanner";

interface DispatchRider {
  id: string;
  name: string;
  rating: number;
  eta: string;
  position: { x: number; y: number };
  vehicle: string;
  status: "available" | "busy";
}

interface ActiveDelivery {
  id: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered';
  pickup: string;
  dropoff: string;
  amount: number;
  createdAt: string;
  riderName?: string;
  riderPhone?: string;
}

interface CustomerHomeScreenProps {
  user: any;
  onSendPackage: () => void;
  onMenu: () => void;
  onProfile: () => void;
}

export function CustomerHomeScreen({ user, onSendPackage, onMenu, onProfile }: CustomerHomeScreenProps) {
  const [riders, setRiders] = useState<DispatchRider[]>([
    { id: "1", name: "Muhammad Bello", rating: 4.9, eta: "2 min", position: { x: 45, y: 30 }, vehicle: "Motorcycle", status: "available" },
    { id: "2", name: "Ahmed Usman", rating: 4.8, eta: "4 min", position: { x: 25, y: 60 }, vehicle: "Bicycle", status: "available" },
    { id: "3", name: "Abdallah Garba", rating: 4.7, eta: "3 min", position: { x: 70, y: 40 }, vehicle: "Van", status: "busy" },
    { id: "4", name: "Hayat Ibrahim", rating: 5.0, eta: "5 min", position: { x: 35, y: 75 }, vehicle: "Motorcycle", status: "available" },
    { id: "5", name: "Yusuf Aliyu", rating: 4.6, eta: "6 min", position: { x: 60, y: 20 }, vehicle: "Bicycle", status: "available" },
  ]);

  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load deliveries from localStorage and simulate real-time updates
  useEffect(() => {
    loadActiveDeliveries();
    
    // Real-time updates every 5 seconds
    const interval = setInterval(() => {
      loadActiveDeliveries();
      updateRiderPositions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadActiveDeliveries = () => {
    try {
      const savedDeliveries = localStorage.getItem('userDeliveries');
      if (savedDeliveries) {
        const deliveries = JSON.parse(savedDeliveries);
        const activeOnes = deliveries.filter((d: ActiveDelivery) => 
          d.status !== 'delivered' && d.status !== 'cancelled'
        );
        setActiveDeliveries(activeOnes);
      }
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  const updateRiderPositions = () => {
    setRiders(prev => prev.map(rider => ({
      ...rider,
      position: {
        x: Math.max(10, Math.min(90, rider.position.x + (Math.random() - 0.5) * 4)),
        y: Math.max(10, Math.min(90, rider.position.y + (Math.random() - 0.5) * 4))
      }
    })));
  };

  const refreshDeliveries = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadActiveDeliveries();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'picked_up': return <Package className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const openMapNavigation = (address: string, label: string) => {
    const encodedAddress = encodeURIComponent(`${address}, Gombe, Nigeria`);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      const googleMapsApp = `comgooglemaps://?q=${encodedAddress}`;
      const googleMapsWeb = `https://maps.google.com/maps?q=${encodedAddress}`;
      
      const tempLink = document.createElement('a');
      tempLink.href = googleMapsApp;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      
      setTimeout(() => {
        window.open(googleMapsWeb, '_blank');
      }, 500);
    } else {
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  };

  const callRider = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const availableRiders = riders.filter(rider => rider.status === "available");

  return (
    <div className="min-h-screen bg-background">
      <NotificationBanner showOfflineMode={true} showRealTimeUpdates={true} />
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10 text-white hover:bg-white/20"
            onClick={onMenu}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">JetDash</h1>
              <p className="text-orange-100 text-sm">Fast Delivery</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 text-white hover:bg-white/20"
              onClick={onProfile}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* User greeting */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-white">
            Hello, {user?.name?.split(' ')[0] || 'Customer'}! 👋
          </h2>
          <p className="text-orange-100">Ready to send your package?</p>
        </div>
      </div>

      {/* Active Deliveries Section */}
      {activeDeliveries.length > 0 && (
        <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--jetdash-brown)]">
              Your Active Deliveries ({activeDeliveries.length})
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshDeliveries}
              disabled={isLoading}
              className="w-8 h-8"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <Card key={delivery.id} className="shadow-lg border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--jetdash-brown)]">
                          Delivery #{delivery.id.slice(-8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(delivery.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(delivery.status)} border-0`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(delivery.status)}
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Pickup</p>
                        <p className="text-sm text-gray-600">{delivery.pickup}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMapNavigation(delivery.pickup, 'Pickup Location')}
                        className="text-green-600 border-green-200"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Drop-off</p>
                        <p className="text-sm text-gray-600">{delivery.dropoff}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openMapNavigation(delivery.dropoff, 'Drop-off Location')}
                        className="text-red-600 border-red-200"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="font-bold text-[var(--jetdash-brown)]">₦{delivery.amount?.toLocaleString()}</p>
                    </div>
                    {delivery.riderName && (
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-sm font-medium text-right">{delivery.riderName}</p>
                          <p className="text-xs text-muted-foreground">Your rider</p>
                        </div>
                        {delivery.riderPhone && (
                          <Button
                            size="sm"
                            onClick={() => callRider(delivery.riderPhone)}
                            className="bg-[var(--jetdash-brown)] text-white"
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Location */}
      <div className="px-6 py-3 bg-[var(--jetdash-light-orange)]/20">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[var(--jetdash-brown)]" />
          <span className="text-sm text-[var(--jetdash-brown)]">Your location: Pantami, Gombe</span>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-96 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden">
        {/* Mock map background with grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(#ddd 1px, transparent 1px),
              linear-gradient(90deg, #ddd 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Your location marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-[var(--jetdash-brown)] rounded-full border-4 border-white shadow-lg"></div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-[var(--jetdash-brown)] bg-white px-2 py-1 rounded-lg shadow-sm whitespace-nowrap">
            You are here
          </div>
        </div>

        {/* Dispatch rider markers */}
        {riders.map((rider) => (
          <div
            key={rider.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ease-in-out"
            style={{
              left: `${rider.position.x}%`,
              top: `${rider.position.y}%`
            }}
          >
            <div className="relative">
              <div className={`w-8 h-8 ${rider.status === 'available' ? 'bg-[var(--jetdash-orange)]' : 'bg-gray-400'} rounded-full border-2 border-white shadow-lg flex items-center justify-center`}>
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-[var(--jetdash-brown)] bg-white px-2 py-1 rounded-lg shadow-sm whitespace-nowrap">
                {rider.eta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Location Input */}
      <div className="px-6 py-4 bg-white shadow-sm">
        <div className="space-y-3">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            <Input 
              placeholder="Pickup location"
              className="pl-10 h-12 bg-[var(--input-background)] border-0 rounded-xl"
              defaultValue="Current location (Pantami)"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
            <Input 
              placeholder="Delivery address (e.g., Gombe Central, Tudun Wada)"
              className="pl-10 h-12 bg-[var(--input-background)] border-0 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Available Dispatch Riders */}
      <div className="px-6 py-4">
        <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">
          Available Dispatch Riders ({availableRiders.length})
        </h3>
        
        <div className="space-y-3">
          {availableRiders.slice(0, 3).map((rider) => (
            <Card key={rider.id} className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-[var(--jetdash-brown)]">{rider.name}</span>
                        <span className="text-sm text-amber-500">★ {rider.rating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rider.vehicle}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{rider.eta}</span>
                    </div>
                    <div className="w-2 h-2 bg-[var(--jetdash-green)] rounded-full mt-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Send Package Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <Button 
          onClick={onSendPackage}
          className="w-full h-14 bg-gradient-to-r from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] text-white hover:from-[var(--jetdash-deep-brown)] hover:to-[var(--jetdash-brown)] rounded-2xl text-lg font-semibold shadow-lg"
        >
          <Package className="w-5 h-5 mr-2" />
          Send Package
        </Button>
      </div>
    </div>
  );
}