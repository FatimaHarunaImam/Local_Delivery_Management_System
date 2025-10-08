import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, MapPin, Clock, Package, Phone, Star, Navigation } from "lucide-react";

interface IncomingRequestScreenProps {
  user: any;
  onBack: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingRequestScreen({ user, onBack, onAccept, onDecline }: IncomingRequestScreenProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  const deliveryRequest = {
    id: "DR001",
    customer: {
      name: "Hauwa Musa",
      rating: 4.8,
      phone: "+234 803 456 7890",
      completedDeliveries: 47
    },
    pickup: {
      address: "No. 15 Pantami District, Gombe",
      landmark: "Near Central Mosque"
    },
    dropoff: {
      address: "Federal Lowcost, House 23, Gombe",
      landmark: "Main entrance"
    },
    package: {
      size: "Medium",
      description: "Documents and small electronics",
      weight: "Approx 2kg"
    },
    payment: {
      estimatedFee: "₦900",
      distance: "3.2 km",
      estimatedTime: "8-12 minutes"
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onBack(); // Auto-decline when time runs out
    }
  }, [timeLeft, onBack]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[var(--jetdash-orange)] text-white px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-xl font-semibold">New Delivery Request</h1>
          
          <div className="w-10" />
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl font-bold">{timeLeft}</span>
          </div>
          <p className="text-orange-100">seconds to respond</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Customer Info */}
        <Card className="shadow-jetdash border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--jetdash-brown)]">Customer</h3>
              <Button variant="ghost" size="sm" className="text-[var(--jetdash-orange)]">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-white">
                  {deliveryRequest.customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-[var(--jetdash-brown)]">
                  {deliveryRequest.customer.name}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span>{deliveryRequest.customer.rating}</span>
                  <span>•</span>
                  <span>{deliveryRequest.customer.completedDeliveries} deliveries</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Delivery Route</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--jetdash-brown)]">Pickup</p>
                  <p className="text-sm text-muted-foreground">
                    {deliveryRequest.pickup.address}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deliveryRequest.pickup.landmark}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--jetdash-brown)]">Drop-off</p>
                  <p className="text-sm text-muted-foreground">
                    {deliveryRequest.dropoff.address}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deliveryRequest.dropoff.landmark}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mt-4">
              <Button variant="ghost" size="sm" className="text-[var(--jetdash-brown)]">
                <Navigation className="w-4 h-4 mr-1" />
                View on Map
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Package & Payment Info */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Package Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{deliveryRequest.package.size}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{deliveryRequest.package.weight}</span>
                </div>
                
                <div>
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{deliveryRequest.package.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Summary */}
        <Card className="shadow-jetdash border-0 bg-[var(--jetdash-light-orange)]/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Earning Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Distance</span>
                <span className="font-medium">{deliveryRequest.payment.distance}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Est. Time</span>
                <span className="font-medium">{deliveryRequest.payment.estimatedTime}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[var(--jetdash-brown)]">
                    You'll earn
                  </span>
                  <span className="text-2xl font-bold text-[var(--jetdash-brown)]">
                    {deliveryRequest.payment.estimatedFee}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  Paid via wallet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6 space-y-3">
        <Button 
          onClick={onAccept}
          className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] rounded-2xl text-lg font-semibold shadow-lg"
        >
          Accept Delivery - {deliveryRequest.payment.estimatedFee}
        </Button>
        
        <Button 
          onClick={onDecline}
          variant="outline"
          className="w-full h-12 border-red-500 text-red-500 hover:bg-red-50 rounded-xl"
        >
          Decline
        </Button>
      </div>
    </div>
  );
}