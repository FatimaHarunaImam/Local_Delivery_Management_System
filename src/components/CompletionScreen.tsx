import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { CheckCircle, Star, MapPin, Package } from "lucide-react";

interface CompletionScreenProps {
  onBackToHome: () => void;
}

export function CompletionScreen({ onBackToHome }: CompletionScreenProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const rider = {
    name: "Muhammad Bello",
    vehicle: "Motorcycle"
  };

  const deliveryDetails = {
    from: "GRA Phase 2, Abuja",
    to: "Federal Low Cost Housing Estate",
    distance: "5.8 km",
    duration: "12 minutes",
    packageSize: "Medium",
    fee: "₦800"
  };

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitRating = () => {
    // Mock rating submission
    setTimeout(onBackToHome, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-green-500 px-6 py-12 text-white text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Package Delivered!</h1>
        <p className="text-green-100">Your package has been delivered successfully</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Delivery Summary */}
        <Card className="shadow-jetdash border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Delivery Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">From</p>
                  <p className="text-sm text-muted-foreground">{deliveryDetails.from}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">To</p>
                  <p className="text-sm text-muted-foreground">{deliveryDetails.to}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-medium">{deliveryDetails.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{deliveryDetails.duration}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Details */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Package Details</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 p-2 bg-[var(--jetdash-light-orange)]/50 text-[var(--jetdash-brown)] rounded-full" />
                <div>
                  <p className="font-medium">Package Size</p>
                  <p className="text-sm text-muted-foreground">{deliveryDetails.packageSize}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                <p className="text-xs text-green-600 font-medium">Delivered</p>
              </div>
            </div>
            
            <div className="bg-[var(--jetdash-light-orange)]/30 rounded-xl p-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-[var(--jetdash-brown)]" />
                  <p className="text-sm text-[var(--jetdash-brown)]">
                    Payment completed - Cash paid to rider
                  </p>
                </div>
                <span className="font-semibold text-[var(--jetdash-brown)]">{deliveryDetails.fee}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Section */}
        <Card className="shadow-jetdash border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">
              Rate your delivery with {rider.name}
            </h3>
            
            <div className="text-center mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    className="transition-colors"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= rating 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {rating > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                </p>
              )}
            </div>

            <Textarea
              placeholder="Share additional feedback about your delivery experience (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] bg-[var(--input-background)] border-0 rounded-xl resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 left-6 right-6 space-y-3">
        <Button 
          onClick={handleSubmitRating}
          disabled={rating === 0}
          className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-2xl text-lg font-semibold shadow-lg"
        >
          {rating > 0 ? `Submit ${rating} Star Rating` : 'Please Rate Your Delivery'}
        </Button>
        
        <Button 
          onClick={onBackToHome}
          variant="ghost"
          className="w-full h-12 text-[var(--jetdash-brown)]"
        >
          Skip and Continue
        </Button>
      </div>
    </div>
  );
}