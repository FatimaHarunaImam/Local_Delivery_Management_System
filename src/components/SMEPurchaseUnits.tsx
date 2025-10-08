import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ArrowLeft, Package, CreditCard, CheckCircle, AlertCircle, Wallet, Lock } from "lucide-react";
import { apiCall } from "../utils/supabase/client";

interface SMEPurchaseUnitsProps {
  user: any;
  onBack: () => void;
  onPurchaseComplete: () => void;
}

interface PricingTier {
  min: number;
  max: number | null;
  price: number;
  label: string;
  description: string;
}

export function SMEPurchaseUnits({ user, onBack, onPurchaseComplete }: SMEPurchaseUnitsProps) {
  const [units, setUnits] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const pricingTiers: PricingTier[] = [
    { min: 1, max: 50, price: 600, label: "Starter", description: "Perfect for small businesses" },
    { min: 51, max: 100, price: 550, label: "Growth", description: "Best value for growing businesses" },
    { min: 101, max: null, price: 500, label: "Enterprise", description: "Bulk pricing for high volume" }
  ];

  const packages = [
    { units: 10, popular: false },
    { units: 25, popular: false },
    { units: 50, popular: true },
    { units: 100, popular: false },
    { units: 200, popular: false },
  ];

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await apiCall(`/wallet/${user?.id}`);
      setWalletBalance(response.balance || 0);
    } catch (error: any) {
      console.error('Wallet fetch error:', error);
    }
  };

  const calculatePrice = (unitCount: number): number => {
    for (const tier of pricingTiers) {
      if (unitCount >= tier.min && (tier.max === null || unitCount <= tier.max)) {
        return tier.price;
      }
    }
    return pricingTiers[0].price; // fallback to first tier
  };

  const getTotalCost = (unitCount: number): number => {
    return unitCount * calculatePrice(unitCount);
  };

  const getCurrentTier = (unitCount: number): PricingTier | null => {
    for (const tier of pricingTiers) {
      if (unitCount >= tier.min && (tier.max === null || unitCount <= tier.max)) {
        return tier;
      }
    }
    return null;
  };

  const validateCardDetails = (): string | null => {
    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber.replace(/\s/g, '')) return "Card number is required";
      if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) return "Card number must be 16 digits";
      if (!cardDetails.expiryDate) return "Expiry date is required";
      if (!cardDetails.cvv) return "CVV is required";
      if (cardDetails.cvv.length < 3) return "CVV must be at least 3 digits";
      if (!cardDetails.cardholderName.trim()) return "Cardholder name is required";
      
      // Basic expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(cardDetails.expiryDate)) {
        return "Expiry date must be in MM/YY format";
      }
      
      // Check if card is not expired
      const [month, year] = cardDetails.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        return "Card has expired";
      }
    }
    return null;
  };

  const handlePurchase = async () => {
    const unitCount = parseInt(units);
    
    if (!unitCount || unitCount <= 0) {
      setError("Please enter a valid number of units");
      return;
    }

    const totalCost = getTotalCost(unitCount);
    
    if (paymentMethod === 'wallet' && totalCost > walletBalance) {
      setError(`Insufficient wallet balance. You need ₦${totalCost.toLocaleString()} but only have ₦${walletBalance.toLocaleString()}`);
      return;
    }

    const cardValidationError = validateCardDetails();
    if (cardValidationError) {
      setError(cardValidationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiCall('/sme/purchase-units', {
        method: 'POST',
        body: JSON.stringify({
          units: unitCount,
          totalCost,
          paymentMethod,
          ...(paymentMethod === 'card' && {
            cardDetails: {
              ...cardDetails,
              cardNumber: cardDetails.cardNumber.replace(/\s/g, '') // Remove spaces for processing
            }
          })
        })
      });

      if (response.success) {
        onPurchaseComplete();
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setError(error.message || "Purchase failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const unitCount = parseInt(units) || 0;
  const totalCost = unitCount > 0 ? getTotalCost(unitCount) : 0;
  const currentTier = unitCount > 0 ? getCurrentTier(unitCount) : null;
  const hasInsufficientFunds = paymentMethod === 'wallet' && totalCost > walletBalance;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-10 h-10"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">Purchase Delivery Units</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Wallet Balance */}
        <Card className="border-[var(--jetdash-green)]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-[var(--jetdash-green)]" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-lg font-bold text-[var(--jetdash-brown)]">
                    {formatCurrency(walletBalance)}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-[var(--jetdash-green)] border-[var(--jetdash-green)]"
                onClick={() => window.location.href = '#/wallet'}
              >
                Top Up
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Package Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)]">Quick Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <Card
                  key={pkg.units}
                  className={`cursor-pointer transition-all relative ${
                    selectedPackage === pkg.units
                      ? 'border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/20'
                      : 'border-border hover:border-[var(--jetdash-orange)]/50'
                  }`}
                  onClick={() => {
                    setUnits(pkg.units.toString());
                    setSelectedPackage(pkg.units);
                  }}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[var(--jetdash-orange)] text-white">
                      Popular
                    </Badge>
                  )}
                  <CardContent className="p-4 text-center">
                    <Package className="w-8 h-8 mx-auto mb-2 text-[var(--jetdash-brown)]" />
                    <p className="font-bold text-lg text-[var(--jetdash-brown)]">{pkg.units} Units</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(getTotalCost(pkg.units))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₦{calculatePrice(pkg.units)} per unit
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)]">Custom Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="units">Number of Units</Label>
              <Input
                id="units"
                type="number"
                placeholder="Enter number of units"
                value={units}
                onChange={(e) => {
                  setUnits(e.target.value);
                  setSelectedPackage(null);
                }}
                className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                min="1"
              />
            </div>

            {unitCount > 0 && (
              <div className="space-y-3">
                {/* Pricing Tier Info */}
                {currentTier && (
                  <div className="p-3 bg-[var(--jetdash-light-orange)]/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[var(--jetdash-orange)] text-white">
                        {currentTier.label} Tier
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentTier.description}</p>
                    <p className="text-sm font-medium text-[var(--jetdash-brown)]">
                      ₦{currentTier.price} per unit
                    </p>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Units:</span>
                      <span>{unitCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per unit:</span>
                      <span>₦{calculatePrice(unitCount).toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Cost:</span>
                        <span className="text-[var(--jetdash-brown)]">{formatCurrency(totalCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insufficient Funds Warning */}
                {hasInsufficientFunds && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm text-destructive font-medium">Insufficient Wallet Balance</p>
                        <p className="text-xs text-destructive mt-1">
                          You need {formatCurrency(totalCost - walletBalance)} more to complete this purchase.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--jetdash-brown)]">Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pricingTiers.map((tier, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div>
                    <p className="font-medium text-[var(--jetdash-brown)]">{tier.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {tier.min}{tier.max ? `-${tier.max}` : '+'} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--jetdash-brown)]">₦{tier.price}</p>
                    <p className="text-xs text-muted-foreground">per unit</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        {unitCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--jetdash-brown)]">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-[var(--jetdash-green)] bg-[var(--jetdash-light-green)]/20'
                      : 'border-border hover:border-[var(--jetdash-green)]/50'
                  }`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <CardContent className="p-4 text-center">
                    <Wallet className="w-8 h-8 mx-auto mb-2 text-[var(--jetdash-green)]" />
                    <p className="font-medium">Wallet</p>
                    <p className="text-sm text-muted-foreground">Pay from balance</p>
                    <p className="text-xs font-medium text-[var(--jetdash-green)] mt-1">
                      ₦{walletBalance.toLocaleString()} available
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/20'
                      : 'border-border hover:border-[var(--jetdash-orange)]/50'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CardContent className="p-4 text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-[var(--jetdash-orange)]" />
                    <p className="font-medium">Debit/Credit Card</p>
                    <p className="text-sm text-muted-foreground">Pay with card</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Lock className="w-3 h-3 text-[var(--jetdash-green)]" />
                      <p className="text-xs text-[var(--jetdash-green)]">Secure</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Card Details Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name *</Label>
                    <Input
                      id="cardholderName"
                      placeholder="Full name as on card"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                      className="mt-1 h-12 bg-white border-0 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails(prev => ({ 
                        ...prev, 
                        cardNumber: formatCardNumber(e.target.value)
                      }))}
                      className="mt-1 h-12 bg-white border-0 rounded-xl"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails(prev => ({ 
                          ...prev, 
                          expiryDate: formatExpiryDate(e.target.value)
                        }))}
                        className="mt-1 h-12 bg-white border-0 rounded-xl"
                        maxLength={5}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ 
                          ...prev, 
                          cvv: e.target.value.replace(/[^0-9]/g, '')
                        }))}
                        className="mt-1 h-12 bg-white border-0 rounded-xl"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 text-[var(--jetdash-green)]" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Purchase Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handlePurchase}
            disabled={!unitCount || unitCount <= 0 || hasInsufficientFunds || isLoading}
            className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Payment...
              </div>
            ) : unitCount > 0 ? (
              <div className="flex items-center gap-2">
                {paymentMethod === 'wallet' ? (
                  <Wallet className="w-5 h-5" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                Pay {formatCurrency(totalCost)} for {unitCount} Units
              </div>
            ) : (
              "Enter number of units to purchase"
            )}
          </Button>
        </div>

        {/* Benefits */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-[var(--jetdash-brown)] mb-4">Why Purchase Units?</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[var(--jetdash-green)]" />
                <span>Pre-paid delivery credits for bulk operations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[var(--jetdash-green)]" />
                <span>Volume discounts for larger purchases</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[var(--jetdash-green)]" />
                <span>No per-transaction payment processing</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[var(--jetdash-green)]" />
                <span>Streamlined delivery creation process</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[var(--jetdash-green)]" />
                <span>Priority support for SME accounts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}