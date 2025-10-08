import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Package, Wallet } from "lucide-react";

interface EarningsScreenProps {
  user?: any;
  onBack: () => void;
  onWallet?: () => void;
}

export function EarningsScreen({ user, onBack, onWallet }: EarningsScreenProps) {
  const todaysEarnings = {
    total: "₦4,250",
    deliveries: 12,
    bonus: "₦350",
    tips: "₦200"
  };

  const weeklyStats = {
    total: "₦28,750",
    deliveries: 78,
    average: "₦368"
  };

  const recentDeliveries = [
    {
      id: "1",
      customer: "Hauwa Musa",
      from: "Pantami",
      to: "Gombe Central", 
      time: "2:30 PM",
      earnings: "₦700",
      status: "completed"
    },
    {
      id: "2",
      customer: "Aisha Aliyu",
      from: "Tudun Wada",
      to: "Nasarawo",
      time: "1:45 PM", 
      earnings: "₦400",
      status: "completed"
    },
    {
      id: "3",
      customer: "Khadija Ibrahim",
      from: "Bolari",
      to: "Jekadafari",
      time: "12:20 PM",
      earnings: "₦1,000",
      status: "completed"
    },
    {
      id: "4",
      customer: "Zainab Usman",
      from: "Madaki",
      to: "Bambam",
      time: "11:15 AM",
      earnings: "₦550",
      status: "completed"
    },
    {
      id: "5",
      customer: "Amina Garba",
      from: "Herwagana",
      to: "Pantami",
      time: "10:30 AM",
      earnings: "₦650",
      status: "completed"
    }
  ];

  const weeklyBreakdown = [
    { day: "Mon", earnings: "₦3,200", deliveries: 9 },
    { day: "Tue", earnings: "₦4,100", deliveries: 11 },
    { day: "Wed", earnings: "₦3,850", deliveries: 10 },
    { day: "Thu", earnings: "₦4,250", deliveries: 12 },
    { day: "Fri", earnings: "₦5,100", deliveries: 14 },
    { day: "Sat", earnings: "₦4,750", deliveries: 13 },
    { day: "Sun", earnings: "₦3,500", deliveries: 9 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
              className="w-10 h-10 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">Earnings</h1>
          </div>
          {onWallet && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onWallet}
              className="border-[var(--jetdash-orange)] text-[var(--jetdash-orange)] hover:bg-[var(--jetdash-orange)] hover:text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Wallet
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {/* Today's Summary */}
            <Card className="shadow-jetdash border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-[var(--jetdash-brown)]">Today's Summary</h3>
                  <Badge variant="secondary" className="bg-[var(--jetdash-green)]/20 text-[var(--jetdash-green)]">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Badge>
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-[var(--jetdash-brown)] mb-2">
                    {todaysEarnings.total}
                  </p>
                  <p className="text-muted-foreground">Total earnings</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[var(--jetdash-orange)]">
                      {todaysEarnings.deliveries}
                    </p>
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[var(--jetdash-green)]">
                      {todaysEarnings.bonus}
                    </p>
                    <p className="text-xs text-muted-foreground">Bonus</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[var(--jetdash-lilac)]">
                      {todaysEarnings.tips}
                    </p>
                    <p className="text-xs text-muted-foreground">Tips</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Deliveries */}
            <div>
              <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">
                Recent Deliveries
              </h3>
              
              <div className="space-y-3">
                {recentDeliveries.map((delivery) => (
                  <Card key={delivery.id} className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          
                          <div>
                            <p className="font-medium text-[var(--jetdash-brown)]">
                              {delivery.customer}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {delivery.from} → {delivery.to}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-[var(--jetdash-brown)]">
                            {delivery.earnings}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {delivery.time}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            {/* Weekly Summary */}
            <Card className="shadow-jetdash border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-[var(--jetdash-brown)]">This Week</h3>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+12%</span>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-[var(--jetdash-brown)] mb-2">
                    {weeklyStats.total}
                  </p>
                  <p className="text-muted-foreground">Total earnings</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-xl font-semibold text-[var(--jetdash-orange)]">
                      {weeklyStats.deliveries}
                    </p>
                    <p className="text-sm text-muted-foreground">Total deliveries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-[var(--jetdash-green)]">
                      {weeklyStats.average}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg per delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Breakdown */}
            <div>
              <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">
                Daily Breakdown
              </h3>
              
              <div className="space-y-3">
                {weeklyBreakdown.map((day) => (
                  <Card key={day.day} className="shadow-sm border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[var(--jetdash-light-orange)]/30 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[var(--jetdash-brown)]" />
                          </div>
                          
                          <div>
                            <p className="font-medium text-[var(--jetdash-brown)]">
                              {day.day}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {day.deliveries} deliveries
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-lg font-semibold text-[var(--jetdash-brown)]">
                          {day.earnings}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}