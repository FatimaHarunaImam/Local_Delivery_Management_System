import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, User, Truck, Building, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { apiCall, supabase } from "../utils/supabase/client";

interface SignupScreenProps {
  onBack: () => void;
  onSignup: (userType: 'customer' | 'rider' | 'sme', userData: any) => void;
  onSwitchToLogin: () => void;
}

/**
 * SignupScreen with REAL Email Verification
 * 
 * This version uses Supabase's native email verification:
 * 1. User fills signup form
 * 2. Supabase sends verification email with clickable link
 * 3. User clicks link to verify
 * 4. User returns to app and logs in
 * 
 * REQUIREMENTS:
 * - Configure SMTP in Supabase (see EMAIL_SETUP_GUIDE.md)
 * - Set email_confirm: false in server code (see ENABLE_REAL_EMAIL_VERIFICATION.md)
 */
export function SignupScreenWithRealEmail({ onBack, onSignup, onSwitchToLogin }: SignupScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'rider' | 'sme'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Basic info, 2: Additional info, 3: Email sent confirmation
  const [emailSent, setEmailSent] = useState(false);
  
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
      createAccount();
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
    createAccount();
  };

  const createAccount = async () => {
    setIsLoading(true);
    setError("");

    try {
      const signupData = {
        email,
        password,
        name,
        userType: selectedUserType,
        phone,
        ...(selectedUserType === 'rider' && { riderInfo })
      };

      // Create the user account - Supabase will send verification email automatically
      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData)
      });

      if (response.user) {
        // Show email sent confirmation
        setEmailSent(true);
        setStep(3);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setError("Failed to resend email. Please try again.");
      } else {
        alert("Verification email sent! Please check your inbox.");
      }
    } catch (error: any) {
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
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
        {!emailSent && (
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
        )}

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
                disabled={!name || !email || !phone || !password || password !== confirmPassword || isLoading}
                className="w-full h-12 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Account...
                  </div>
                ) : (
                  selectedUserType === 'rider' ? 'Continue to Rider Information' : 'Create Account'
                )}
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
                           !riderInfo.nextOfKinPhone || !riderInfo.bankAccount || !riderInfo.bankName || isLoading}
                  className="flex-1 h-12 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && emailSent && (
          <Card className="shadow-jetdash border-0">
            <CardHeader>
              <CardTitle className="text-[var(--jetdash-brown)]">Verify Your Email</CardTitle>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-[var(--jetdash-orange)] h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--jetdash-light-orange)]/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-[var(--jetdash-orange)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--jetdash-brown)] mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We've sent a verification email to<br />
                    <span className="font-medium text-[var(--jetdash-brown)]">{email}</span>
                  </p>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                    <p className="text-sm text-blue-900 mb-2">
                      <strong>📧 Next Steps:</strong>
                    </p>
                    <ol className="text-xs text-blue-700 space-y-1 pl-4 list-decimal">
                      <li>Open your email inbox</li>
                      <li>Look for email from JetDash</li>
                      <li>Click the "Confirm Email" link</li>
                      <li>Return here and log in</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={onSwitchToLogin}
                  className="w-full h-12 bg-[var(--jetdash-green)] text-white hover:bg-[var(--jetdash-green)]/90 rounded-xl"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Verified - Go to Login
                </Button>

                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  disabled={isLoading}
                  className="w-full h-12 border-[var(--jetdash-brown)] text-[var(--jetdash-brown)] rounded-xl"
                >
                  {isLoading ? "Sending..." : "Resend Verification Email"}
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>Can't find the email? Check your spam folder</p>
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
        {!emailSent && (
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
        )}
      </div>
    </div>
  );
}
