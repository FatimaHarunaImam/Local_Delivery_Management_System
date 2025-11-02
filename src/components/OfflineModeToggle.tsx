import { useState, useEffect } from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineModeToggle() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const offlineMode = localStorage.getItem('jetdash_force_offline') === 'true';
    setIsOffline(offlineMode);
  }, []);

  const toggleOfflineMode = (checked: boolean) => {
    setIsOffline(checked);
    localStorage.setItem('jetdash_force_offline', checked.toString());
    
    // Show a message
    if (checked) {
      alert('Offline mode enabled. The app will use demo data instead of connecting to the backend.');
    } else {
      alert('Online mode enabled. The app will connect to Supabase backend. You may need to refresh the page.');
    }
    
    // Refresh after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border-2 border-[var(--jetdash-orange)] rounded-lg shadow-2xl p-4">
        <div className="flex items-center space-x-3">
          {isOffline ? (
            <WifiOff className="w-5 h-5 text-red-500" />
          ) : (
            <Wifi className="w-5 h-5 text-green-500" />
          )}
          <div className="flex flex-col">
            <Label htmlFor="offline-mode" className="text-sm font-semibold text-[var(--jetdash-brown)] cursor-pointer">
              Demo Mode
            </Label>
            <span className="text-xs text-muted-foreground">
              {isOffline ? 'Using mock data' : 'Connected to backend'}
            </span>
          </div>
          <Switch
            id="offline-mode"
            checked={isOffline}
            onCheckedChange={toggleOfflineMode}
            className="data-[state=checked]:bg-red-500"
          />
        </div>
      </div>
    </div>
  );
}
