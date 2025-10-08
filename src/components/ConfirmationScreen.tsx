import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Phone, MessageCircle, Navigation, Clock, MapPin, Package, AlertCircle } from "lucide-react";
import { apiCall } from "../utils/supabase/client";

interface ConfirmationScreenProps {
  user: any;
  onDeliveryComplete: () => void;
  onCancel: () => void;
}

export function ConfirmationScreen({ user, onDeliveryComplete, onCancel }: ConfirmationScreenProps) {
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchActiveDelivery = async () => {
    try {
      setRefreshing(true);
      const delivery = await apiCall('/customer/active-delivery');
      setActiveDelivery(delivery);
      setError("");
    } catch (error: any) {
      console.error('Failed to fetch active delivery:', error);
      setError("Failed to load delivery information");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveDelivery();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchActiveDelivery, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const calculateETA = (estimatedArrival: string) => {
    if (!estimatedArrival) return "Calculating...";
    
    const now = new Date();
    const arrival = new Date(estimatedArrival);
    const diffMinutes = Math.max(0, Math.ceil((arrival.getTime() - now.getTime()) / (1000 * 60)));
    
    if (diffMinutes === 0) return "Arriving now";
    if (diffMinutes === 1) return "1 minute";
    return `${diffMinutes} minutes`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return "Rider is on the way to pickup";
      case 'picked_up':
        return "Package picked up, heading to destination";
      case 'in_transit':
        return "Package is on its way to you";
      default:
        return "Processing your delivery...";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return "text-[var(--jetdash-orange)]";
      case 'picked_up':
        return "text-blue-600";
      case 'in_transit':
        return "text-[var(--jetdash-green)]";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--jetdash-orange)] mx-auto"></div>
          <p className="text-muted-foreground">Loading delivery information...</p>
        </div>
      </div>
    );
  }

  if (error || !activeDelivery) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center space-y-6 mt-20">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[var(--jetdash-brown)] mb-2">
              No Active Delivery
            </h2>
            <p className="text-muted-foreground">
              {error || "You don't have any active deliveries at the moment."}
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={fetchActiveDelivery}
              className="w-full bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)]"
            >
              Refresh
            </Button>
            <Button 
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Status Header */}
      <div className="bg-[var(--jetdash-brown)] px-6 py-8 text-white">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">{getStatusText(activeDelivery.status)}</h1>
          {activeDelivery.estimatedArrival && (
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="text-lg">ETA: {calculateETA(activeDelivery.estimatedArrival)}</span>
            </div>
          )}
          {refreshing && (
            <div className="flex items-center justify-center space-x-2 text-sm text-orange-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-200"></div>
              <span>Updating...</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Rider Info */}
        {activeDelivery.riderName && (
          <Card className="shadow-jetdash border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-white">
                    {activeDelivery.riderName.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[var(--jetdash-brown)]">{activeDelivery.riderName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-500">★ 4.8</span>
                    <span className="text-muted-foreground">• Motorcycle</span>
                  </div>
                  {activeDelivery.riderPhone && (
                    <p className="text-sm text-muted-foreground mt-1">{activeDelivery.riderPhone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-[var(--jetdash-brown)] text-[var(--jetdash-brown)]"
                  onClick={() => activeDelivery.riderPhone && window.open(`tel:${activeDelivery.riderPhone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl border-[var(--jetdash-brown)] text-[var(--jetdash-brown)]"
                  onClick={() => activeDelivery.riderPhone && window.open(`sms:${activeDelivery.riderPhone}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Details */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Delivery Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Pickup Location</p>
                  <p className="text-sm text-muted-foreground">{activeDelivery.pickup || "Pickup location"}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-sm text-muted-foreground">{activeDelivery.dropoff || "Delivery location"}</p>
                </div>
              </div>

              {activeDelivery.receiverName && (
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-[var(--jetdash-brown)] mt-0.5" />
                  <div>
                    <p className="font-medium">Receiver</p>
                    <p className="text-sm text-muted-foreground">{activeDelivery.receiverName}</p>
                    {activeDelivery.receiverPhone && (
                      <p className="text-sm text-muted-foreground">{activeDelivery.receiverPhone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-[var(--jetdash-light-orange)]/30 rounded-xl p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-[var(--jetdash-brown)]" />
                  <div>
                    <p className="font-medium text-[var(--jetdash-brown)]">Delivery Fee</p>
                    <p className="text-sm text-muted-foreground">
                      {activeDelivery.paymentStatus === 'completed' ? 'Paid online' : 'Cash on delivery'}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-[var(--jetdash-brown)]">
                  ₦{activeDelivery.deliveryFee || 600}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Progress */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Delivery Progress</h3>
            
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 ${activeDelivery.status === 'accepted' ? 'text-[var(--jetdash-orange)]' : 'text-muted-foreground'}`}>
                <div className={`w-3 h-3 rounded-full ${activeDelivery.status === 'accepted' ? 'bg-[var(--jetdash-orange)]' : 'bg-gray-300'}`}></div>
                <span className="font-medium">Order Confirmed</span>
                {activeDelivery.acceptedAt && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    {new Date(activeDelivery.acceptedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
              </div>

              <div className={`flex items-center space-x-3 ${['picked_up', 'in_transit'].includes(activeDelivery.status) ? 'text-blue-600' : 'text-muted-foreground'}`}>
                <div className={`w-3 h-3 rounded-full ${['picked_up', 'in_transit'].includes(activeDelivery.status) ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <span className="font-medium">Package Picked Up</span>
              </div>

              <div className={`flex items-center space-x-3 ${activeDelivery.status === 'in_transit' ? 'text-[var(--jetdash-green)]' : 'text-muted-foreground'}`}>
                <div className={`w-3 h-3 rounded-full ${activeDelivery.status === 'in_transit' ? 'bg-[var(--jetdash-green)]' : 'bg-gray-300'}`}></div>
                <span className="font-medium">Out for Delivery</span>
              </div>

              <div className="flex items-center space-x-3 text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="font-medium">Delivered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Tracking */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--jetdash-brown)]">Live Tracking</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[var(--jetdash-brown)]"
                onClick={fetchActiveDelivery}
              >
                <Navigation className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
            
            <div className="h-32 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Real-time tracking active</p>
                <p className="text-xs mt-1">ID: {activeDelivery.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6 space-y-3">
        {activeDelivery.status === 'accepted' && (
          <Button 
            onClick={onCancel}
            variant="outline"
            className="w-full h-12 border-red-500 text-red-500 hover:bg-red-50 rounded-xl"
          >
            Cancel Request
          </Button>
        )}
        
        {activeDelivery.status === 'completed' && (
          <Button 
            onClick={onDeliveryComplete}
            className="w-full h-14 bg-[var(--jetdash-green)] text-white hover:bg-green-600 rounded-2xl text-lg font-semibold shadow-lg"
          >
            Mark as Received
          </Button>
        )}
      </div>
    </div>
  );
}