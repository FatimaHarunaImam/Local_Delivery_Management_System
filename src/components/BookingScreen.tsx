import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ArrowLeft, MapPin, Clock, Truck, Package, CreditCard, Banknote, Smartphone } from "lucide-react";

interface BookingScreenProps {
  onBack: () => void;
  onConfirmDelivery: (bookingData: any) => void;
}

export function BookingScreen({ onBack, onConfirmDelivery }: BookingScreenProps) {
  const [pickup, setPickup] = useState("Current location (Pantami, Gombe)");
  const [dropoff, setDropoff] = useState("Federal Lowcost");
  const [otherLocation, setOtherLocation] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageSize, setPackageSize] = useState("");
  const [receiverName, setReceiverName] = useState("Fatima Imam");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  
  const availableRiders = [
    { id: "1", name: "Muhammad Bello", rating: 4.9, eta: "2 min", vehicle: "Motorcycle" },
    { id: "2", name: "Ahmed Usman", rating: 4.8, eta: "4 min", vehicle: "Bicycle" },
    { id: "3", name: "Hayat Ibrahim", rating: 5.0, eta: "5 min", vehicle: "Motorcycle" },
  ];

  const [selectedRider, setSelectedRider] = useState(availableRiders[0]);

  const gombeLocations = [
    "Federal Lowcost",
    "Gombe Central",
    "Pantami",
    "Tudun Wada",
    "Nasarawo",
    "Bolari",
    "Jekadafari",
    "Madaki",
    "Bambam",
    "Herwagana",
    "Bajoga",
    "Dukku",
    "Funakaye",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu/Deba",
    "Other"
  ];

  const handleLocationChange = (value: string) => {
    setDropoff(value);
    if (value !== "Other") {
      setOtherLocation("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onBack}
            className="w-10 h-10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">Send Package</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Location Details */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-[var(--jetdash-brown)]">Delivery Details</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                <Input 
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <Select value={dropoff} onValueChange={handleLocationChange}>
                    <SelectTrigger className="pl-10 h-12 bg-[var(--input-background)] border-0 rounded-xl">
                      <SelectValue placeholder="Select delivery location in Gombe" />
                    </SelectTrigger>
                    <SelectContent>
                      {gombeLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {dropoff === "Other" && (
                  <Input
                    placeholder="Enter specific location"
                    value={otherLocation}
                    onChange={(e) => setOtherLocation(e.target.value)}
                    className="h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                )}
              </div>
            </div>
            
            {(dropoff && dropoff !== "Other") || (dropoff === "Other" && otherLocation) && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Estimated distance</span>
                <span className="font-medium">4.2 km • 10 min</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Package Information */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-[var(--jetdash-brown)]">Package Information</h3>
            
            <div className="space-y-4">
              <Select value={packageSize} onValueChange={setPackageSize}>
                <SelectTrigger className="h-12 bg-[var(--input-background)] border-0 rounded-xl">
                  <SelectValue placeholder="Package size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (envelope/document) - ₦600</SelectItem>
                  <SelectItem value="medium">Medium (shoebox size) - ₦900</SelectItem>
                  <SelectItem value="large">Large (requires special handling) - ₦1,200</SelectItem>
                </SelectContent>
              </Select>
              
              <Textarea
                placeholder="Package description (optional)"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                className="min-h-[80px] bg-[var(--input-background)] border-0 rounded-xl resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Receiver Information */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-[var(--jetdash-brown)]">Receiver Information</h3>
            
            <div className="space-y-4">
              <Input 
                placeholder="Receiver's name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="h-12 bg-[var(--input-background)] border-0 rounded-xl"
              />
              
              <Input 
                type="tel"
                placeholder="Receiver's phone number (+234)"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="h-12 bg-[var(--input-background)] border-0 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Available Dispatch Riders */}
        <div>
          <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">
            Available Dispatch Riders
          </h3>
          
          <div className="space-y-3">
            {availableRiders.map((rider) => (
              <Card 
                key={rider.id} 
                className={`shadow-sm border-2 cursor-pointer transition-colors ${
                  selectedRider.id === rider.id 
                    ? 'border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/20' 
                    : 'border-transparent'
                }`}
                onClick={() => setSelectedRider(rider)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-[var(--jetdash-brown)]">{rider.name}</span>
                          <span className="text-sm text-amber-500">★ {rider.rating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rider.vehicle}</p>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{rider.eta} away</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="w-3 h-3 bg-[var(--jetdash-green)] rounded-full"></div>
                      <p className="text-xs text-muted-foreground mt-1">Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-[var(--jetdash-brown)]">Payment Method</h3>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-[var(--jetdash-orange)]/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-[var(--jetdash-orange)]" />
                  </div>
                  <div>
                    <p className="font-medium">Pay Online</p>
                    <p className="text-sm text-muted-foreground">Card, Bank Transfer, or USSD</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-[var(--jetdash-green)]/10 rounded-lg">
                    <Banknote className="w-5 h-5 text-[var(--jetdash-green)]" />
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when package is delivered</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "online" && (
              <div className="mt-4 p-4 bg-[var(--jetdash-light-orange)]/20 rounded-xl">
                <div className="flex items-center space-x-2 text-sm text-[var(--jetdash-brown)]">
                  <Smartphone className="w-4 h-4" />
                  <span>Secure payment • Instant rider payment • 10% platform fee applies</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Summary */}
        {((dropoff && dropoff !== "Other") || (dropoff === "Other" && otherLocation)) && packageSize && (
          <Card className="shadow-jetdash border-0 bg-[var(--jetdash-light-orange)]/30">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Delivery Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dispatch Rider</span>
                  <span className="font-medium">{selectedRider.name} (★ {selectedRider.rating})</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ETA</span>
                  <span className="font-medium">{selectedRider.eta}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package size</span>
                  <span className="font-medium capitalize">{packageSize}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    {packageSize === 'small' ? '₦600' : 
                     packageSize === 'medium' ? '₦900' : 
                     packageSize === 'large' ? '₦1,200' : 'TBD'}
                  </span>
                </div>

                {paymentMethod === "online" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee (10%)</span>
                      <span className="text-muted-foreground">
                        {packageSize === 'small' ? '₦60' : 
                         packageSize === 'medium' ? '₦90' : 
                         packageSize === 'large' ? '₦120' : 'TBD'}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span className="text-[var(--jetdash-brown)]">
                          {packageSize === 'small' ? '₦660' : 
                           packageSize === 'medium' ? '₦990' : 
                           packageSize === 'large' ? '₦1,320' : 'TBD'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 text-sm text-[var(--jetdash-brown)]">
                    {paymentMethod === "online" ? (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Payment: Online (Secure)</span>
                      </>
                    ) : (
                      <>
                        <Banknote className="w-4 h-4" />
                        <span>Payment: Cash on Delivery</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirm Delivery Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <Button 
          onClick={() => {
            const actualDropoff = dropoff === "Other" ? otherLocation : dropoff;
            const deliveryFee = packageSize === 'small' ? 600 : 
                               packageSize === 'medium' ? 900 : 
                               packageSize === 'large' ? 1200 : 600;
            
            const bookingData = {
              pickup,
              dropoff: actualDropoff,
              packageSize,
              packageDescription,
              receiverName,
              receiverPhone,
              riderId: selectedRider.id,
              riderName: selectedRider.name,
              deliveryFee,
              paymentMethod
            };
            
            onConfirmDelivery(bookingData);
          }}
          disabled={!((dropoff && dropoff !== "Other") || (dropoff === "Other" && otherLocation)) || !packageSize}
          className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-2xl text-lg font-semibold shadow-lg"
        >
          {paymentMethod === 'online' ? 'Proceed to Payment' : 'Confirm Delivery Request'}
        </Button>
      </div>
    </div>
  );
}