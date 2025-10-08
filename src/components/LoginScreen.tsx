import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, User, Truck, Building } from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LoginScreenProps {
  onBack: () => void;
  onLogin: (userType: 'customer' | 'rider' | 'sme', userData: any) => void;
  onSwitchToSignup: () => void;
}

export function LoginScreen({ onBack, onLogin, onSwitchToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'rider' | 'sme'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (data.user && data.session) {
        // Ensure session is properly set
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        const userData = {
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata.name || "",
          userType: data.user.user_metadata.userType || selectedUserType,
          phone: data.user.user_metadata.phone || ""
        };

        // Verify user type matches selection
        if (userData.userType !== selectedUserType) {
          setError(`This account is registered as a ${userData.userType}. Please select the correct user type.`);
          return;
        }

        // Add a small delay to ensure session is ready
        setTimeout(() => {
          onLogin(selectedUserType, userData);
        }, 100);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setResetSent(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSent(false);
        setForgotPasswordEmail("");
      }, 3000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      setError("Failed to send reset email. Please try again.");
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
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">
            I am a:
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
                <p className="text-sm font-medium text-[var(--jetdash-brown)]">Customer</p>
                <p className="text-xs text-muted-foreground">Send packages</p>
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
                <p className="text-sm font-medium text-[var(--jetdash-brown)]">Rider</p>
                <p className="text-xs text-muted-foreground">Deliver packages</p>
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
                <p className="text-sm font-medium text-[var(--jetdash-brown)]">SME</p>
                <p className="text-xs text-muted-foreground">Bulk delivery</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-jetdash border-0">
          <CardContent className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
              className="w-full h-12 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] disabled:opacity-50 rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing In...
                </div>
              ) : (
                `Sign In as ${selectedUserType === 'customer' ? 'Customer' : selectedUserType === 'rider' ? 'Rider' : 'SME'}`
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-deep-brown)]"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <Card className="mt-6 border-[var(--jetdash-orange)] bg-[var(--jetdash-orange)]/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-[var(--jetdash-brown)] mb-4">
                Reset Password
              </h3>
              
              {resetSent ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-[var(--jetdash-green)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-[var(--jetdash-green)] font-medium mb-2">Reset email sent!</p>
                  <p className="text-sm text-muted-foreground">
                    Check your email for password reset instructions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email" className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                        setError("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleForgotPassword}
                      disabled={!forgotPasswordEmail || isLoading}
                      className="flex-1 bg-[var(--jetdash-orange)] text-white hover:bg-[var(--jetdash-light-orange)]"
                    >
                      {isLoading ? "Sending..." : "Send Reset Email"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sign Up Link */}
        <Card className="mt-6 border-[var(--jetdash-orange)]/20 bg-[var(--jetdash-orange)]/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              New to JetDash?
            </p>
            <Button
              variant="outline"
              onClick={onSwitchToSignup}
              className="w-full border-[var(--jetdash-orange)] text-[var(--jetdash-orange)] hover:bg-[var(--jetdash-orange)] hover:text-white"
            >
              Create Account - It's Free!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}