import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Building, 
  Package, 
  TrendingUp, 
  Wallet, 
  Plus, 
  User, 
  Menu,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { apiCall } from "../utils/supabase/client";

interface SMEDashboardProps {
  user: any;
  onPurchaseUnits: () => void;
  onCreateDelivery: () => void;
  onCreateMultipleDelivery: () => void;
  onWallet: () => void;
  onProfile: () => void;
  onMenu: () => void;
}

interface SMEData {
  userId: string;
  plan: string;
  unitsRemaining: number;
  totalUnitsUsed: number;
  subscriptionDate: string;
  isActive: boolean;
}

interface Delivery {
  id: string;
  customerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface DashboardData {
  sme: SMEData;
  wallet: any;
  deliveries: Delivery[];
  totalDeliveries: number;
  completedDeliveries: number;
}

export function SMEDashboard({ 
  user, 
  onPurchaseUnits, 
  onCreateDelivery, 
  onCreateMultipleDelivery,
  onWallet, 
  onProfile,
  onMenu 
}: SMEDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const initializeSMEAccount = async () => {
    try {
      setError('Initializing your SME account...');
      console.log('Initializing SME account for user:', user?.id);
      
      const response = await apiCall('/sme/initialize', {
        method: 'POST'
      });
      
      if (response.success) {
        setError('');
        // Retry fetching dashboard data
        fetchDashboardData();
      } else {
        throw new Error(response.error || 'Initialization failed');
      }
    } catch (error: any) {
      console.error('SME initialization error:', error);
      setError('Failed to initialize SME account. Please contact support.');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError("");
      console.log('Fetching SME dashboard data for user:', user?.id);
      
      const response = await apiCall('/sme/dashboard');
      console.log('SME dashboard response:', response);
      
      setDashboardData(response);
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      
      // More specific error messages
      let errorMessage = 'Failed to load dashboard data. Please try again.';
      
      if (error.message.includes('Authentication required') || 
          error.message.includes('session has expired') ||
          error.message.includes('Unauthorized') ||
          error.message.includes('401')) {
        errorMessage = 'Session expired. Please log in again.';
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (error.message.includes('Access denied') || error.message.includes('403')) {
        errorMessage = 'Access denied. Please ensure you have an SME account.';
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'Account not found. Creating your SME profile...';
        // Auto-initialize for 404 errors
        initializeSMEAccount();
        return;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Our team has been notified. Please try again in a moment.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-[var(--jetdash-green)]/20 text-[var(--jetdash-green)]';
      case 'pending':
        return 'bg-[var(--jetdash-orange)]/20 text-[var(--jetdash-orange)]';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <Truck className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading SME dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={fetchDashboardData} className="w-full">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={initializeSMEAccount}
              className="w-full"
            >
              Initialize Account
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                // Create debug screen in a new component or window
                console.log('Debug info:', { user, error });
                alert(`Debug Info:\nUser: ${user?.id}\nError: ${error}`);
              }}
              className="w-full text-xs"
            >
              Debug Info
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            If the problem persists, try initializing your account or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">SME Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onWallet}>
              <Wallet className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onProfile}>
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onMenu}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-[var(--jetdash-orange)]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Units Remaining</p>
                  <p className="text-2xl font-bold text-[var(--jetdash-brown)]">
                    {dashboardData?.sme.unitsRemaining || 0}
                  </p>
                </div>
                <Package className="w-8 h-8 text-[var(--jetdash-orange)]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--jetdash-green)]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                  <p className="text-2xl font-bold text-[var(--jetdash-brown)]">
                    {dashboardData?.totalDeliveries || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-[var(--jetdash-green)]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--jetdash-lilac)]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-lg font-bold text-[var(--jetdash-brown)]">
                    {formatCurrency(dashboardData?.wallet?.balance || 0)}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-[var(--jetdash-lilac)]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-[var(--jetdash-brown)]">
                    {dashboardData?.totalDeliveries ? 
                      Math.round((dashboardData.completedDeliveries / dashboardData.totalDeliveries) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <Button
            onClick={onPurchaseUnits}
            className="h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Purchase Units
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onCreateDelivery}
              disabled={!dashboardData?.sme.unitsRemaining}
              className="h-14 bg-[var(--jetdash-orange)] text-white hover:bg-[var(--jetdash-orange)]/90"
            >
              <Package className="w-5 h-5 mr-2" />
              Single Delivery
            </Button>
            <Button
              onClick={onCreateMultipleDelivery}
              disabled={!dashboardData?.sme.unitsRemaining}
              className="h-14 bg-[var(--jetdash-green)] text-white hover:bg-green-600"
            >
              <Package className="w-5 h-5 mr-2" />
              Multiple Deliveries
            </Button>
          </div>
        </div>

        {/* Unit Status Alert */}
        {dashboardData?.sme.unitsRemaining === 0 && (
          <Card className="border-[var(--jetdash-orange)] bg-[var(--jetdash-light-orange)]/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--jetdash-orange)] mt-0.5" />
                <div>
                  <h3 className="font-medium text-[var(--jetdash-brown)]">No Units Remaining</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Purchase more delivery units to continue creating deliveries. 
                    Units are charged at competitive rates.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-[var(--jetdash-orange)] text-white"
                    onClick={onPurchaseUnits}
                  >
                    Purchase Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="deliveries" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="deliveries">Recent Deliveries</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Plan Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--jetdash-brown)]">Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.deliveries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No deliveries yet</p>
                    <p className="text-sm">Create your first delivery to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.deliveries.slice(0, 5).map((delivery) => (
                      <div
                        key={delivery.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[var(--jetdash-orange)]/20 rounded-full">
                            <Package className="w-4 h-4 text-[var(--jetdash-orange)]" />
                          </div>
                          <div>
                            <p className="font-medium">#{delivery.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {delivery.pickupLocation} → {delivery.dropoffLocation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {formatDate(delivery.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(delivery.status)} border-0`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(delivery.status)}
                              {delivery.status}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--jetdash-brown)]">Usage Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Units Purchased</span>
                      <span className="font-medium">{(dashboardData?.sme.totalUnitsUsed || 0) + (dashboardData?.sme.unitsRemaining || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Units Used</span>
                      <span className="font-medium">{dashboardData?.sme.totalUnitsUsed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Units Remaining</span>
                      <span className="font-medium text-[var(--jetdash-green)]">{dashboardData?.sme.unitsRemaining || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[var(--jetdash-brown)]">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completed Deliveries</span>
                      <span className="font-medium">{dashboardData?.completedDeliveries || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-medium text-[var(--jetdash-green)]">
                        {dashboardData?.totalDeliveries ? 
                          Math.round((dashboardData.completedDeliveries / dashboardData.totalDeliveries) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <Badge className={dashboardData?.sme.isActive ? 
                        'bg-[var(--jetdash-green)]/20 text-[var(--jetdash-green)]' : 
                        'bg-destructive/20 text-destructive'
                      }>
                        {dashboardData?.sme.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-[var(--jetdash-brown)]">Plan Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Plan</span>
                    <Badge className="bg-[var(--jetdash-orange)]/20 text-[var(--jetdash-orange)] capitalize">
                      {dashboardData?.sme.plan || 'Basic'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Account Created</span>
                    <span className="font-medium">{formatDate(dashboardData?.sme.subscriptionDate || '')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Account Status</span>
                    <span className={`font-medium ${dashboardData?.sme.isActive ? 'text-[var(--jetdash-green)]' : 'text-destructive'}`}>
                      {dashboardData?.sme.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                  <h4 className="font-medium text-[var(--jetdash-brown)] mb-2">Unit Pricing</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>1-50 units</span>
                      <span>₦600 per unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span>51-100 units</span>
                      <span>₦550 per unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span>101+ units</span>
                      <span>₦500 per unit</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}