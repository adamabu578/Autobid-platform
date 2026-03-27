"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/Root";
import { signup, signin, getCars, getUserBids, getCar, getCarBids, type Car } from "./utils/api";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "./components/ui/dialog";
import { Search, MapPin, Calendar, Car as CarIcon, ShieldCheck, HeadphonesIcon, Clock, Award, Star, Facebook, Twitter, Instagram, Linkedin, Apple, Play, Zap } from "lucide-react";
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
  const [heroCar, setHeroCar] = useState<Car | null>(null);
  const [heroBidAmount, setHeroBidAmount] = useState<number | null>(null);

  useEffect(() => {
    // Redirect logic: Sellers auto-redirect to dashboard, Buyers stay to see personalized dynamic landing page
    if (user && userRole) {
      if (userRole === 'seller') router.push('/seller/dashboard');
    }
  }, [user, userRole, router]);

  useEffect(() => {
    const fetchPersonalizedHero = async () => {
      if (userRole === 'buyer') {
        try {
          const userBids = await getUserBids();
          if (userBids && userBids.length > 0) {
            const activeBid = userBids[0];
            const carData = await getCar(activeBid.carId);
            setHeroCar(carData);
            setHeroBidAmount(activeBid.amount);
          }
        } catch (e) {
          console.error("Personalized hero load failed", e);
        }
      }
    };
    if (user) fetchPersonalizedHero();
  }, [user, userRole]);

  const [previewCurrentBid, setPreviewCurrentBid] = useState<number | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const data = await getCars();
        const active = data.filter(c => c.status === 'active').slice(0, 3);
        setPreviewCars(active);
        
        // Dynamically fetch live bidding market data for the global active feature
        if (active.length > 0) {
          const bids = await getCarBids(active[0].id);
          if (bids && bids.length > 0) {
            setPreviewCurrentBid(bids[0].amount);
          }
        }
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

  // Auth Modal
  const AuthModal = ({ triggerElement }: { triggerElement: React.ReactNode }) => (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black text-teal-800 dark:text-teal-400 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join AutoBids'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Access the most exclusive automotive auction marketplace.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent p-0 gap-4">
              <TabsTrigger value="login" className="rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 data-[state=active]:bg-teal-600 dark:data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-extrabold py-3.5 border-2 border-transparent data-[state=active]:border-teal-500 transition-all hover:bg-slate-200 dark:hover:bg-slate-700">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 data-[state=active]:bg-teal-600 dark:data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-extrabold py-3.5 border-2 border-transparent data-[state=active]:border-teal-500 transition-all hover:bg-slate-200 dark:hover:bg-slate-700">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignin} className="space-y-4">
                <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-transparent h-12 rounded-xl focus:border-amber-500" required />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-transparent h-12 rounded-xl focus:border-amber-500" required />
                <Button type="submit" disabled={loading} className="w-full bg-amber-500 text-white hover:bg-amber-600 h-12 font-bold rounded-xl shadow-lg shadow-amber-500/20">
                  {loading ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                </Button>
                
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" onClick={() => handleDemoLogin('buyer')} className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">Buyer Demo</Button>
                  <Button type="button" variant="outline" onClick={() => handleDemoLogin('seller')} className="w-full rounded-xl border-slate-200 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">Seller Demo</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-transparent h-12 rounded-xl focus:border-amber-500" required />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-transparent h-12 rounded-xl focus:border-amber-500" required />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-transparent h-12 rounded-xl focus:border-amber-500" required />
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger className="bg-slate-50 border-transparent h-12 rounded-xl font-bold dark:bg-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="buyer">Buy Cars</SelectItem>
                    <SelectItem value="seller">Sell Cars</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" disabled={loading} className="w-full bg-teal-600 text-white hover:bg-teal-700 h-12 font-bold rounded-xl shadow-lg shadow-teal-600/20">
                  {loading ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-amber-500 selection:text-white overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 py-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-teal-600 flex items-center justify-center">
               <CarIcon className="size-5 text-white" />
            </div>
            <span className="text-xl font-black text-teal-900 dark:text-white tracking-tight">AUTOBIDS</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 font-bold text-sm text-teal-950 dark:text-slate-200">
            <a href="#" className="hover:text-amber-500 transition-colors">Home</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Why Choose Us</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Auctions</a>
            <a href="#" className="hover:text-amber-500 transition-colors">About Us</a>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthModal triggerElement={
               <button className="hidden sm:block px-6 py-2.5 rounded-full border-2 border-teal-700 text-teal-800 dark:text-teal-200 font-bold text-sm hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors">Login</button>
            }/>
            <AuthModal triggerElement={
               <button className="px-6 py-3 rounded-full bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 transition-transform">Register</button>
            }/>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center bg-white dark:bg-slate-900 overflow-hidden pt-32 pb-20">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-[-10%] w-[60%] h-[120%] bg-amber-400 rotate-[-12deg] transform origin-top-right z-0 shadow-2xl skew-x-[-5deg]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[120%] h-[40%] bg-teal-700 rotate-[-8deg] transform origin-bottom-left z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[50%] bg-slate-50 dark:bg-slate-800 rotate-[15deg] transform z-0 opacity-50 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 w-full">
          {/* Hero Text */}
          <div className="flex flex-col justify-center max-w-lg pt-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md mb-8 border border-white/50 dark:border-slate-700 w-max shadow-sm">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-teal-900 dark:text-teal-400">The New Era of Automotive Auctions</span>
            </div>
            
            <h1 className="text-6xl lg:text-[5rem] font-extrabold text-teal-950 dark:text-white leading-[1.0] tracking-tight mb-6">
              Collect the <br/>
              <span className="text-amber-500 drop-shadow-sm">Extraordinary.</span>
            </h1>
            
            <p className="text-slate-700 dark:text-slate-300 text-lg md:text-xl font-medium mb-10 max-w-md leading-relaxed">
              The world's most exclusive marketplace for vetted luxury, exotic, and classic vehicles. Bid live. Win securely.
            </p>
            
            <div className="flex font-bold flex-col sm:flex-row gap-4 mb-2">
               <AuthModal triggerElement={
                 <button className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl text-sm shadow-xl hover:scale-105 transition-transform">
                   Start Bidding
                 </button>
               } />
               <AuthModal triggerElement={
                 <button className="flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-800 backdrop-blur-sm border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white px-8 py-4 rounded-xl text-sm hover:bg-white dark:hover:bg-slate-700 transition-colors">
                   Sell Your Vehicle
                 </button>
               } />
            </div>
          </div>
          
          {/* Hero Image (Car overlapping the graphics) */}
          <div className="relative flex justify-end items-center h-full min-h-[300px] lg:min-h-[500px]">
             {/* Info Tooltip 1 */}
             <div className="absolute top-[20%] left-0 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl z-20 flex flex-col items-center animate-bounce duration-3000">
                <span className="text-[10px] font-black text-amber-500 uppercase">Most Flexible</span>
                <span className="text-xs font-bold text-slate-800">Bidding Plan</span>
             </div>
             
             {/* Info Tooltip 2 */}
             <div className="absolute bottom-[20%] left-[20%] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl z-20 flex flex-col items-center animate-pulse">
                <span className="text-[10px] font-black text-teal-600 uppercase">Easy to verify</span>
                <span className="text-xs font-bold text-slate-800">Clear History</span>
             </div>
                          <div className="relative z-10 w-full lg:w-[110%] ml-auto transform lg:translate-x-8 lg:-translate-y-4">
                <img 
                  src={heroCar?.imageUrl || "/benz.jpg"} 
                  alt="Hero Sports Car" 
                  className="w-full h-[250px] md:h-[350px] lg:h-[450px] object-cover rounded-lg shadow-2xl border-4 border-white/30 dark:border-slate-700/50"
                />
                
                {/* Live Bidding Indicator */}
                <div className="absolute top-4 md:top-6 right-4 md:right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/50 dark:border-slate-700/50 flex items-center gap-2.5 z-20 transition-transform hover:scale-105 cursor-pointer">
                   <div className="relative flex size-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full size-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                   </div>
                   <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest mt-0.5">Live Bidding</span>
                </div>
                
                {/* Current Price Banner */}
                <div className="absolute bottom-4 md:bottom-6 right-4 md:right-8 bg-slate-900/80 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 flex flex-col items-start z-20 transition-transform hover:scale-105 cursor-pointer">
                   <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{heroCar ? 'Your Active Bid' : 'Current Bid'}</span>
                   <span className="text-xl md:text-3xl font-black text-emerald-400">₦ {heroBidAmount ? heroBidAmount.toLocaleString() : "42,500,000"}</span>
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Trusted Brands Strip */}
      <section className="bg-white dark:bg-slate-900 py-10 relative z-20 border-b border-slate-100 dark:border-slate-800 transition-colors duration-500">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-500 mb-6">Trusted by more than 50+ luxury dealerships</p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale">
               {/* Simulating Brand Logos with distinct typographic shapes */}
               <span className="text-3xl font-serif font-black tracking-widest text-slate-800 dark:text-white">TESLA</span>
               <span className="text-2xl font-black italic text-slate-800 dark:text-white">BMW</span>
               <span className="text-2xl font-black text-slate-800 dark:text-white tracking-widest uppercase">Porsche</span>
               <span className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tighter">Audi</span>
               <span className="text-2xl font-black text-slate-800 dark:text-white uppercase">Ferrari</span>
            </div>
         </div>
      </section>

      {/* Floating Filter Bar */}
      <div className="max-w-5xl mx-auto px-6 relative -mt-6 z-30">
        <div className="bg-white dark:bg-slate-800 rounded-3xl md:rounded-full shadow-2xl p-4 md:p-3 flex flex-col md:flex-row items-center border border-slate-100 dark:border-slate-700">
          <div className="w-full md:flex-1 py-3 md:py-0 px-6 min-w-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 flex items-center gap-3">
             <MapPin className="size-5 md:size-4 text-teal-600 shrink-0" />
             <div className="flex flex-col w-full">
               <span className="text-[10px] text-slate-400 font-bold uppercase">City / Region</span>
               <input type="text" placeholder="Choose a location" className="bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none w-full placeholder:text-slate-800 dark:placeholder:text-white" />
             </div>
          </div>
          <div className="w-full md:flex-1 py-3 md:py-0 px-6 min-w-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 flex items-center gap-3">
             <Calendar className="size-5 md:size-4 text-teal-600 shrink-0" />
             <div className="flex flex-col w-full">
               <span className="text-[10px] text-slate-400 font-bold uppercase">Production Year</span>
               <input type="text" placeholder="Any Year" className="bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none w-full placeholder:text-slate-800 dark:placeholder:text-white" />
             </div>
          </div>
          <div className="w-full md:flex-1 py-3 md:py-0 px-6 min-w-0 flex items-center gap-3">
             <CarIcon className="size-5 md:size-4 text-teal-600 shrink-0" />
             <div className="flex flex-col w-full">
               <span className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Make</span>
               <input type="text" placeholder="Type a car" className="bg-transparent text-sm font-bold text-slate-800 dark:text-white focus:outline-none w-full placeholder:text-slate-800 dark:placeholder:text-white" />
             </div>
          </div>
          <AuthModal triggerElement={
            <button className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold h-14 px-10 rounded-2xl md:rounded-full shadow-lg shrink-0 mt-4 md:mt-0 md:ml-2 transition-transform hover:scale-105">
              Search
            </button>
          }/>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="relative order-2 lg:order-1">
            {/* Massive Green Backdrop abstract blob */}
            <div className="absolute inset-0 bg-teal-600/10 rounded-full blur-3xl transform -translate-x-20 scale-150" />
            <img 
               src="/toyota.jpg" 
               alt="Premium Auction Vehicle" 
               className="relative z-10 w-full aspect-video lg:aspect-[4/3] object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] duration-700"
            />
          </div>
          
          <div className="flex flex-col relative z-20 order-1 lg:order-2">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-800 dark:text-white mb-8 leading-[1.15] tracking-tight">
              Uncompromising <span className="text-teal-600 dark:text-teal-400">Trust & Safety.</span> Built for collectors.
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="size-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Award className="size-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Curated Inventory</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Every vehicle undergoes rigorous mechanical and historical verification before being approved for auction.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="size-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Secure Escrow Protection</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Buyer funds are held safely in our escrow infrastructure until the vehicle title and keys are firmly in hand.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="size-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="size-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Live Bidding Engine</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Experience the thrill of real-time auctions with our zero-latency bidding architecture and dynamic extension logic.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="size-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <MapPin className="size-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">White-glove Delivery</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Optional door-to-door enclosed transport ensures your new masterpiece arrives in pristine, showroom condition.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Pick Your Car Slider Area */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Massive Dual Color Behind Carousel */}
        <div className="absolute inset-x-0 top-0 h-[85%] md:h-[80%] bg-[linear-gradient(135deg,#0d9488_50%,#ffbe0b_50.1%)] md:bg-[linear-gradient(108deg,#0d9488_40%,#ffbe0b_40.1%)] z-0 rounded-3xl mx-4 lg:mx-10" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-8 md:pt-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl text-white font-extrabold mb-2">Live Auctions Sneak Peek</h2>
          <p className="text-white/80 text-xs font-black tracking-[0.2em] uppercase mb-8 md:mb-16">Trending Premium Vehicles</p>
          
          {/* Faux Carousel Visuals using Data */}
          <div className="flex items-end justify-center gap-4 lg:gap-8 w-full h-[200px] md:h-[300px] mb-8 md:mb-12 relative px-4 text-center">
             {/* Car 1 */}
             <div className="hidden md:block w-[30%] opacity-50 scale-75 transform translate-y-8 brightness-75 hover:opacity-100 hover:scale-[0.8] transition-all cursor-pointer">
               <img src="/bmw.jpg" className="w-full aspect-video md:h-[200px] object-cover rounded-md shadow-2xl" alt="Preview Car 1" />
             </div>
             
             {/* Car 2 (Center Active Focus) */}
             {previewCars[0] ? (
               <div className="w-[95%] md:w-[50%] z-20 hover:scale-105 transition-transform cursor-pointer shadow-[0_40px_40px_rgba(0,0,0,0.5)] mx-auto rounded-md" onClick={() => setAuthOpen(true)}>
                  <img src={previewCars[0].imageUrl} className="w-full h-[220px] md:h-[300px] object-cover rounded-md mx-auto ring-4 ring-white/20 dark:ring-slate-800/50" alt="Active Car" />
               </div>
             ) : (
               <div className="w-[95%] md:w-[50%] h-[150px] md:h-[200px] bg-white/20 animate-pulse rounded-md mx-auto" />
             )}
             
             {/* Car 3 */}
             <div className="hidden md:block w-[30%] opacity-50 scale-75 transform translate-y-8 brightness-75 hover:opacity-100 hover:scale-[0.8] transition-all cursor-pointer">
               <img src="/audi.jpg" className="w-full aspect-video md:h-[200px] object-cover rounded-md shadow-2xl" alt="Preview Car 3" />
             </div>
          </div>
          
          {/* Specs Block */}
          <div className="flex items-center justify-center gap-8 md:gap-12 text-white pb-12 w-full">
             <div className="flex flex-col items-center gap-2">
               <div className="size-10 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-sm"><Clock className="size-4" /></div>
               <span className="text-xs font-bold">300 km/h</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <div className="size-10 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-sm"><Zap className="size-4" /></div>
               <span className="text-xs font-bold">2 Secs</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <div className="size-10 rounded-full border-2 border-white/30 flex items-center justify-center backdrop-blur-sm"><MapPin className="size-4" /></div>
               <span className="text-xs font-bold">20 L / 100</span>
             </div>
          </div>
          
          {/* Price Pill Floating */}
          <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-full shadow-2xl p-3 md:px-6 md:py-4 flex items-center justify-between gap-3 md:gap-6 mt-[-30px] border border-slate-100 dark:border-slate-700 w-auto max-w-fit mx-auto transition-all relative z-30">
             <div className="flex items-center gap-2 md:gap-4 border-r border-slate-200 dark:border-slate-700 pr-3 md:pr-6 shrink-0">
                <div className="hidden sm:flex bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                  <ShieldCheck className="size-4 md:size-5 text-teal-600" />
                </div>
                <div className="text-left leading-none">
                   <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">₦{previewCurrentBid ? previewCurrentBid.toLocaleString() : (previewCars[0]?.startingPrice.toLocaleString() || "300")}</span>
                   <span className="text-slate-400 text-[10px] md:text-xs font-bold block sm:inline sm:ml-1">/current bid</span>
                </div>
             </div>
             <div className="flex gap-2 shrink-0">
               <AuthModal triggerElement={<button className="px-4 md:px-5 py-2.5 md:py-3 rounded-sm md:rounded-full border-2 border-slate-200 dark:border-slate-600 text-[11px] md:text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition leading-none">View</button>} />
               <AuthModal triggerElement={<button className="px-5 md:px-6 py-2.5 md:py-3 rounded-sm md:rounded-full bg-amber-500 text-white text-[11px] md:text-sm font-bold hover:bg-amber-600 shadow-md transition-colors leading-none tracking-wide">Place Bid</button>} />
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Soft Blobs */}
        <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/20 blur-[120px] rounded-full" />
        <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-600/20 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">What people are saying</h2>
            <p className="text-slate-500 font-medium">What our lovely customer said for our service</p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
            {/* Left Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-slate-100 dark:border-slate-800 max-w-lg relative">
               {/* Quote Graphic */}
               <div className="absolute top-6 left-6 text-6xl text-slate-100 dark:text-slate-800 font-serif font-black leading-none pointer-events-none">"</div>
               <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 relative z-10 pt-4">
                 <span className="text-slate-800 dark:text-white font-bold">AutoBids made exploring exotic markets stress-free.</span> The verified inventory was perfect for navigating tight auction periods, and the escrow efficiency saved me money. Excellent service! Two thumbs up!
               </p>
               <div>
                 <h4 className="text-xl font-bold text-slate-800 dark:text-white">Sophie L</h4>
                 <p className="text-sm font-medium text-slate-500">Collector Enthusiast</p>
               </div>
            </div>
            
            {/* Right Picture Cluster */}
            <div className="relative w-full max-w-md aspect-square rounded-full border-r-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
               <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" className="absolute top-[10%] left-[20%] size-16 rounded-full border-4 border-white dark:border-slate-900 shadow-xl" />
               <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" className="absolute top-[30%] right-[10%] size-24 rounded-full border-4 border-white dark:border-slate-900 shadow-xl z-20" />
               <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop" className="absolute bottom-[20%] left-[10%] size-20 rounded-full border-4 border-white dark:border-slate-900 shadow-xl z-10" />
               <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop" className="absolute bottom-[10%] right-[30%] size-16 rounded-full border-4 border-white dark:border-slate-900 shadow-xl" />
               <div className="size-32 rounded-full bg-teal-600/10 dark:bg-teal-600/30 blur-2xl absolute" />
            </div>
          </div>
        </div>
      </section>

      {/* App Download Banner */}
      <section className="py-12 md:py-20 relative px-4 md:px-6 z-20">
        <div className="max-w-6xl mx-auto bg-teal-600 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative flex flex-col md:flex-row items-center border-[6px] md:border-[8px] border-white dark:border-slate-800 shadow-2xl">
           
           {/* Abstract BG lines inside banner */}
           <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute right-0 top-0 w-[50%] h-[150%] bg-white transform rotate-45 translate-x-1/3 -translate-y-1/4" />
             <div className="absolute right-0 bottom-0 w-[50%] md:w-[60%] h-[150%] bg-amber-500 transform -rotate-45 translate-x-1/2 translate-y-1/4" />
           </div>
           
           <div className="relative z-10 w-full md:w-1/2 p-6 pt-10 pb-0 md:p-16 md:pb-16 text-center md:text-left text-white">
               <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
                 Download AutoBids<br/>for <span className="text-amber-300">FREE</span>
               </h2>
               <p className="text-teal-100 font-medium mb-8 md:mb-10 text-base md:text-lg">For faster, easier bidding and exclusive inventory access.</p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                 <button className="flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg w-full sm:w-auto mt-2">
                   <Apple className="size-6 fill-slate-900" /> App Store
                 </button>
                 <button className="flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-6 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-colors w-full sm:w-auto mt-2 md:mt-0">
                   <Play className="size-6 fill-white" /> Google Play
                 </button>
               </div>
             </div>
             
             <div className="flex-1 flex justify-center lg:justify-end relative z-10 w-full transform translate-y-6 md:translate-y-12">
               <div className="bg-white rounded-t-[2rem] md:rounded-t-[2.5rem] p-2 md:p-3 shadow-2xl w-[220px] md:w-[260px] h-[350px] md:h-[420px] border-x-[6px] border-t-[6px] md:border-x-8 md:border-t-8 border-slate-900 mx-auto md:mr-0 relative">
                  <div className="absolute top-0 inset-x-0 h-5 md:h-6 bg-slate-900 rounded-b-xl md:rounded-b-2xl w-24 md:w-28 mx-auto z-20" />
                  {/* Mock App UI */}
                  <div className="bg-slate-50 w-full h-full rounded-t-xl md:rounded-t-[1.5rem] overflow-hidden flex flex-col p-3 md:p-4 pt-8 md:pt-10 pb-0">
                     <div className="text-center font-bold text-sm mb-4 text-slate-800">Live Auctions</div>
                     <div className="flex flex-col flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-2 mb-3 h-44 overflow-hidden">
                        <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                           <img src={previewCars[0]?.imageUrl || "/gac-m8.jpg"} className="w-full h-full object-contain mix-blend-multiply" alt="Mock UI" />
                        </div>
                        <div className="h-3 w-3/4 bg-slate-200 rounded-full mb-2 shrink-0" />
                        <div className="h-6 w-1/2 bg-amber-500/20 rounded-md shrink-0" />
                     </div>
                     <div className="flex flex-col flex-1 bg-white rounded-t-xl shadow-sm border-x border-t border-slate-100 p-2 opacity-50 h-28 overflow-hidden">
                        <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                           <img src={previewCars[1]?.imageUrl || "/honda.jpg"} className="w-full h-full object-contain mix-blend-multiply" alt="Mock UI" />
                        </div>
                     </div>
                  </div>
               </div>
             </div>
          </div>
      </section>

      {/* Footer Block */}
      <footer className="w-full bg-slate-50 dark:bg-slate-950 pt-32 pb-12 transition-colors duration-500 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-16 gap-12 border-b border-slate-200 dark:border-slate-800 pb-16">
            
            <div>
               <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  <div className="size-8 rounded-full bg-teal-600 flex items-center justify-center">
                     <CarIcon className="size-5 text-white" />
                  </div>
                  <span className="text-2xl font-black text-teal-900 dark:text-white tracking-tight">AUTOBIDS</span>
               </div>
               <p className="text-slate-500 font-medium text-sm text-center md:text-left">Drive Your Dreams. Your Agency Starts Here!</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center w-full max-w-md gap-3 sm:gap-4">
               <input type="email" placeholder="Your Email Address" className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-full w-full py-3.5 px-6 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400" />
               <button className="bg-amber-500 text-white font-bold px-8 py-3.5 rounded-xl sm:rounded-full text-sm hover:bg-amber-600 transition-colors shadow-lg w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                 Submit
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm font-bold mb-16">
            <div>
              <h4 className="text-slate-900 dark:text-white mb-6 text-base font-extrabold">Home</h4>
              <ul className="space-y-4 text-slate-500">
                <li><a href="#" className="hover:text-amber-500 text-teal-600">Home</a></li>
                <li><a href="#" className="hover:text-amber-500">Why Choose Us</a></li>
                <li><a href="#" className="hover:text-amber-500">Rent</a></li>
                <li><a href="#" className="hover:text-amber-500">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white mb-6 text-base font-extrabold">Resources</h4>
              <ul className="space-y-4 text-slate-500">
                <li><a href="#" className="hover:text-amber-500">Installation Manual</a></li>
                <li><a href="#" className="hover:text-amber-500">Release Note</a></li>
                <li><a href="#" className="hover:text-amber-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-500">Download Directory</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white mb-6 text-base font-extrabold">Brands</h4>
              <ul className="space-y-4 text-slate-500">
                <li><a href="#" className="hover:text-amber-500">Tesla</a></li>
                <li><a href="#" className="hover:text-amber-500">Nissan</a></li>
                <li><a href="#" className="hover:text-amber-500">BMW</a></li>
                <li><a href="#" className="hover:text-amber-500">Lamborghini</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white mb-6 text-base font-extrabold">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="bg-slate-200 dark:bg-slate-800 p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-white hover:bg-amber-500 transition-all"><Facebook className="size-4" /></a>
                <a href="#" className="bg-slate-200 dark:bg-slate-800 p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-white hover:bg-amber-500 transition-all"><Twitter className="size-4" /></a>
                <a href="#" className="bg-slate-200 dark:bg-slate-800 p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-white hover:bg-amber-500 transition-all"><Instagram className="size-4" /></a>
                <a href="#" className="bg-slate-200 dark:bg-slate-800 p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-white hover:bg-amber-500 transition-all"><Linkedin className="size-4" /></a>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs font-bold text-slate-400">
            ©2026 AutoBids. All Rights Reserved.
          </div>
        </div>
      </footer>
      
    </div>
  );
}
