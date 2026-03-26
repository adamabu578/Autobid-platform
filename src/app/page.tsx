"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/Root";
import { signup, signin } from "./utils/api";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import {
  Gavel, ShieldCheck, ArrowRight, Check, Clock, Heart, Eye,
  FileText, Zap, Headphones, ChevronRight, Play, Star, Car,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Mock auction data ─── */
const AUCTIONS = [
  {
    id: 1,
    title: "2023 Mercedes-Benz AMG GT 63 S",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop",
    currentBid: "$115,000",
    bids: 24,
    timeLeft: "2h 15m",
    tag: "Hot",
    tagColor: "bg-red-500",
  },
  {
    id: 2,
    title: "2022 Porsche 911 Turbo S",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop",
    currentBid: "$198,000",
    bids: 18,
    timeLeft: "5h 30m",
    tag: "New",
    tagColor: "bg-blue-500",
  },
  {
    id: 3,
    title: "2021 Ferrari F8 Tributo",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop",
    currentBid: "$325,000",
    bids: 45,
    timeLeft: "1h 5m",
    tag: "Ending Soon",
    tagColor: "bg-amber-500",
  },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Verified Sellers", description: "Every dealership and private seller is thoroughly vetted for your peace of mind." },
  { icon: Gavel, title: "Live Bidding", description: "Experience the thrill of real-time competitive auctions with instant notifications." },
  { icon: Star, title: "Premium Selection", description: "Curated collection of luxury, exotic, and collectible vehicles only." },
  { icon: FileText, title: "Complete Reports", description: "Detailed vehicle history and professional condition reports on every listing." },
  { icon: Zap, title: "Instant Settlement", description: "Secure and fast payment processing with full buyer protection." },
  { icon: Headphones, title: "Expert Support", description: "Dedicated concierge team available 24/7 to assist you." },
];

export default function Landing() {
  const { user, userRole, refreshUser } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password, name, role);
      await refreshUser();
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'buyer' | 'seller') => {
    setLoading(true);
    try {
      const demoEmails: Record<string, string> = {
        buyer: 'demo@buyer.com',
        seller: 'demo@seller.com'
      };
      await signin(demoEmails[demoRole], 'password123');
      await refreshUser();
      toast.success(`Signed in as Demo ${demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}`);
    } catch (error: any) {
      toast.error(error.message || 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signin(email, password);
      await refreshUser();
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // Redirect based on role
  if (user && userRole) {
    if (userRole === 'buyer') {
      router.push('/cars');
    } else if (userRole === 'seller') {
      router.push('/seller/dashboard');
    }
    return null;
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* ════════════════════════ NAVBAR ════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="text-xl font-black text-white tracking-tight">
            Auto<span className="text-orange-500">Bids</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollTo("auctions")} className="hover:text-white transition-colors">Auctions</button>
            <button onClick={() => scrollTo("features")} className="hover:text-white transition-colors">How it Works</button>
            <button onClick={() => scrollTo("auth")} className="hover:text-white transition-colors">Sell</button>
            <button onClick={() => scrollTo("footer")} className="hover:text-white transition-colors">Contact</button>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => scrollTo("auth")} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign in
            </button>
            <button
              onClick={() => { setIsLogin(false); scrollTo("auth"); }}
              className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/25"
            >
              Get Started
            </button>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-[#0a0e1a] border-t border-white/5 px-6 py-4 space-y-3 text-sm font-medium text-slate-300 animate-in slide-in-from-top-2">
            <button onClick={() => scrollTo("auctions")} className="block w-full text-left py-2 hover:text-white">Auctions</button>
            <button onClick={() => scrollTo("features")} className="block w-full text-left py-2 hover:text-white">How it Works</button>
            <button onClick={() => scrollTo("auth")} className="block w-full text-left py-2 hover:text-white">Sell</button>
            <button onClick={() => scrollTo("footer")} className="block w-full text-left py-2 hover:text-white">Contact</button>
            <button onClick={() => scrollTo("auth")} className="block w-full text-left py-2 text-orange-400 font-bold">Get Started →</button>
          </div>
        )}
      </nav>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative bg-gradient-to-br from-[#0a0e1a] via-[#101629] to-[#0d1220] pt-28 pb-20 lg:pb-28 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative w-full px-6 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold">
              <span className="size-2 rounded-full bg-green-400 animate-pulse" />
              Trusted by 10,000+ car enthusiasts
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Premium{" "}
              <span className="relative">
                <span className="relative z-10">automobile</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-orange-500/30 -z-0 rounded" />
              </span>
              <br />auctions
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Find your dream car. The premier destination for buying and selling premium automobiles through competitive live bidding.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollTo("auctions")}
                className="px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/25 flex items-center gap-2"
              >
                Browse Auctions <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => scrollTo("features")}
                className="px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 transition-all flex items-center gap-2"
              >
                <Play className="size-4" /> Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-black text-white">2,500+</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Cars Sold</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl font-black text-white">$240M+</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Total Traded</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl font-black text-white">98%</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/40 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1200&auto=format&fit=crop"
                alt="Premium Car Interior"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Floating "Live Auctions" pill */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between bg-[#0a0e1a]/80 backdrop-blur-xl rounded-xl px-5 py-3 border border-white/10">
              <div className="flex items-center gap-3">
                <span className="flex size-3 relative">
                  <span className="animate-ping absolute inset-0 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3 bg-green-500" />
                </span>
                <span className="text-white font-bold text-sm">Live Auctions</span>
              </div>
              <span className="text-slate-400 text-xs font-medium">12 active now</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ ACTIVE AUCTIONS ════════════════════════ */}
      <section id="auctions" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-black text-orange-500 uppercase tracking-[0.2em]">Auctions</span>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mt-2">Active Auctions</h2>
              <p className="text-slate-500 mt-2 max-w-md">Browse the hottest cars currently up for bidding. Don&apos;t miss your chance.</p>
            </div>
            <button className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-bold text-sm transition-colors shrink-0 group">
              View All Auctions <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Auction Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {AUCTIONS.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-slate-200/60 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`${car.tagColor} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
                      {car.tag}
                    </span>
                  </div>
                  <button className="absolute top-3 right-3 size-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="size-4 text-slate-500" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{car.title}</h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Eye className="size-3.5" /> {car.bids} bids</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> {car.timeLeft}</span>
                  </div>

                  <div className="flex items-end justify-between mt-5 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Current Bid</span>
                      <div className="text-xl font-black text-slate-900">{car.currentBid}</div>
                    </div>
                    <button
                      onClick={() => scrollTo("auth")}
                      className="px-5 py-2.5 rounded-xl bg-[#0a0e1a] hover:bg-[#161d33] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                      Bid Now <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ WHY CHOOSE US ════════════════════════ */}
      <section id="features" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">Why Choose Premium Auctions</h2>
            <p className="text-slate-500 mt-3">The most trusted platform for buying and selling luxury cars at your own price.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="group p-7 rounded-2xl bg-slate-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 border border-slate-100 hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/25">
                <div className="size-12 rounded-xl bg-[#0a0e1a] group-hover:bg-white flex items-center justify-center transition-colors duration-300 shadow-lg shadow-slate-200 group-hover:shadow-white/30">
                  <f.icon className="size-5 text-white group-hover:text-black" />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-white text-lg mt-5 transition-colors">{f.title}</h3>
                <p className="text-slate-500 group-hover:text-slate-400 text-sm mt-2 leading-relaxed transition-colors">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ AUTH / SIGN-IN SECTION ════════════════════════ */}
      <section id="auth" className="py-20 lg:py-28 bg-gradient-to-br from-[#0a0e1a] via-[#101629] to-[#0d1220] relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Welcome Text */}
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-black text-white">Welcome Back</h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Sign in to place bids, track your favorite auctions, and manage your collection.
            </p>
            <div className="space-y-4 pt-2">
              {[
                "Full access to live auctions in real time",
                "View your bid history and active listings",
                "Track your bidding history",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-5 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Check className="size-3 text-orange-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Auth Card */}
          <div>
            <Card className="w-full max-w-md mx-auto bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20 ring-1 ring-white/5">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-2xl text-white font-black tracking-tight">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  {isLogin ? 'Enter your credentials to continue' : 'Join thousands of car enthusiasts'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={isLogin ? 'login' : 'signup'}
                  onValueChange={(v) => setIsLogin(v === 'login')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 border border-white/5 rounded-xl">
                    <TabsTrigger
                      value="login"
                      className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white text-slate-400 transition-all font-semibold py-2"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white text-slate-400 transition-all font-semibold py-2"
                    >
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-2">
                    <TabsContent value="login" className="mt-0">
                      <form onSubmit={handleSignin} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="login-email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Email</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-11 rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="login-password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Password</Label>
                            <a href="#" className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold">Forgot?</a>
                          </div>
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-11 rounded-xl"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-orange-500 hover:bg-orange-400 text-white h-11 font-bold mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (<>Sign In <ArrowRight className="size-4" /></>)}
                        </Button>

                        {/* Demo Divider */}
                        <div className="relative my-5">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="bg-[#0f1526] px-3 text-slate-500">Explore Demos</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDemoLogin('buyer')}
                            className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 h-10 rounded-xl font-medium text-xs"
                            disabled={loading}
                          >
                            Demo Buyer
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDemoLogin('seller')}
                            className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 h-10 rounded-xl font-medium text-xs"
                            disabled={loading}
                          >
                            Demo Seller
                          </Button>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-0">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-name" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-11 rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-11 rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-11 rounded-xl"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="signup-role" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">I want to...</Label>
                          <Select value={role} onValueChange={(v: any) => setRole(v)}>
                            <SelectTrigger id="signup-role" className="bg-white/5 border-white/10 text-white h-11 focus:ring-orange-500/20 rounded-xl">
                              <SelectValue placeholder="Select an account type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                              <SelectItem value="buyer" className="focus:bg-orange-600/20 focus:text-white py-2.5 font-medium cursor-pointer">Buy Cars (Bidder)</SelectItem>
                              <SelectItem value="seller" className="focus:bg-orange-600/20 focus:text-white py-2.5 font-medium cursor-pointer">Sell Cars (Dealer/Private)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-orange-500 hover:bg-orange-400 text-white h-11 font-bold mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer id="footer" className="bg-[#0a0e1a] pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="text-xl font-black text-white tracking-tight">Auto<span className="text-orange-500">Bids</span></div>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-xs">The premier marketplace for buying and selling premium automobiles through competitive live bidding.</p>
              <div className="flex items-center gap-3 mt-5">
                {["M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                  "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
                  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                ].map((d, i) => (
                  <a key={i} href="#" className="size-8 rounded-full bg-white/5 hover:bg-orange-500/20 border border-white/10 flex items-center justify-center transition-colors">
                    <svg className="size-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d={d} /></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { heading: "Buyers", links: ["Browse Auctions", "Sell Your Car", "Car Financing", "Auction Rules", "FAQ"] },
              { heading: "Sellers", links: ["List a Vehicle", "Seller Dashboard", "Pricing Plans", "Seller Guide", "Support"] },
              { heading: "Company", links: ["About Us", "Careers", "Press", "Blog", "Contact"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-bold text-sm mb-5">{col.heading}</h4>
                <div className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <a key={link} href="#" className="text-slate-500 hover:text-orange-400 text-sm font-medium transition-colors">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4 text-xs text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} AutoBids. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
