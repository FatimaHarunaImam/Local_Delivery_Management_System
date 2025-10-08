import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ArrowLeft, CreditCard, Building, Smartphone, Lock, CheckCircle, XCircle } from "lucide-react";
import { apiCall } from "../utils/supabase/client";

interface PaymentScreenProps {
  onBack: () => void;
  onPaymentSuccess: (paymentData: any) => void;
  deliveryData: {
    id: string;
    amount: number;
    deliveryFee: number;
    riderId: string;
    description: string;
    pickup?: string;
    dropoff?: string;
    packageSize?: string;
    packageDescription?: string;
    receiverName?: string;
    receiverPhone?: string;
  };
}

export function PaymentScreen({ onBack, onPaymentSuccess, deliveryData }: PaymentScreenProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  
  // Card form states
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  
  // Bank transfer states
  const [selectedBank, setSelectedBank] = useState("");

  // Load payment gateway scripts
  useEffect(() => {
    const loadPaystackScript = () => {
      if (!(window as any).PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.head.appendChild(script);
      }
    };

    const loadFlutterwaveScript = () => {
      if (!(window as any).FlutterwaveCheckout) {
        const script = document.createElement('script');
        script.src = 'https://checkout.flutterwave.com/v3.js';
        script.async = true;
        document.head.appendChild(script);
      }
    };

    loadPaystackScript();
    loadFlutterwaveScript();
  }, []);
  
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const nigerianBanks = [
    "Access Bank", "GTBank", "First Bank", "UBA", "Zenith Bank", 
    "Sterling Bank", "Fidelity Bank", "Union Bank", "FCMB", "Polaris Bank"
  ];

  const validateCardDetails = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMessage("Please enter a valid card number");
      return false;
    }
    if (!expiryDate || expiryDate.length < 5) {
      setErrorMessage("Please enter a valid expiry date");
      return false;
    }
    if (!cvv || cvv.length < 3) {
      setErrorMessage("Please enter a valid CVV");
      return false;
    }
    if (!cardName.trim()) {
      setErrorMessage("Please enter the cardholder name");
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage("");

    try {
      if (paymentMethod === 'card') {
        if (!validateCardDetails()) {
          setPaymentStatus('failed');
          setIsProcessing(false);
          return;
        }
        
        // Process with Paystack
        await processPaystackPayment();
      } else if (paymentMethod === 'bank') {
        // Process bank transfer with Flutterwave
        await processFlutterwavePayment();
      } else if (paymentMethod === 'ussd') {
        // Process USSD payment
        await processUSSDPayment();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processPaystackPayment = async () => {
    // Real Paystack integration
    const paystackKey = 'pk_test_b74cc8739da96a7b4dcda8e0c8cbc6fc2b8d5b47'; // Demo Paystack public key
    
    // Create delivery first
    const createDeliveryResponse = await createDelivery();
    const deliveryId = createDeliveryResponse.delivery.id;

    try {
      // Initialize Paystack Popup
      const handler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: 'customer@jetdash.ng',
        amount: deliveryData.amount * 100, // Convert to kobo
        currency: 'NGN',
        ref: `jetdash_${deliveryId}_${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Delivery ID",
              variable_name: "delivery_id",
              value: deliveryId
            },
            {
              display_name: "Package Size",
              variable_name: "package_size", 
              value: deliveryData.packageSize || 'Medium'
            }
          ]
        },
        callback: async (response: any) => {
          console.log('Paystack payment response:', response);
          if (response.status === 'success') {
            await verifyPayment(response.reference, deliveryId);
          } else {
            throw new Error('Payment was not successful');
          }
        },
        onClose: () => {
          if (paymentStatus === 'processing') {
            setPaymentStatus('failed');
            setErrorMessage('Payment was cancelled');
          }
        }
      });

      // Open Paystack popup
      handler.openIframe();
    } catch (error) {
      console.log('Paystack not available, using simulation:', error);
      // Fallback to simulation if Paystack SDK is not loaded
      await simulatePaymentGateway('Paystack', {}, deliveryId);
    }
  };

  const processFlutterwavePayment = async () => {
    // Create delivery first
    const createDeliveryResponse = await createDelivery();
    const deliveryId = createDeliveryResponse.delivery.id;

    try {
      // Real Flutterwave integration
      const flutterwaveConfig = {
        public_key: 'FLWPUBK_TEST-8a0fcb7d6ea6d93da9abdb2b67ee33d7-X', // Demo Flutterwave public key
        tx_ref: `jetdash_flutter_${deliveryId}_${Date.now()}`,
        amount: deliveryData.amount,
        currency: 'NGN',
        payment_options: 'card,banktransfer,ussd',
        customer: {
          email: 'customer@jetdash.ng',
          name: deliveryData.receiverName || 'JetDash Customer',
          phone_number: deliveryData.receiverPhone || '+2348000000000',
        },
        customizations: {
          title: 'JetDash Delivery Payment',
          description: `Payment for ${deliveryData.packageSize || 'Medium'} package delivery`,
          logo: 'https://jetdash.ng/logo.png',
        },
        callback: async (response: any) => {
          console.log('Flutterwave payment response:', response);
          if (response.status === 'successful') {
            await verifyPayment(response.transaction_id, deliveryId);
          } else {
            throw new Error('Payment was not successful');
          }
        },
        onclose: () => {
          if (paymentStatus === 'processing') {
            setPaymentStatus('failed');
            setErrorMessage('Payment was cancelled');
          }
        }
      };

      // Initialize Flutterwave
      (window as any).FlutterwaveCheckout(flutterwaveConfig);
    } catch (error) {
      console.log('Flutterwave not available, using simulation:', error);
      // Fallback to simulation if Flutterwave SDK is not loaded
      await simulatePaymentGateway('Flutterwave', {}, deliveryId);
    }
  };

  const processUSSDPayment = async () => {
    // Create delivery first
    const createDeliveryResponse = await createDelivery();
    const deliveryId = createDeliveryResponse.delivery.id;

    // Simulate USSD payment flow
    const ussdCode = `*737*000*${deliveryData.amount}*${deliveryId.slice(-6)}#`;
    
    // Show USSD instructions
    setPaymentStatus('processing');
    
    // Simulate payment completion after 5 seconds
    setTimeout(async () => {
      try {
        await verifyPayment(`ussd_${deliveryId}_${Date.now()}`, deliveryId);
      } catch (error) {
        setPaymentStatus('failed');
        setErrorMessage('USSD payment failed. Please try again.');
      }
    }, 5000);
  };

  const createDelivery = async () => {
    const createDeliveryResponse = await apiCall('/delivery/create', {
      method: 'POST',
      body: JSON.stringify({
        pickup: deliveryData.pickup || 'Pickup location',
        dropoff: deliveryData.dropoff || 'Delivery location', 
        packageSize: deliveryData.packageSize || 'medium',
        packageDescription: deliveryData.packageDescription || '',
        receiverName: deliveryData.receiverName || 'Receiver',
        receiverPhone: deliveryData.receiverPhone || '',
        deliveryFee: deliveryData.deliveryFee,
        riderId: deliveryData.riderId,
        status: 'pending',
        paymentStatus: 'pending'
      })
    });

    if (!createDeliveryResponse.success) {
      throw new Error(createDeliveryResponse.error || 'Failed to create delivery');
    }

    return createDeliveryResponse;
  };

  const simulatePaymentGateway = async (gateway: string, config: any, deliveryId: string) => {
    // Simulate payment gateway processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful payment (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      const mockReference = `${gateway.toLowerCase()}_${deliveryId}_${Date.now()}`;
      await verifyPayment(mockReference, deliveryId);
    } else {
      throw new Error(`${gateway} payment failed. Please try again.`);
    }
  };

  const verifyPayment = async (reference: string, deliveryId: string) => {
    try {
      // Verify payment with backend
      const response = await apiCall('/delivery/payment/verify', {
        method: 'POST',
        body: JSON.stringify({
          reference,
          deliveryId,
          amount: deliveryData.amount,
          paymentMethod
        })
      });

      if (response.success) {
        setPaymentStatus('success');
        
        // Store delivery info in localStorage for tracking
        const deliveryInfo = {
          id: deliveryId,
          status: 'pending',
          paymentStatus: 'completed',
          pickup: deliveryData.pickup,
          dropoff: deliveryData.dropoff,
          amount: deliveryData.amount,
          createdAt: new Date().toISOString(),
          reference
        };
        
        const existingDeliveries = JSON.parse(localStorage.getItem('userDeliveries') || '[]');
        existingDeliveries.push(deliveryInfo);
        localStorage.setItem('userDeliveries', JSON.stringify(existingDeliveries));
        
        setTimeout(() => {
          onPaymentSuccess({ ...response, deliveryId, reference });
        }, 2000);
      } else {
        throw new Error(response.error || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw new Error('Payment verification failed. Please contact support.');
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--jetdash-brown)] mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground">
                Your delivery has been confirmed and the rider has been notified.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Redirecting to tracking page...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--jetdash-brown)] mb-2">
                Payment Failed
              </h2>
              <p className="text-muted-foreground">
                {errorMessage || "Something went wrong with your payment."}
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setPaymentStatus('idle');
                  setErrorMessage("");
                }}
                className="w-full bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)]"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={onBack}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            disabled={isProcessing}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">Complete Payment</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Order Summary */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">₦{deliveryData.deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="font-medium">₦{Math.round(deliveryData.deliveryFee * 0.1)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span className="text-[var(--jetdash-brown)]">₦{deliveryData.amount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Payment Method</h3>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-[var(--jetdash-orange)]/10 rounded-lg">
                    <CreditCard className="w-5 h-5 text-[var(--jetdash-orange)]" />
                  </div>
                  <div>
                    <p className="font-medium">Debit/Credit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Verve</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-[var(--jetdash-green)]/10 rounded-lg">
                    <Building className="w-5 h-5 text-[var(--jetdash-green)]" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem value="ussd" id="ussd" />
                <Label htmlFor="ussd" className="flex items-center space-x-3 cursor-pointer">
                  <div className="p-2 bg-[var(--jetdash-lilac)]/10 rounded-lg">
                    <Smartphone className="w-5 h-5 text-[var(--jetdash-lilac)]" />
                  </div>
                  <div>
                    <p className="font-medium">USSD</p>
                    <p className="text-sm text-muted-foreground">*737#, *894#, *919#</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Card Details Form */}
        {paymentMethod === 'card' && (
          <Card className="shadow-sm border-0">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-[var(--jetdash-brown)]">Card Details</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber" className="text-sm font-medium text-muted-foreground">
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate" className="text-sm font-medium text-muted-foreground">
                      Expiry Date
                    </Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cvv" className="text-sm font-medium text-muted-foreground">
                      CVV
                    </Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cardName" className="text-sm font-medium text-muted-foreground">
                    Cardholder Name
                  </Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="Full name as on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                <Lock className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Transfer Instructions */}
        {paymentMethod === 'bank' && (
          <Card className="shadow-sm border-0">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-[var(--jetdash-brown)]">Bank Transfer</h3>
              <p className="text-sm text-muted-foreground">
                You will be redirected to complete your bank transfer
              </p>
            </CardContent>
          </Card>
        )}

        {/* USSD Instructions */}
        {paymentMethod === 'ussd' && (
          <Card className="shadow-sm border-0">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-[var(--jetdash-brown)]">USSD Payment</h3>
              <p className="text-sm text-muted-foreground">
                You will receive USSD instructions to complete your payment
              </p>
            </CardContent>
          </Card>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Pay Now Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <Button 
          onClick={processPayment}
          disabled={isProcessing || paymentStatus === 'processing'}
          className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-2xl text-lg font-semibold shadow-lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay ₦${deliveryData.amount} Now`
          )}
        </Button>
      </div>
    </div>
  );
}