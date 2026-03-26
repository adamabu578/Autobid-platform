"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/Root";
import { signup, signin, getCars, type Car } from "./utils/api";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "./components/ui/dialog";
import { Search, UserRound, ArrowRight, ShieldCheck, Trophy, Zap, Gavel, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "./components/ui/theme-toggle";

export default function Landing() {
  const { user, userRole, refreshUser } = useAuth();
  const router = useRouter();
  
  // Auth Form states
  const [isLogin, setIsLogin] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  // Marketing states
  const [previewCars, setPreviewCars] = useState<Car[]>([]);

  useEffect(() => {
    // Redirect if already logged in
    if (user && userRole) {
      if (userRole === 'buyer') router.push('/cars');
      else if (userRole === 'seller') router.push('/seller/dashboard');
    }
  }, [user, userRole, router]);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const data = await getCars();
        const active = data.filter(c => c.status === 'active').slice(0, 3);
        setPreviewCars(active);
      } catch (e) {
        console.log("Failed to load previews", e);
      }
    };
    loadPreview();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password, name, role);
      await refreshUser();
      toast.success('Account created successfully!');
      setAuthOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'buyer' | 'seller') => {
    setLoading(true);
    try {
      const demoEmails: Record<string, string> = { buyer: 'demo@buyer.com', seller: 'demo@seller.com' };
      await signin(demoEmails[demoRole], 'password123');
      await refreshUser();
      toast.success(`Signed in as Demo ${demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}`);
      setAuthOpen(false);
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
      setAuthOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  // Auth Modal Design (Glassmorphic)
  const AuthModal = ({ triggerElement }: { triggerElement: React.ReactNode }) => (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogTrigger asChild>
        {triggerElement}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/90 dark:bg-black/80 backdrop-blur-3xl border border-slate-200 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] p-0 overflow-hidden rounded-[2rem]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-bl-full -mr-8 -mt-8 pointer-events-none blur-3xl opacity-50" />
        <div className="p-8 pb-10 relative z-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {isLogin ? 'Welcome Back' : 'Join AutoBids'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-zinc-400 font-medium mt-2">
              {isLogin ? 'Sign in to place bids and track your premium auctions' : 'Create your account to unlock the world\'s finest vehicles'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-slate-500 dark:text-zinc-500 font-bold py-2.5 transition-all shadow-sm dark:shadow-none">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-slate-500 dark:text-zinc-500 font-bold py-2.5 transition-all shadow-sm dark:shadow-none">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-500 dark:text-zinc-400 ml-1 text-[10px] uppercase font-black tracking-widest">Email</Label>
                  <Input id="login-email" type="email" placeholder="collector@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus:border-orange-500 font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600" required />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1"><Label htmlFor="login-password" className="text-slate-500 dark:text-zinc-400 text-[10px] uppercase font-black tracking-widest">Password</Label></div>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus:border-orange-500 font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600" required />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 h-14 font-black mt-2 rounded-xl transition-transform hover:scale-[1.02]">
                  {loading ? <div className="size-5 border-2 border-white/30 dark:border-black/30 border-t-transparent dark:border-t-black rounded-full animate-spin" /> : 'Sign In Securely'}
                </Button>

                <div className="relative my-8 text-center">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-white/10" /></div>
                  <span className="relative bg-white dark:bg-zinc-950 px-4 text-[10px] uppercase font-black text-slate-400 dark:text-zinc-500 tracking-widest rounded-full border border-slate-200 dark:border-white/10">Quick Access</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" onClick={() => handleDemoLogin('buyer')} disabled={loading} className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 h-11 rounded-xl font-bold bg-white dark:bg-white/5 border-b-2">Buyer Demo</Button>
                  <Button type="button" variant="outline" onClick={() => handleDemoLogin('seller')} disabled={loading} className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 h-11 rounded-xl font-bold bg-white dark:bg-white/5 border-b-2">Seller Demo</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-slate-500 dark:text-zinc-400 ml-1 text-[10px] uppercase font-black tracking-widest">Full Name</Label>
                  <Input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus:border-orange-500" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-slate-500 dark:text-zinc-400 ml-1 text-[10px] uppercase font-black tracking-widest">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus:border-orange-500" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-slate-500 dark:text-zinc-400 ml-1 text-[10px] uppercase font-black tracking-widest">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl focus:border-orange-500" required />
                </div>
                <div className="space-y-2 pb-2">
                  <Label className="text-slate-500 dark:text-zinc-400 ml-1 text-[10px] uppercase font-black tracking-widest">I want to...</Label>
                  <Select value={role} onValueChange={(v: any) => setRole(v)}>
                    <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium rounded-xl">
                      <SelectItem value="buyer">Buy Cars (Bidder)</SelectItem>
                      <SelectItem value="seller">Sell Cars (Dealer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white dark:text-black h-14 font-black mt-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-transform hover:scale-[1.02]">
                  {loading ? <div className="size-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white selection:bg-orange-500/30 font-sans overflow-x-hidden transition-colors duration-500">
      
      {/* Floating Glass Nav */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 lg:px-12 pointer-events-none">
        <nav className="pointer-events-auto w-full bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-2xl rounded-full px-6 lg:px-10 py-3 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-colors duration-500">
           <div className="flex items-center gap-3 pl-2">
             <div className="bg-orange-500 p-2 rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.5)]">
               <Gavel className="size-4 text-white" />
             </div>
             <span className="text-xl lg:text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Auto<span className="text-orange-500">Bids</span></span>
           </div>
           
           <div className="hidden lg:flex items-center gap-10 text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-zinc-400">
             <a href="#" className="text-slate-900 dark:text-white">Auctions</a>
             <a href="#sell" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sell</a>
             <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
             <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
           </div>
           
           <div className="flex items-center gap-4">
             <button className="hidden sm:flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
               <Search className="size-4" />
             </button>
             <ThemeToggle />
             <AuthModal triggerElement={
               <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 lg:px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                 Sign In
               </button>
             }/>
           </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 md:pb-40 flex flex-col items-center justify-center min-h-screen">
        {/* Massive Background Image Bleeding Edge */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-10 transition-colors duration-500" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 dark:from-black to-transparent z-10 transition-colors duration-500" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-50 dark:from-black to-transparent z-10 transition-colors duration-500" />
          <img 
            src="https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?q=80&w=2500&auto=format&fit=crop" 
            alt="Exotic Car Background" 
            className="w-full h-full object-cover md:object-center object-[80%_center]"
          />
        </div>
        
        {/* Cinematic Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] lg:w-[1200px] h-[600px] bg-gradient-to-tr from-orange-600/50 to-amber-500/30 blur-[150px] rounded-[100%] pointer-events-none mix-blend-screen opacity-60 z-10 transition-opacity duration-500" />
        
        <div className="relative z-20 text-center w-full max-w-7xl mx-auto px-6 mt-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-orange-500/30 bg-black/30 backdrop-blur-md mb-10 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Sparkles className="size-4 text-orange-400" />
            <span className="text-orange-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">The New Era of Automotive Auctions</span>
          </div>
          
          <h1 className="text-6xl md:text-[6rem] lg:text-[8.5rem] font-black tracking-tighter leading-[0.9] text-white drop-shadow-2xl mb-8">
            Collect the <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Extraordinary.</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-slate-200 font-medium max-w-3xl mx-auto mb-14 leading-relaxed drop-shadow-md">
            The world's most exclusive marketplace for vetted luxury, exotic, and classic vehicles. Bid live. Win securely.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AuthModal triggerElement={
              <button className="w-full sm:w-auto bg-white text-black px-10 h-16 rounded-full text-sm font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(255,255,255,0.2)] group">
                Start Bidding <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
            }/>
            <AuthModal triggerElement={
              <button className="w-full sm:w-auto bg-black/40 border border-white/20 backdrop-blur-md text-white px-10 h-16 rounded-full text-sm font-black uppercase tracking-widest hover:bg-black/60 transition-colors shadow-lg">
                Sell Your Vehicle
              </button>
            }/>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-12 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-black relative z-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-12 sm:gap-16 lg:gap-32 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <span className="text-xl lg:text-2xl font-black font-serif tracking-tight text-slate-900 dark:text-white">MotorTrend</span>
           <span className="text-xl lg:text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Bloomberg</span>
           <span className="text-xl lg:text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">TopGear</span>
           <span className="text-xl lg:text-2xl font-black tracking-widest text-transparent hidden dark:block" style={{ WebkitTextStroke: '1px white' }}>FORBES</span>
           <span className="text-xl lg:text-2xl font-black tracking-widest text-transparent block dark:hidden" style={{ WebkitTextStroke: '1px black' }}>FORBES</span>
           <span className="text-xl lg:text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Evo</span>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-32 bg-slate-50 dark:bg-[#030409] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24 md:flex items-end justify-between">
            <div className="max-w-2xl">
              <h2 className="text-5xl lg:text-[4rem] font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
                Uncompromising <br/>
                <span className="text-slate-400 dark:text-zinc-500">Standards.</span>
              </h2>
            </div>
            <p className="text-slate-500 dark:text-zinc-500 text-lg md:text-xl max-w-sm mt-8 md:mt-0 font-medium leading-relaxed">
              We removed the friction from high-end vehicle sales. Experience absolute transparency and ironclad security.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Spanning 2 cols */}
            <div className="md:col-span-2 bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-[2.5rem] p-10 lg:p-14 relative overflow-hidden group transition-colors duration-500">
               <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               <ShieldCheck className="size-14 text-orange-500 mb-10" strokeWidth={1.5} />
               <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">100% Verified Inventory</h3>
               <p className="text-slate-500 dark:text-zinc-400 text-lg max-w-md leading-relaxed font-medium">Every vehicle on our platform undergoes a rigorous multi-point inspection, title check, and seller background verification. We guarantee authenticity.</p>
               <img src="https://images.unsplash.com/photo-1555097479-7f5519ab76a3?q=80&w=800&auto=format&fit=crop" className="absolute right-0 bottom-0 w-1/2 h-full object-cover rounded-tl-full opacity-10 dark:opacity-30 group-hover:opacity-40 dark:group-hover:opacity-50 transition-all duration-700 mix-blend-luminosity hover:mix-blend-normal mask-image-gradient" />
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-[2.5rem] p-10 relative overflow-hidden group transition-colors duration-500">
               <Zap className="size-12 text-slate-800 dark:text-white mb-8 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
               <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Live Bidding</h3>
               <p className="text-slate-500 dark:text-zinc-400 text-[15px] leading-relaxed font-medium">Join high-stakes live auctions from anywhere in the world with zero-latency streaming and real-time bid execution.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-[2.5rem] p-10 relative overflow-hidden group transition-colors duration-500">
               <Trophy className="size-12 text-slate-800 dark:text-white mb-8 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
               <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Win Securely</h3>
               <p className="text-slate-500 dark:text-zinc-400 text-[15px] leading-relaxed font-medium">Our integrated escrow service holds funds safely until you receive the keys, ensuring total peace of mind.</p>
            </div>
            
            {/* Feature 4 - Spanning 2 cols (Sell Promo) */}
            <div className="md:col-span-2 bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-[2.5rem] p-10 lg:p-14 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between group transition-colors duration-500">
               <div className="relative z-10 max-w-sm">
                 <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Maximize Your Value</h3>
                 <p className="text-slate-500 dark:text-zinc-400 text-lg leading-relaxed font-medium">Tap into our global network of verified collectors to fetch the absolute best price for your masterpiece.</p>
                 <AuthModal triggerElement={
                   <button className="mt-10 text-orange-600 dark:text-orange-500 font-black flex items-center gap-3 hover:gap-5 transition-all text-xs uppercase tracking-widest bg-orange-500/10 hover:bg-orange-500/20 px-6 py-3 rounded-full border border-orange-500/20">
                     List your vehicle <ArrowRight className="size-4" />
                   </button>
                 } />
               </div>
               
               {/* Decorative Graphic Element */}
               <div className="hidden md:flex relative size-56 shrink-0 mr-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-full blur-[40px] opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-700" />
                  <div className="absolute inset-2 bg-slate-100 dark:bg-[#030409] rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center flex-col shadow-2xl overflow-hidden transition-colors duration-500">
                    <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">0%</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 dark:text-orange-500 mt-2 z-10">Upfront Fee</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions Streamed Grid */}
      <section id="auctions" className="py-32 bg-white dark:bg-black border-y border-slate-200 dark:border-white/5 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="relative flex size-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full size-2.5 bg-red-500" /></span>
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Streaming Now</span>
              </div>
              <h2 className="text-5xl lg:text-[4rem] font-black tracking-tighter text-slate-900 dark:text-white">Trending Auctions</h2>
            </div>
            <AuthModal triggerElement={
              <button className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-black uppercase text-xs tracking-widest transition-colors flex items-center gap-2 group border border-slate-200 dark:border-white/10 px-6 py-3 rounded-full hover:bg-slate-50 dark:hover:bg-white/5">
                View All Inventory <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            }/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {previewCars.length > 0 ? previewCars.map((car) => (
              <div key={car.id} className="group cursor-pointer bg-slate-50 dark:bg-[#0a0f1c] rounded-[2rem] p-3 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none" onClick={() => setAuthOpen(true)}>
                <div className="w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-6 relative">
                  <img src={car.imageUrl} alt={car.make} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  
                  {/* Status pill */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-xl text-white px-4 py-2 rounded-full text-[10px] font-black border border-white/10 flex items-center gap-2 uppercase tracking-widest">
                     <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" /> Ending Soon
                  </div>
                </div>
                
                <div className="px-5 pb-5">
                  <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2 group-hover:text-orange-500 transition-colors tracking-tight">{car.year} {car.make} {car.model}</h3>
                  <p className="text-slate-500 dark:text-zinc-500 text-[11px] font-black uppercase tracking-widest mb-6 border-b border-slate-200 dark:border-white/5 pb-6">{car.mileage.toLocaleString()} mi • {car.condition}</p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase font-black tracking-widest mb-1">Current Bid</div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${car.startingPrice.toLocaleString()}</div>
                    </div>
                    <button className="size-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:bg-orange-500 dark:group-hover:bg-orange-500 group-hover:text-white transition-colors shadow-md dark:shadow-none">
                      <ArrowRight className="size-5 -rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              [1, 2, 3].map(i => <div key={i} className="bg-slate-100 dark:bg-[#0a0f1c] rounded-[2rem] aspect-[3/4] animate-pulse border border-slate-200 dark:border-white/5" />)
            )}
          </div>
        </div>
      </section>

      {/* Epic Footer CTA */}
      <footer className="w-full bg-slate-50 dark:bg-[#030409] pt-40 pb-12 relative overflow-hidden transition-colors duration-500">
        {/* Massive Text Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full overflow-hidden flex justify-center opacity-[0.03] dark:opacity-[0.03] text-slate-900 dark:text-white pointer-events-none select-none">
          <span className="text-[20rem] font-black whitespace-nowrap leading-none tracking-tighter">AUTOBIDS</span>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mb-40">
          <h2 className="text-6xl md:text-[6rem] lg:text-[7.5rem] font-black tracking-tighter mb-10 leading-[0.9] text-slate-900 dark:text-white">
            Ready to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-400 to-slate-600 dark:from-zinc-300 dark:to-zinc-600">hunt?</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 dark:text-zinc-500 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
            Create a free account today to bid, list, and drive the world's absolute finest vehicles.
          </p>
          <AuthModal triggerElement={
            <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-12 h-16 rounded-full text-[13px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Join AutoBids Now
            </button>
          }/>
        </div>
        
        {/* Footer Bottom Bar */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 border-t border-slate-200 dark:border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-500 dark:text-zinc-500 text-[11px] font-black tracking-widest uppercase">
          <div className="flex items-center gap-3 md:mb-0">
             <Gavel className="size-5 text-orange-500" />
             <span className="text-slate-900 dark:text-white font-black text-sm tracking-tight">Auto<span className="text-orange-500">Bids</span></span>
             <span className="ml-4 opacity-70">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
