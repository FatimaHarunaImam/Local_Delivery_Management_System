import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ArrowLeft, Package, MapPin, User, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { apiCall } from "../utils/supabase/client";

interface SMECreateDeliveryProps {
  user: any;
  onBack: () => void;
  onDeliveryCreated: () => void;
}

const GOMBE_LOCATIONS = [
  "Federal Lowcost",
  "Gombe Central",
  "Pantami",
  "Tudun Wada",
  "Nasarawo",
  "Bolari",
  "Jeka Da Fari",
  "Herwagana",
  "Dawaki",
  "Other"
];

const PACKAGE_SIZES = [
  { value: "small", label: "Small (< 2kg)", description: "Documents, phones, small items" },
  { value: "medium", label: "Medium (2-10kg)", description: "Clothes, books, medium parcels" },
  { value: "large", label: "Large (10-25kg)", description: "Electronics, furniture parts" },
  { value: "extra_large", label: "Extra Large (25kg+)", description: "Large appliances, bulk items" }
];

const PRIORITY_LEVELS = [
  { value: "standard", label: "Standard", description: "1-2 hours delivery", fee: 600 },
  { value: "express", label: "Express", description: "30-60 minutes delivery", fee: 900 },
  { value: "urgent", label: "Urgent", description: "15-30 minutes delivery", fee: 1200 }
];

export function SMECreateDelivery({ user, onBack, onDeliveryCreated }: SMECreateDeliveryProps) {
  const [formData, setFormData] = useState({
    recipientName: "Fatima Imam",
    recipientPhone: "",
    pickupLocation: "",
    pickupAddress: "",
    dropoffLocation: "Federal Lowcost",
    dropoffAddress: "",
    packageSize: "",
    priority: "standard",
    packageDescription: "",
    specialInstructions: "",
    pickupTime: "now"
  });
  
  const [unitsRemaining, setUnitsRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  useEffect(() => {
    fetchUnitsRemaining();
  }, []);

  const fetchUnitsRemaining = async () => {
    try {
      const response = await apiCall('/sme/dashboard');
      if (response.sme) {
        setUnitsRemaining(response.sme.unitsRemaining || 0);
      } else {
        // Initialize SME account if needed
        const initResponse = await apiCall('/sme/initialize', { method: 'POST' });
        if (initResponse.success && initResponse.sme) {
          setUnitsRemaining(initResponse.sme.unitsRemaining || 0);
        }
      }
      setError(""); // Clear any previous errors
    } catch (error: any) {
      console.error('Units fetch error:', error);
      // Don't show error for offline mode, just set reasonable defaults
      setUnitsRemaining(25); // Default units for demo
      setError("");
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.recipientName.trim()) return "Recipient name is required";
    if (!formData.recipientPhone.trim()) return "Recipient phone is required";
    if (!formData.pickupLocation) return "Pickup location is required";
    if (!formData.pickupAddress.trim()) return "Pickup address is required";
    if (!formData.dropoffLocation) return "Dropoff location is required";
    if (!formData.dropoffAddress.trim()) return "Dropoff address is required";
    if (!formData.packageSize) return "Package size is required";
    // Package description is now optional
    
    // Validate phone number format (basic Nigerian format)
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(formData.recipientPhone.replace(/\s/g, ''))) {
      return "Please enter a valid Nigerian phone number";
    }

    return null;
  };

  const handleCreateDelivery = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (unitsRemaining <= 0) {
      setError("No delivery units remaining. Please purchase more units.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const selectedPriority = PRIORITY_LEVELS.find(p => p.value === formData.priority);
      const deliveryData = {
        ...formData,
        deliveryFee: selectedPriority?.fee || 600,
        customerName: user?.name,
        estimatedTime: selectedPriority?.description,
      };

      const response = await apiCall('/sme/create-delivery', {
        method: 'POST',
        body: JSON.stringify(deliveryData)
      });

      if (response.success) {
        onDeliveryCreated();
      }
    } catch (error: any) {
      console.error('Delivery creation error:', error);
      setError(error.message || "Failed to create delivery. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPriority = PRIORITY_LEVELS.find(p => p.value === formData.priority);

  if (isLoadingUnits) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading delivery form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">Create Delivery</h1>
          </div>
          <Badge className="bg-[var(--jetdash-green)]/20 text-[var(--jetdash-green)]">
            {unitsRemaining} units remaining
          </Badge>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {unitsRemaining <= 0 && (
          <Card className="border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--jetdash-orange)] mt-0.5" />
                <div>
                  <h3 className="font-medium text-[var(--jetdash-brown)]">No Units Remaining</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to purchase delivery units before creating deliveries.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-[var(--jetdash-orange)] text-white"
                    onClick={onBack}
                  >
                    Purchase Units
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)] flex items-center gap-2">
              <User className="w-5 h-5" />
              Recipient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                placeholder="Enter recipient's full name"
                value={formData.recipientName}
                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="recipientPhone">Recipient Phone *</Label>
              <Input
                id="recipientPhone"
                type="tel"
                placeholder="+234 803 123 4567"
                value={formData.recipientPhone}
                onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pickup Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)] flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Pickup Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pickupLocation">Pickup Location *</Label>
              <Select value={formData.pickupLocation} onValueChange={(value) => handleInputChange('pickupLocation', value)}>
                <SelectTrigger className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl">
                  <SelectValue placeholder="Select pickup location" />
                </SelectTrigger>
                <SelectContent>
                  {GOMBE_LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pickupAddress">Pickup Address *</Label>
              <Textarea
                id="pickupAddress"
                placeholder="Enter specific pickup address, including landmarks"
                value={formData.pickupAddress}
                onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                className="mt-1 bg-[var(--input-background)] border-0 rounded-xl"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Dropoff Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)] flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Dropoff Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dropoffLocation">Dropoff Location *</Label>
              <Select value={formData.dropoffLocation} onValueChange={(value) => handleInputChange('dropoffLocation', value)}>
                <SelectTrigger className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl">
                  <SelectValue placeholder="Select dropoff location" />
                </SelectTrigger>
                <SelectContent>
                  {GOMBE_LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dropoffAddress">Dropoff Address *</Label>
              <Textarea
                id="dropoffAddress"
                placeholder="Enter specific dropoff address, including landmarks"
                value={formData.dropoffAddress}
                onChange={(e) => handleInputChange('dropoffAddress', e.target.value)}
                className="mt-1 bg-[var(--input-background)] border-0 rounded-xl"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Package Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)] flex items-center gap-2">
              <Package className="w-5 h-5" />
              Package Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="packageSize">Package Size *</Label>
              <Select value={formData.packageSize} onValueChange={(value) => handleInputChange('packageSize', value)}>
                <SelectTrigger className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl">
                  <SelectValue placeholder="Select package size" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      <div>
                        <div className="font-medium">{size.label}</div>
                        <div className="text-xs text-muted-foreground">{size.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="packageDescription">Package Description (Optional)</Label>
              <Textarea
                id="packageDescription"
                placeholder="Describe the package contents (for security and handling purposes)"
                value={formData.packageDescription}
                onChange={(e) => handleInputChange('packageDescription', e.target.value)}
                className="mt-1 bg-[var(--input-background)] border-0 rounded-xl"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special handling instructions or delivery notes"
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                className="mt-1 bg-[var(--input-background)] border-0 rounded-xl"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Priority & Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)]">Delivery Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PRIORITY_LEVELS.map((priority) => (
                <Card
                  key={priority.value}
                  className={`cursor-pointer transition-all ${
                    formData.priority === priority.value
                      ? 'border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/20'
                      : 'border-border hover:border-[var(--jetdash-orange)]/50'
                  }`}
                  onClick={() => handleInputChange('priority', priority.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--jetdash-brown)]">{priority.label}</h3>
                          {priority.value === 'express' && (
                            <Badge className="bg-[var(--jetdash-orange)] text-white text-xs">Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{priority.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--jetdash-brown)]">₦{priority.fee.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">delivery fee</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedPriority && (
          <Card className="border-[var(--jetdash-green)]/30">
            <CardHeader>
              <CardTitle className="text-[var(--jetdash-brown)] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--jetdash-green)]" />
                Delivery Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Route:</span>
                  <p className="font-medium">{formData.pickupLocation} → {formData.dropoffLocation}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <p className="font-medium">{selectedPriority.label}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Delivery Fee:</span>
                  <p className="font-medium text-[var(--jetdash-brown)]">₦{selectedPriority.fee.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Units Used:</span>
                  <p className="font-medium text-[var(--jetdash-green)]">1 unit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handleCreateDelivery}
            disabled={unitsRemaining <= 0 || isLoading}
            className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Delivery...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Create Delivery (1 Unit)
              </div>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pb-6">
          This delivery will use 1 unit from your remaining {unitsRemaining} units
        </div>
      </div>
    </div>
  );
}