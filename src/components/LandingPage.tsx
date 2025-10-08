import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Package,
  Truck,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Star,
  ChevronRight,
  CheckCircle,
  Smartphone,
  Users,
  TrendingUp,
  Zap,
  Phone,
  Mail,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import jetdashLogo from "figma:asset/65d0158fe7ae208ff3fd9bd401c0ba4ecb4059c8.png";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin?: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const features = [
    {
      icon: <Package className="w-6 h-6 text-[var(--jetdash-orange)]" />,
      title: "Instant Delivery",
      description: "Send packages across Gombe State with real-time tracking and guaranteed delivery times"
    },
    {
      icon: <Truck className="w-6 h-6 text-[var(--jetdash-green)]" />,
      title: "Reliable Riders",
      description: "Professional motorcycle riders with excellent ratings and local area knowledge"
    },
    {
      icon: <Building className="w-6 h-6 text-[var(--jetdash-lilac)]" />,
      title: "SME Solutions",
      description: "Bulk delivery units for businesses with prepaid packages and volume discounts"
    },
    {
      icon: <Shield className="w-6 h-6 text-[var(--jetdash-brown)]" />,
      title: "Secure Payments",
      description: "Digital wallet system with instant transactions and comprehensive insurance"
    }
  ];

  const locations = [
    "Pantami District", "Gombe Central", "Tudun Wada", "Nasarawo",
    "Bolari", "Jekadafari", "Madaki", "Bambam", "Federal Lowcost"
  ];

  const stats = [
    { number: "10,000+", label: "Deliveries Completed", icon: <Package className="w-5 h-5" /> },
    { number: "500+", label: "Active Riders", icon: <Users className="w-5 h-5" /> },
    { number: "50+", label: "SME Partners", icon: <Building className="w-5 h-5" /> },
    { number: "4.9", label: "Average Rating", icon: <Star className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Fatima Imam",
      location: "Federal Lowcost",
      message: "JetDash has transformed how I run my business. Fast, reliable, and affordable!",
      rating: 5
    },
    {
      name: "Muhammad Bello",
      location: "Rider, Gombe Central",
      message: "Great platform for earning extra income. The app is easy to use and payments are instant.",
      rating: 5
    },
    {
      name: "Aisha Aliyu",
      location: "Tudun Wada",
      message: "Always on time! My go-to delivery service for all my packages.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={jetdashLogo} 
                alt="JetDash" 
                className="h-12 w-auto"
              />
              <span className="text-2xl font-bold text-[var(--jetdash-brown)]">JetDash</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200">Features</a>
              <a href="#services" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200">Services</a>
              <a href="#coverage" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200">Coverage</a>
              <a href="#testimonials" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200">Reviews</a>
              {onLogin && (
                <button 
                  onClick={onLogin}
                  className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200"
                >
                  Login
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[var(--jetdash-orange)]" />
                <span className="text-sm text-[var(--jetdash-brown)]">+234 803 123 4567</span>
              </div>
              <Button
                onClick={onGetStarted}
                className="bg-[var(--jetdash-orange)] hover:bg-[var(--jetdash-light-orange)] text-white px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200 py-2">Features</a>
                <a href="#services" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200 py-2">Services</a>
                <a href="#coverage" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200 py-2">Coverage</a>
                <a href="#testimonials" className="text-[var(--jetdash-brown)] hover:text-[var(--jetdash-orange)] transition-colors duration-200 py-2">Reviews</a>
                <div className="flex items-center space-x-2 py-2">
                  <Phone className="w-4 h-4 text-[var(--jetdash-orange)]" />
                  <span className="text-sm text-[var(--jetdash-brown)]">+234 803 123 4567</span>
                </div>
                <Button
                  onClick={onGetStarted}
                  className="bg-[var(--jetdash-orange)] hover:bg-[var(--jetdash-light-orange)] text-white rounded-xl"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--jetdash-brown)] via-[var(--jetdash-deep-brown)] to-[var(--jetdash-brown)] pt-20 min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-12 animate-pulse opacity-20"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--jetdash-orange)]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--jetdash-orange)]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[var(--jetdash-green)]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative px-6 py-12 lg:py-20 w-full">
          {/* Floating Elements */}
          <div className="absolute top-32 left-8 hidden lg:block animate-bounce" style={{animationDelay: '1s'}}>
            <div className="w-16 h-16 bg-[var(--jetdash-orange)]/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <Package className="w-8 h-8 text-[var(--jetdash-orange)]" />
            </div>
          </div>
          <div className="absolute top-40 right-12 hidden lg:block animate-bounce" style={{animationDelay: '2s'}}>
            <div className="w-14 h-14 bg-[var(--jetdash-green)]/20 rounded-full backdrop-blur-sm flex items-center justify-center">
              <Truck className="w-7 h-7 text-[var(--jetdash-green)]" />
            </div>
          </div>
          <div className="absolute bottom-32 left-12 hidden lg:block animate-bounce" style={{animationDelay: '3s'}}>
            <div className="w-12 h-12 bg-[var(--jetdash-lilac)]/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <Building className="w-6 h-6 text-[var(--jetdash-lilac)]" />
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center space-y-10 max-w-5xl mx-auto">
            <div className="space-y-8">
              <Badge className="bg-gradient-to-r from-[var(--jetdash-orange)]/20 to-[var(--jetdash-orange)]/10 text-[var(--jetdash-orange)] border-[var(--jetdash-orange)]/30 backdrop-blur-sm animate-in fade-in-0 slide-in-from-top-4 duration-1000 text-base px-6 py-2">
                <Zap className="w-5 h-5 mr-2" />
                Nigeria's #1 Fastest Growing Delivery Platform
              </Badge>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight text-white animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-200">
                <span className="block mb-4">Lightning Fast</span>
                <span className="text-[var(--jetdash-orange)] relative inline-block">
                  Delivery Service
                  <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] rounded-full animate-in slide-in-from-left-full duration-1500 delay-1000"></div>
                </span>
                <span className="block text-3xl md:text-4xl lg:text-5xl text-orange-100 mt-6 font-normal">
                  Across Gombe State & Beyond
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-orange-100 max-w-3xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-500 font-light">
                Your Gateway to Smart and Secure Deliveries
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-700">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] hover:from-[var(--jetdash-light-orange)] hover:to-[var(--jetdash-orange)] text-white px-12 py-6 rounded-3xl text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 border-2 border-white/20"
              >
                Start Your Journey
                <ChevronRight className="w-7 h-7 ml-3" />
              </Button>
              
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-orange-100">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-[var(--jetdash-green)]" />
                  <span className="text-lg">No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-[var(--jetdash-green)]" />
                  <span className="text-lg">Instant registration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-[var(--jetdash-green)]" />
                  <span className="text-lg">24/7 support</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-1000">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--jetdash-orange)] mb-2">10K+</div>
                <div className="text-sm text-orange-200">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--jetdash-green)] mb-2">500+</div>
                <div className="text-sm text-orange-200">Active Riders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--jetdash-lilac)] mb-2">50+</div>
                <div className="text-sm text-orange-200">Business Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.9★</div>
                <div className="text-sm text-orange-200">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section - Separated from Hero */}
      <div id="achievements" className="px-6 py-16 bg-gradient-to-b from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              Trusted Delivery Excellence
            </h2>
            <p className="text-xl text-orange-100 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
              Numbers that speak for our reliability across Gombe State
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000" style={{animationDelay: `${300 + index * 100}ms`}}>
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--jetdash-orange)]/20 transition-all duration-300 group-hover:scale-110">
                  <div className="text-[var(--jetdash-orange)]">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-orange-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Section with Real Images - Premium Design */}
      <div id="services" className="px-6 py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--jetdash-orange)] via-transparent to-[var(--jetdash-brown)] transform rotate-12 scale-150"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-[var(--jetdash-orange)]/20 to-[var(--jetdash-brown)]/20 text-[var(--jetdash-brown)] border-[var(--jetdash-orange)]/30 mb-6 px-6 py-2">
              <Star className="w-4 h-4 mr-2" />
              Experience the Future
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-[var(--jetdash-brown)] mb-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              Revolutionary Delivery
              <span className="text-[var(--jetdash-orange)] block">Ecosystem</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200 leading-relaxed">
              Join thousands of satisfied customers, riders, and businesses transforming how Nigeria moves
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Customer Experience - Enhanced */}
            <Card className="border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-300 hover:scale-105">
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWNrYWdlJTIwZGVsaXZlcnklMjBzZXJ2aWNlJTIwYWZyaWNhfGVufDF8fHx8MTc1ODgyODg2MXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Package Delivery Service"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4">
                  <Badge className="bg-gradient-to-r from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] text-white px-4 py-2 shadow-lg">
                    <Package className="w-4 h-4 mr-2" />
                    For Customers
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white">
                    <p className="font-bold text-lg mb-1">₦600+</p>
                    <p className="text-sm text-gray-200">Starting price</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[var(--jetdash-brown)] mb-4">
                  Send Packages Instantly
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  From ₦600, send your packages anywhere in Gombe State with real-time tracking, insurance coverage, and guaranteed delivery times.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">30min avg</p>
                      <p className="text-xs text-muted-foreground">Delivery time</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Insured</p>
                      <p className="text-xs text-muted-foreground">Full coverage</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] text-white hover:from-[var(--jetdash-deep-brown)] hover:to-[var(--jetdash-brown)] shadow-lg">
                  Start Sending
                </Button>
              </CardContent>
            </Card>

            {/* Rider Experience - Enhanced */}
            <Card className="border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-500 hover:scale-105">
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwZGVsaXZlcnklMjByaWRlciUyMGFmcmljYXxlbnwxfHx8fDE3NTg4Mjg4NTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Motorcycle Delivery Rider"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4">
                  <Badge className="bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] text-white px-4 py-2 shadow-lg">
                    <Truck className="w-4 h-4 mr-2" />
                    For Riders
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white">
                    <p className="font-bold text-lg mb-1">₦5,000+</p>
                    <p className="text-sm text-gray-200">Daily earnings</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[var(--jetdash-brown)] mb-4">
                  Earn Money Riding
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Flexible working hours, instant payments directly to your wallet, comprehensive insurance, and the opportunity to earn ₦5,000+ daily.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">₦5k+/day</p>
                      <p className="text-xs text-muted-foreground">Potential earnings</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Instant pay</p>
                      <p className="text-xs text-muted-foreground">Real-time deposits</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] text-white hover:from-[var(--jetdash-light-orange)] hover:to-[var(--jetdash-orange)] shadow-lg">
                  Start Earning
                </Button>
              </CardContent>
            </Card>

            {/* Business Experience - Enhanced */}
            <Card className="border-0 shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000 delay-700 hover:scale-105">
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRhc2hib2FyZCUyMG9mZmljZSUyMGFmcmljYXxlbnwxfHx8fDE3NTg3MzA0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Business Dashboard Interface"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4">
                  <Badge className="bg-gradient-to-r from-[var(--jetdash-lilac)] to-purple-600 text-white px-4 py-2 shadow-lg">
                    <Building className="w-4 h-4 mr-2" />
                    For SMEs
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white">
                    <p className="font-bold text-lg mb-1">30% savings</p>
                    <p className="text-sm text-gray-200">With bulk units</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[var(--jetdash-brown)] mb-4">
                  Scale Your Business
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Prepaid delivery units with volume discounts, dedicated business dashboard, priority support, and analytics. Perfect for e-commerce and retail.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">30% savings</p>
                      <p className="text-xs text-muted-foreground">Bulk discounts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Dashboard</p>
                      <p className="text-xs text-muted-foreground">Analytics included</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-[var(--jetdash-lilac)] to-purple-600 text-white hover:from-purple-600 hover:to-[var(--jetdash-lilac)] shadow-lg">
                  Scale Business
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-[var(--jetdash-brown)] mb-2">99.9% Success Rate</h4>
              <p className="text-muted-foreground">Reliable delivery with comprehensive tracking and insurance coverage.</p>
            </div>
            
            <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-[var(--jetdash-green)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-[var(--jetdash-green)]" />
              </div>
              <h4 className="text-xl font-bold text-[var(--jetdash-brown)] mb-2">Real-time Tracking</h4>
              <p className="text-muted-foreground">Track your packages live with GPS precision and delivery updates.</p>
            </div>
            
            <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold text-[var(--jetdash-brown)] mb-2">24/7 Support</h4>
              <p className="text-muted-foreground">Round-the-clock customer support in English and local languages.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--jetdash-brown)] mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              Why Choose JetDash?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
              Built specifically for Gombe State with local insights, reliable service, and cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group animate-in fade-in-0 slide-in-from-bottom-4 duration-1000" style={{animationDelay: `${400 + index * 200}ms`}}>
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="p-4 bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[var(--jetdash-brown)] mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-6 py-20 bg-gradient-to-br from-gray-900 via-[var(--jetdash-deep-brown)] to-black text-white relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--jetdash-orange)]/10 via-transparent to-[var(--jetdash-orange)]/10 animate-pulse"></div>
          <div className="absolute top-20 left-10 w-64 h-64 bg-[var(--jetdash-orange)]/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '8s'}}></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[var(--jetdash-green)]/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '10s', animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="bg-white/10 text-white border-white/20 mb-6 px-6 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              How JetDash
              <span className="text-[var(--jetdash-orange)] block">Works for You</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple ways to join Nigeria's most innovative delivery ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Path */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Send Packages</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Book deliveries instantly, track in real-time, and pay securely through our platform. Starting from just ₦600.
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-gray-300">Enter pickup & delivery details</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <span className="text-gray-300">Choose rider & pay online</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <span className="text-gray-300">Track delivery in real-time</span>
                  </div>
                </div>
                <Badge className="mt-6 bg-[var(--jetdash-brown)] text-white">
                  Most Popular Choice
                </Badge>
              </CardContent>
            </Card>

            {/* Rider Path */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Earn as Rider</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Join our fleet, set your hours, and earn instant payments. Professional riders earn ₦5,000+ daily.
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-gray-300">Complete rider verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <span className="text-gray-300">Go online & accept deliveries</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <span className="text-gray-300">Get paid instantly to wallet</span>
                  </div>
                </div>
                <Badge className="mt-6 bg-[var(--jetdash-orange)] text-white">
                  Earn ₦5,000+/day
                </Badge>
              </CardContent>
            </Card>

            {/* SME Path */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-500 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--jetdash-lilac)] to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Scale Business</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Buy delivery units in bulk, create multiple deliveries, and save up to 30% on delivery costs.
                </p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <span className="text-gray-300">Purchase delivery units</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <span className="text-gray-300">Create bulk deliveries</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <span className="text-gray-300">Track all from dashboard</span>
                  </div>
                </div>
                <Badge className="mt-6 bg-[var(--jetdash-lilac)] text-white">
                  Save 30% on Volume
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] hover:from-[var(--jetdash-light-orange)] hover:to-[var(--jetdash-orange)] text-white px-12 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110"
            >
              <Star className="w-6 h-6 mr-3" />
              Join JetDash Today
              <ChevronRight className="w-6 h-6 ml-3" />
            </Button>
            <p className="text-gray-400 text-sm mt-4">
              Trusted by 10,000+ users across Gombe State
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--jetdash-brown)] mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
              Real stories from real people across Gombe State
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-8 duration-1000" style={{animationDelay: `${400 + index * 200}ms`}}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[var(--jetdash-orange)] fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.message}"
                  </p>
                  <div>
                    <p className="font-semibold text-[var(--jetdash-brown)]">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Area */}
      <div id="coverage" className="px-6 py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-[var(--jetdash-green)]/20 to-[var(--jetdash-orange)]/20 text-[var(--jetdash-brown)] border-[var(--jetdash-green)]/30 mb-6 px-6 py-2">
              <MapPin className="w-4 h-4 mr-2" />
              Comprehensive Coverage
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--jetdash-brown)] mb-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              Service Coverage Areas
            </h2>
            <p className="text-xl text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
              Fast and reliable delivery across Gombe State's major districts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Primary Coverage Areas */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[var(--jetdash-green)]/5 to-[var(--jetdash-green)]/10">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--jetdash-green)] rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--jetdash-brown)]">Primary Coverage</h3>
                    <p className="text-sm text-muted-foreground">30-minute average delivery</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {locations.slice(0, 6).map((location, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 bg-[var(--jetdash-green)] rounded-full"></div>
                      <span className="font-medium text-[var(--jetdash-brown)]">{location}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-[var(--jetdash-green)]/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--jetdash-green)]">Express Delivery</p>
                      <p className="text-sm text-muted-foreground">Starting from ₦600</p>
                    </div>
                    <Badge className="bg-[var(--jetdash-green)] text-white">
                      20-30 min
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extended Coverage Areas */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[var(--jetdash-orange)]/5 to-[var(--jetdash-orange)]/10">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--jetdash-orange)] rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--jetdash-brown)]">Extended Coverage</h3>
                    <p className="text-sm text-muted-foreground">45-minute average delivery</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {locations.slice(6).map((location, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 bg-[var(--jetdash-orange)] rounded-full"></div>
                      <span className="font-medium text-[var(--jetdash-brown)]">{location}</span>
                    </div>
                  ))}
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm">
                    <div className="w-2 h-2 bg-[var(--jetdash-orange)] rounded-full"></div>
                    <span className="font-medium text-[var(--jetdash-brown)]">More areas coming</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-[var(--jetdash-orange)]/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--jetdash-orange)]">Standard Delivery</p>
                      <p className="text-sm text-muted-foreground">Starting from ₦750</p>
                    </div>
                    <Badge className="bg-[var(--jetdash-orange)] text-white">
                      30-45 min
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coverage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--jetdash-green)] to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-[var(--jetdash-brown)] mb-2">15+</h4>
              <p className="text-muted-foreground">Coverage Areas</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--jetdash-orange)] to-[var(--jetdash-light-orange)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-[var(--jetdash-brown)] mb-2">30min</h4>
              <p className="text-muted-foreground">Average Delivery</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--jetdash-brown)] to-[var(--jetdash-deep-brown)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-[var(--jetdash-brown)] mb-2">100%</h4>
              <p className="text-muted-foreground">Insured Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-16 bg-gradient-to-br from-[var(--jetdash-brown)] via-[var(--jetdash-deep-brown)] to-[var(--jetdash-brown)] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -rotate-12"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Experience Fast Delivery?
          </h2>
          <p className="text-xl md:text-2xl text-orange-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers, riders, and businesses across Gombe State
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-[var(--jetdash-orange)] hover:bg-[var(--jetdash-light-orange)] text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your First Delivery
              <Package className="w-6 h-6 ml-2" />
            </Button>
            
            <div className="flex items-center space-x-3 text-orange-100">
              <CheckCircle className="w-6 h-6 text-[var(--jetdash-green)]" />
              <span className="text-lg">No setup fees • Instant registration • Free to start</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="relative bg-gradient-to-br from-[var(--jetdash-deep-brown)] via-[var(--jetdash-brown)] to-black text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--jetdash-orange)] via-transparent to-[var(--jetdash-orange)] transform rotate-12"></div>
          <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--jetdash-orange)]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-[var(--jetdash-green)]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-6 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <img 
                      src={jetdashLogo} 
                      alt="JetDash" 
                      className="h-10 w-auto"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">JetDash</h3>
                    <p className="text-[var(--jetdash-orange)] font-medium">Your Gateway to Smart and Secure Deliveries</p>
                  </div>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                  Connecting customers, riders, and businesses across Gombe State with Nigeria's most reliable delivery platform.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--jetdash-green)] rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-300">Live Service Active</span>
                  </div>
                  <Badge className="bg-[var(--jetdash-orange)] text-white">
                    10,000+ Deliveries Completed
                  </Badge>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <a href="#features" className="block text-gray-300 hover:text-[var(--jetdash-orange)] transition-colors duration-200">Features</a>
                  <a href="#services" className="block text-gray-300 hover:text-[var(--jetdash-orange)] transition-colors duration-200">Services</a>
                  <a href="#coverage" className="block text-gray-300 hover:text-[var(--jetdash-orange)] transition-colors duration-200">Coverage Areas</a>
                  <a href="#testimonials" className="block text-gray-300 hover:text-[var(--jetdash-orange)] transition-colors duration-200">Reviews</a>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-white mb-4">Get In Touch</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[var(--jetdash-orange)]/20 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-[var(--jetdash-orange)]" />
                    </div>
                    <span className="text-gray-300">+234 803 123 4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[var(--jetdash-orange)]/20 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-[var(--jetdash-orange)]" />
                    </div>
                    <span className="text-gray-300">hello@jetdash.ng</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[var(--jetdash-green)]/20 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[var(--jetdash-green)]" />
                    </div>
                    <span className="text-gray-300">Gombe State, Nigeria</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--jetdash-orange)] mb-1">10,000+</div>
                <div className="text-sm text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--jetdash-green)] mb-1">500+</div>
                <div className="text-sm text-gray-400">Active Riders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--jetdash-lilac)] mb-1">50+</div>
                <div className="text-sm text-gray-400">Business Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.9★</div>
                <div className="text-sm text-gray-400">User Rating</div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <p className="text-gray-400">© 2024 JetDash. All rights reserved.</p>
                <Badge className="bg-white/10 text-white">
                  Licensed & Insured
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-[var(--jetdash-orange)] rounded-full border-2 border-white/20"></div>
                  <div className="w-8 h-8 bg-[var(--jetdash-green)] rounded-full border-2 border-white/20"></div>
                  <div className="w-8 h-8 bg-[var(--jetdash-lilac)] rounded-full border-2 border-white/20"></div>
                </div>
                <span className="text-sm text-gray-400">Trusted by thousands</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}