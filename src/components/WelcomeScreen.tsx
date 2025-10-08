import { Button } from "./ui/button";
import jetdashLogo from "figma:asset/65d0158fe7ae208ff3fd9bd401c0ba4ecb4059c8.png";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onDebug?: () => void;
}

export function WelcomeScreen({ onGetStarted, onDebug }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--jetdash-light-orange)]/20 to-[var(--jetdash-light-green)]/20">
      <div className="px-6 py-12 flex flex-col justify-center min-h-screen">
        {/* Logo and Title */}
        <div className="text-center mb-16 flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <img 
              src={jetdashLogo} 
              alt="JetDash Logo" 
              className="w-64 h-auto mx-auto"
            />
          </div>
          <p className="text-xl text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Fast, reliable package delivery service
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button 
            onClick={onGetStarted}
            className="w-full h-14 bg-[var(--jetdash-brown)] text-white hover:bg-[var(--jetdash-deep-brown)] rounded-2xl text-lg font-semibold shadow-lg"
          >
            Get Started
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Join thousands of satisfied customers
          </p>
        </div>
      </div>
    </div>
  );
}