import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeft, User, Package, Clock, Settings, HelpCircle, LogOut, CreditCard, MapPin } from "lucide-react";

interface MenuScreenProps {
  onBack: () => void;
  onProfile: () => void;
  onOrderHistory: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onLogout: () => void;
}

export function MenuScreen({ onBack, onProfile, onOrderHistory, onSettings, onHelp, onLogout }: MenuScreenProps) {
  const menuItems = [
    {
      icon: User,
      title: "Profile",
      description: "Edit your personal information",
      onClick: onProfile
    },
    {
      icon: Package,
      title: "Order History",
      description: "View your past deliveries",
      onClick: onOrderHistory
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      description: "Manage payment options",
      onClick: () => {}
    },
    {
      icon: MapPin,
      title: "Saved Addresses",
      description: "Manage pickup and delivery locations",
      onClick: () => {}
    },
    {
      icon: Settings,
      title: "Settings",
      description: "App preferences and notifications",
      onClick: onSettings
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help or contact support",
      onClick: onHelp
    }
  ];

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
          <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">Menu</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* User Profile Summary */}
        <Card className="shadow-jetdash border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--jetdash-brown)]">Fatima Abdullahi</h3>
                <p className="text-muted-foreground">+234 803 123 4567</p>
                <p className="text-sm text-muted-foreground">Member since Jan 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Card key={index} className="shadow-sm border-0">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  onClick={item.onClick}
                  className="w-full h-auto p-4 justify-start"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-10 h-10 bg-[var(--jetdash-light-orange)]/50 rounded-full flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[var(--jetdash-brown)]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-[var(--jetdash-brown)]">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Info */}
        <div className="mt-8 pt-6 border-t">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>JetDash v1.0.0</p>
            <p>Made with ❤️ in Gombe, Nigeria</p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full h-12 border-red-500 text-red-500 hover:bg-red-50 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}