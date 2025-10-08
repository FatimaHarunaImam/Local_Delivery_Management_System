import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Wifi, WifiOff, Bell, X, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationBannerProps {
  showOfflineMode?: boolean;
  showRealTimeUpdates?: boolean;
}

export function NotificationBanner({ showOfflineMode = true, showRealTimeUpdates = true }: NotificationBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Show offline mode banner if we're starting in offline mode
    if (!isOnline && showOfflineMode) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!showRealTimeUpdates) return;

    const handleDeliveryUpdate = (event: any) => {
      setNotifications(prev => [...prev, 'New delivery updates received'].slice(-3));
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
    };

    window.addEventListener('deliveryUpdate', handleDeliveryUpdate);
    
    return () => {
      window.removeEventListener('deliveryUpdate', handleDeliveryUpdate);
    };
  }, [showRealTimeUpdates]);

  // Don't show banner if explicitly hidden
  if (!showBanner && isOnline) return null;

  return (
    <>
      {/* Offline Mode Banner */}
      {(!isOnline || showBanner) && showOfflineMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <WifiOff className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm">Demo Mode Active</p>
                <p className="text-xs text-orange-100">
                  Using offline data simulation - All features are fully functional
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBanner(false)}
              className="text-white hover:bg-white/20 w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Real-time Update Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-40 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-right-4 duration-300"
            >
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium">Real-time Update</p>
                <p className="text-xs text-green-100">{notification}</p>
              </div>
              <CheckCircle className="w-4 h-4" />
            </div>
          ))}
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <Badge 
          className={`${
            isOnline 
              ? 'bg-green-500 text-white' 
              : 'bg-orange-500 text-white'
          } flex items-center space-x-2 px-3 py-2 shadow-lg`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span className="text-xs">Demo Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span className="text-xs">Offline</span>
            </>
          )}
        </Badge>
      </div>
    </>
  );
}