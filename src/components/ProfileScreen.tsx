import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, User, Edit, Camera, LogOut, Shield, Star, AlertTriangle } from "lucide-react";

interface ProfileScreenProps {
  user: any;
  onBack: () => void;
  onLogout?: () => void;
}

export function ProfileScreen({ user, onBack, onLogout }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "Please set your name",
    email: user?.email || "Please set your email",
    phone: user?.phone || "Please set your phone",
    address: user?.address || "Please set your address"
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

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
            <h1 className="text-xl font-semibold text-[var(--jetdash-brown)]">Profile</h1>
          </div>
          
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 rounded-full"
            >
              <Edit className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Profile Picture */}
        <Card className="shadow-jetdash border-0 mb-6">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              {isEditing && (
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--jetdash-brown)] rounded-full"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <h3 className="text-xl font-semibold text-[var(--jetdash-brown)]">
              {isEditing ? editedProfile.name : profile.name}
            </h3>
            <p className="text-muted-foreground capitalize">{user?.userType || 'User'}</p>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-[var(--jetdash-brown)]">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                ) : (
                  <p className="mt-1 p-3 text-[var(--jetdash-brown)]">{profile.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                ) : (
                  <p className="mt-1 p-3 text-[var(--jetdash-brown)]">{profile.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                ) : (
                  <p className="mt-1 p-3 text-[var(--jetdash-brown)]">{profile.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">
                  Default Address
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                    className="mt-1 h-12 bg-[var(--input-background)] border-0 rounded-xl"
                  />
                ) : (
                  <p className="mt-1 p-3 text-[var(--jetdash-brown)]">{profile.address}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {user?.userType === 'rider' && (
          <Card className="shadow-sm border-0 mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Delivery Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[var(--jetdash-orange)]">34</p>
                  <p className="text-sm text-muted-foreground">Total Deliveries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[var(--jetdash-orange)]">4.7</p>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Actions */}
        <Card className="shadow-sm border-0 mt-6">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-[var(--jetdash-brown)] mb-4">Account Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-[var(--jetdash-brown)] hover:bg-muted/50"
              >
                <Shield className="w-5 h-5 mr-3" />
                Privacy & Security
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-[var(--jetdash-brown)] hover:bg-muted/50"
              >
                <Star className="w-5 h-5 mr-3" />
                Rate JetDash
              </Button>
              
              {onLogout && (
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  className="w-full justify-start h-12 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="fixed bottom-6 left-6 right-6 space-y-3">
          <Button 
            onClick={handleSave}
            className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] rounded-2xl text-lg font-semibold shadow-lg"
          >
            Save Changes
          </Button>
          
          <Button 
            onClick={handleCancel}
            variant="outline"
            className="w-full h-12 border-[var(--jetdash-brown)] text-[var(--jetdash-brown)] rounded-xl"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}