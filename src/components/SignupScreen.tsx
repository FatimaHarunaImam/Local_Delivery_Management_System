import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, User, Truck, Building, Mail, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { apiCall, supabase } from "../utils/supabase/client";

interface SignupScreenProps {
  onBack: () => void;
  onSignup: (userType: 'customer' | 'rider' | 'sme', userData: any) => void;
  onSwitchToLogin: () => void;
}

export function SignupScreen({ onBack, onSignup, onSwitchToLogin }: SignupScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'rider' | 'sme'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Basic info, 2: Additional info, 3: Email verification
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Additional rider information
  const [riderInfo, setRiderInfo] = useState({
    nin: "",
    vehicleType: "",
    plateNumber: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinAddress: "",
    bankAccount: "",
    bankName: "",
    address: ""
  });

  const handleBasicInfo = () => {
    if (!name || !email || !phone || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    
    if (selectedUserType === 'rider') {
      setStep(2); // Go to additional info for riders
    } else {
      setStep(3); // Go to email verification for others
      sendVerificationEmail();
    }
  };

  const handleAdditionalInfo = () => {
    if (selectedUserType === 'rider') {
      if (!riderInfo.nin || !riderInfo.vehicleType || !riderInfo.nextOfKinName || 
          !riderInfo.nextOfKinPhone || !riderInfo.bankAccount || !riderInfo.bankName) {
        setError("Please fill in all required rider information");
        return;
      }

      if (riderInfo.nin.length !== 11) {
        setError("NIN must be 11 digits");
        return;
      }
    }

    setError("");
    setStep(3);
    sendVerificationEmail();
  };

  const sendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      const { sendVerificationEmail } = await import('../utils/supabase/client');
      await sendVerificationEmail(email);
      console.log('📧 Verification email sent! Check the console for your code.');
    } catch (error: any) {
      setError("Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const { verifyEmailCode } = await import('../utils/supabase/client');
      await verifyEmailCode(email, verificationCode);
      // Create the account after successful verification
      await createAccount();
    } catch (error: any) {
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const createAccount = async () => {
    try {
      const signupData = {
        email,
        password,
        name,
        userType: selectedUserType,
        phone,
        ...(selectedUserType === 'rider' && { riderInfo })
      };

      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData)
      });

      if (response.user) {
        // After successful signup, sign the user in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError("Account created but login failed. Please try logging in.");
          return;
        }

        if (signInData.user && signInData.session) {
          // Ensure session is properly set
          await supabase.auth.setSession({
            access_token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token
          });

          const userData = {
            id: signInData.user.id,
            email: signInData.user.email || "",
            name,
            userType: selectedUserType,
            phone
          };

          // Add a small delay to ensure session is ready
          setTimeout(() => {
            onSignup(selectedUserType, userData);
          }, 100);
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=80&fit=crop&crop=center"
            alt="JetDash Logo" 
            className="w-32 h-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-semibold text-[var(--jetdash-brown)] mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Join JetDash today
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">
            I want to:
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Card 
              className={`cursor-pointer transition-all ${
                selectedUserType === 'customer' 
                  ? 'border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/20' 
                  : 'border-border'
              }`}
              onClick={() => setSelectedUserType('customer')}
            >
              <CardContent className="p-3 text-center">
                <User className="w-6 h-6 mx-auto mb-1 text-[var(--jetdash-brown)]" />
                <p className="text-sm font-medium text-[var(--jetdash-brown)]">Send Packages</p>
                <p className="text-xs text-muted-foreground">As customer</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all ${
                selectedUserType === 'rider' 
                  ? 'border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/20' 
                  : 'border-border'
              }`}
              onClick={() => setSelectedUserType('rider')}
            >
              <CardContent className="p-3 text-center">
                <Truck className="w-6 h-6 mx-auto mb-1 text-[var(--jetdash-brown)]" />
                <p className="text-sm font-medium text-[var(--jetdash-brown)]">Deliver Packages</p>
                <p className="text-xs text-muted-foreground">As rider</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                selectedUserType === 'sme' 
                  ? 'border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/20' 
                  : 'border-border'
              }`}
              onClick={() => setSelectedUserType('sme')}
            >
              <CardContent className="p-3 text-center">
                <Building className="w-6 h-6 mx-auto mb-1 text-[var(--jetdash-brown)]" />
                <p className="text-sm font-medium text-[var(--jetdash-brown)]">Bulk Delivery</p>
                <p className="text-xs text-muted-foreground">As SME</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Multi-step Form */}
        {step === 1 && (
          <Card className="shadow-jetdash border-0">
            <CardHeader>
              <CardTitle className="text-[var(--jetdash-brown)]">Basic Information</CardTitle>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[var(--jetdash-orange)] h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 803 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleBasicInfo}
                disabled={!name || !email || !phone || !password || password !== confirmPassword}
                className="w-full h-12 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-xl"
              >
                {selectedUserType === 'rider' ? 'Continue to Rider Information' : 'Continue to Verification'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && selectedUserType === 'rider' && (
          <Card className="shadow-jetdash border-0">
            <CardHeader>
              <CardTitle className="text-[var(--jetdash-brown)]">Rider Verification Information</CardTitle>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[var(--jetdash-orange)] h-2 rounded-full" style={{ width: '66%' }}></div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nin" className="text-sm font-medium text-muted-foreground">
                    National Identification Number (NIN) *
                  </Label>
                  <Input
                    id="nin"
                    type="text"
                    placeholder="Enter your 11-digit NIN"
                    value={riderInfo.nin}
                    onChange={(e) => setRiderInfo(prev => ({ ...prev, nin: e.target.value.replace(/[^0-9]/g, '').slice(0, 11) }))}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="vehicleType" className="text-sm font-medium text-muted-foreground">
                    Vehicle Type *
                  </Label>
                  <Input
                    id="vehicleType"
                    type="text"
                    placeholder="e.g., Motorcycle, Bicycle"
                    value={riderInfo.vehicleType}
                    onChange={(e) => setRiderInfo(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="plateNumber" className="text-sm font-medium text-muted-foreground">
                    Plate Number (Optional)
                  </Label>
                  <Input
                    id="plateNumber"
                    type="text"
                    placeholder="Vehicle plate number"
                    value={riderInfo.plateNumber}
                    onChange={(e) => setRiderInfo(prev => ({ ...prev, plateNumber: e.target.value }))}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">
                    Residential Address
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    value={riderInfo.address}
                    onChange={(e) => setRiderInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="mt-1 bg-[var(--input-background)] border-0 rounded-xl"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName" className="text-sm font-medium text-muted-foreground">
                      Bank Name *
                    </Label>
                    <Input
                      id="bankName"
                      type="text"
                      placeholder="e.g., First Bank"
                      value={riderInfo.bankName}
                      onChange={(e) => setRiderInfo(prev => ({ ...prev, bankName: e.target.value }))}
                      className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bankAccount" className="text-sm font-medium text-muted-foreground">
                      Account Number *
                    </Label>
                    <Input
                      id="bankAccount"
                      type="text"
                      placeholder="10-digit account number"
                      value={riderInfo.bankAccount}
                      onChange={(e) => setRiderInfo(prev => ({ ...prev, bankAccount: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                      className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Next of Kin Information *
                  </Label>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Next of Kin Full Name"
                      value={riderInfo.nextOfKinName}
                      onChange={(e) => setRiderInfo(prev => ({ ...prev, nextOfKinName: e.target.value }))}
                      className="h-12 bg-[var(--input-background)] border-0 rounded-xl"
                    />
                    <Input
                      type="tel"
                      placeholder="Next of Kin Phone Number"
                      value={riderInfo.nextOfKinPhone}
                      onChange={(e) => setRiderInfo(prev => ({ ...prev, nextOfKinPhone: e.target.value }))}
                      className="h-12 bg-[var(--input-background)] border-0 rounded-xl"
                    />
                    <Textarea
                      placeholder="Next of Kin Address"
                      value={riderInfo.nextOfKinAddress}
                      onChange={(e) => setRiderInfo(prev => ({ ...prev, nextOfKinAddress: e.target.value }))}
                      className="bg-[var(--input-background)] border-0 rounded-xl"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12 border-[var(--jetdash-brown)] text-[var(--jetdash-brown)] rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleAdditionalInfo}
                  disabled={!riderInfo.nin || !riderInfo.vehicleType || !riderInfo.nextOfKinName || 
                           !riderInfo.nextOfKinPhone || !riderInfo.bankAccount || !riderInfo.bankName}
                  className="flex-1 h-12 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-xl"
                >
                  Continue to Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-jetdash border-0">
            <CardHeader>
              <CardTitle className="text-[var(--jetdash-brown)]">Email Verification</CardTitle>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[var(--jetdash-orange)] h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--jetdash-light-orange)]/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-[var(--jetdash-orange)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--jetdash-brown)] mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit verification code to<br />
                    <span className="font-medium text-[var(--jetdash-brown)]">{email}</span>
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600">
                      💡 <strong>Demo Mode:</strong> Check the browser console for your verification code!
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="verificationCode" className="text-sm font-medium text-muted-foreground">
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl text-center text-xl tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(selectedUserType === 'rider' ? 2 : 1)}
                  variant="outline"
                  className="flex-1 h-12 border-[var(--jetdash-brown)] text-[var(--jetdash-brown)] rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyEmail}
                  disabled={verificationCode.length !== 6 || isVerifying}
                  className="flex-1 h-12 bg-[var(--jetdash-green)] text-white hover:bg-[var(--jetdash-green)]/90 disabled:opacity-50 rounded-xl"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Verify & Create Account
                    </div>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  onClick={sendVerificationEmail}
                  variant="link"
                  disabled={isLoading}
                  className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-deep-brown)] text-sm"
                >
                  {isLoading ? "Sending..." : "Didn't receive code? Resend"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <div className="text-center text-xs text-muted-foreground mt-4">
            By signing up, you agree to our{" "}
            <Button variant="link" className="text-xs text-[var(--jetdash-brown)] p-0">
              Terms of Service
            </Button>{" "}
            and{" "}
            <Button variant="link" className="text-xs text-[var(--jetdash-brown)] p-0">
              Privacy Policy
            </Button>
          </div>
        )}

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-deep-brown)] p-0"
            >
              Sign In
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}