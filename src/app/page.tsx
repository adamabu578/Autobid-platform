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
import { CarFront, Gavel, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Landing() {
  const { user, userRole, refreshUser } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

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

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 relative overflow-hidden">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center z-10">
        {/* Left Side - Hero */}
        <div className="text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium mb-4">
            <Gavel className="size-4" />
            <span>Premium automobile auctions</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight">
            Find your dream car.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">Bid to win.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0">
            The premier destination for buying and selling premium automobiles through competitive live bidding.
          </p>

          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/10] xl:aspect-[2/1] rounded-2xl overflow-hidden mt-8 ring-1 ring-white/10 shadow-2xl shadow-orange-500/10 group">
            <img 
              src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=2000&auto=format&fit=crop" 
              alt="Premium Car Auction Illustration" 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
              <div>
                <p className="text-white font-bold text-xl drop-shadow-md">2023 Mercedes-Benz AMG</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-orange-400 font-bold text-lg drop-shadow-md">$115,000</span>
                  <span className="text-slate-300 text-sm font-medium">Current Bid</span>
                </div>
              </div>
              <div className="bg-orange-600/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold animate-pulse shadow-lg flex items-center gap-2">
                <span className="size-2 rounded-full bg-white block" />
                Live Now
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-transform hover:-translate-y-1 hover:border-white/20">
              <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Verified Sellers</h3>
                <p className="text-slate-400 text-sm mt-1">Every dealership and private seller is thoroughly vetted.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-transform hover:-translate-y-1 hover:border-white/20">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                <Gavel className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Live Bidding</h3>
                <p className="text-slate-400 text-sm mt-1">Experience the thrill of real-time competitive auctions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div>
          <Card className="w-full max-w-md mx-auto bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl shadow-orange-900/20 ring-1 ring-white/5">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="text-3xl text-white font-black tracking-tight">
                {isLogin ? 'Welcome Back' : 'Join AutoBids'}
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium text-sm">
                {isLogin ? 'Sign in to place bids and track your auctions' : 'Create an account to start bidding on premium vehicles'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={isLogin ? 'login' : 'signup'}
                onValueChange={(v) => setIsLogin(v === 'login')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-950/50 p-1 border border-white/5 rounded-xl">
                  <TabsTrigger
                    value="login"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-500 data-[state=active]:text-white text-slate-400 transition-all font-semibold py-2.5"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-500 data-[state=active]:text-white text-slate-400 transition-all font-semibold py-2.5"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <div className="mt-2">
                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleSignin} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-slate-300 ml-1 font-medium">Email Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <Label htmlFor="login-password" className="text-slate-300 font-medium">Password</Label>
                          <a href="#" className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium">Forgot password?</a>
                        </div>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/25 h-12 text-md font-bold mt-4 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Sign In'}
                      </Button>

                      <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                          <span className="bg-slate-900 px-4 text-slate-500 rounded-full border border-white/5">
                            Explore Demos
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDemoLogin('buyer')}
                          className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30 h-11 rounded-xl font-medium transition-all"
                          disabled={loading}
                        >
                          Demo Buyer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDemoLogin('seller')}
                          className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 h-11 rounded-xl font-medium transition-all"
                          disabled={loading}
                        >
                          Demo Seller
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-slate-300 ml-1 font-medium">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-slate-300 ml-1 font-medium">Email Address</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-slate-300 ml-1 font-medium">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-role" className="text-slate-300 ml-1 font-medium">I want to...</Label>
                        <Select value={role} onValueChange={(v: any) => setRole(v)}>
                          <SelectTrigger id="signup-role" className="bg-slate-950/50 border-white/10 text-white h-12 focus:ring-orange-500/20 rounded-xl">
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
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/25 h-12 text-md font-bold mt-6 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
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
    </div>
  );
}
