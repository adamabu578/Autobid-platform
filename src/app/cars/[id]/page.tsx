"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../components/Root";
import { useRouter, useParams } from "next/navigation";
import { getCars, getCar, getCarBids, placeBid, updateCarStatus, type Car, type Bid } from "../../utils/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ArrowLeft, CarFront, Clock, DollarSign, Loader2, ShieldCheck, TrendingUp, Trophy, CheckCircle2, Award } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CarDetailsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const carId = params?.id as string;

  const [car, setCar] = useState<Car & { isTopSeller?: boolean } | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);

  useEffect(() => {
    if (carId) {
      loadCarDetails();
      const interval = setInterval(loadCarDetails, 10000); // Live update
      return () => clearInterval(interval);
    }
  }, [carId]);

  const loadCarDetails = async () => {
    try {
      const carData = await getCar(carId);

      const allCars = await getCars();
      const activeCars = allCars.filter(c => c.status === 'active');
      const sellerCounts: Record<string, number> = {};
      activeCars.forEach(c => {
        sellerCounts[c.sellerId] = (sellerCounts[c.sellerId] || 0) + 1;
      });
      let topSellerId = "";
      let maxCars = 0;
      for (const [sId, count] of Object.entries(sellerCounts)) {
        if (count > maxCars) {
          maxCars = count;
          topSellerId = sId;
        }
      }

      setCar({ 
        ...carData, 
        isTopSeller: carData.sellerId === topSellerId && maxCars > 0 
      });
      
      const bidsData = await getCarBids(carId);
      setBids(bidsData.sort((a, b) => b.amount - a.amount));
    } catch (error) {
      toast.error("Car not found");
      router.push("/cars");
    } finally {
      setLoading(false);
    }
  };

  const highestBid = bids.length > 0 ? bids[0].amount : 0;
  const currentMinimumBid = highestBid > 0 ? highestBid + 100 : car?.startingPrice || 0;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be signed in to place a bid.");
      return;
    }
    if (userRole !== 'buyer') {
      toast.error("Only buyers can place bids.");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < currentMinimumBid) {
      toast.error(`Your bid must be at least $${currentMinimumBid.toLocaleString()}`);
      return;
    }

    setIsBidding(true);
    try {
      await placeBid(carId, amount);
      toast.success("Bid placed successfully!");
      setBidAmount("");
      await loadCarDetails();
    } catch (error: any) {
      toast.error(error.message || "Failed to place bid");
    } finally {
      setIsBidding(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const total = Date.parse(endTime) - Date.parse(new Date().toString());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    
    if (total <= 0) return "Auction Ended";
    if (days === 0 && hours === 0) return `${minutes}m left`;
    return `${days}d ${hours}h left`;
  };

  const isSeller = user?.id === car?.sellerId;
  const isAuctionActive = car?.status === 'active' && Date.parse(car?.auctionEndTime || "") > Date.now();

  if (authLoading || loading || !car) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="size-12 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="text-slate-400 hover:text-white transition-colors flex items-center group pl-0"
        >
          <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Images and Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
            <img 
              src={car.imageUrl || "/gac-m8.jpg"} 
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                  car.status === 'active' ? 'bg-teal-600/90 text-white' : 
                  car.status === 'sold' ? 'bg-emerald-500/90 text-white' : 
                  'bg-gray-500/90 text-white'
                }`}>
                  {car.status}
                </span>
                <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-300 border border-white/10">
                  {car.condition}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md tracking-tight">
                {car.year} {car.make} {car.model}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <CarFront className="size-5 text-slate-500 mb-2" />
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Make</div>
                <div className="font-bold text-white">{car.make}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Tag className="size-5 text-slate-500 mb-2" />
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Model</div>
                <div className="font-bold text-white">{car.model}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Clock className="size-5 text-slate-500 mb-2" />
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Year</div>
                <div className="font-bold text-white">{car.year}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <TrendingUp className="size-5 text-slate-500 mb-2" />
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Mileage</div>
                <div className="font-bold text-white">{car.mileage.toLocaleString()} mi</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <ShieldCheck className="size-5 text-emerald-400 mr-2" />
              Seller Information
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium text-lg flex items-center gap-2">
                  {car.sellerName}
                  {car.isTopSeller && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-teal-700/20 border border-amber-500/30 text-[10px] font-black text-amber-400 uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]" title="Premium Verified Seller">
                      <Award className="size-3" /> Top Seller
                    </span>
                  )}
                </p>
                <p className="text-slate-400 text-sm">Verified Dealership</p>
              </div>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" disabled>
                Contact Seller
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Bidding */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden rounded-2xl">
            {car.status === 'sold' && (
              <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <Trophy className="size-16 text-emerald-400 mb-4" />
                <h2 className="text-3xl font-black text-white tracking-tight">SOLD</h2>
                <p className="text-emerald-400 font-bold text-xl mt-2">${highestBid.toLocaleString()}</p>
                {bids[0] && <p className="text-slate-300 mt-2 text-sm">Winner: {bids[0].buyerName}</p>}
              </div>
            )}
            
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Time Left</p>
                <div className={`text-xl font-bold flex items-center ${isAuctionActive ? 'text-amber-500' : 'text-slate-500'}`}>
                  <Clock className="size-5 mr-2" />
                  {getTimeRemaining(car.auctionEndTime)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Bids</p>
                <p className="text-white text-xl font-bold">{bids.length}</p>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="mb-6">
                <p className="text-slate-400 text-sm font-medium mb-1">Current Highest Bid</p>
                <div className="text-4xl font-black text-white tracking-tight">
                  ${highestBid > 0 ? highestBid.toLocaleString() : car.startingPrice.toLocaleString()}
                </div>
              </div>

              {car.buyItNowPrice && (
                <div className="mb-8 p-4 bg-teal-600/10 border border-teal-600/20 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-teal-600/10 rounded-bl-full" />
                  <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">Buy It Now</p>
                  <p className="text-xl font-bold text-white">${car.buyItNowPrice.toLocaleString()}</p>
                </div>
              )}

              {userRole === 'buyer' && isAuctionActive && (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount" className="text-slate-300">Your Max Bid</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                      <Input 
                        id="bidAmount"
                        type="number"
                        placeholder={`Min ${currentMinimumBid}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="pl-10 bg-slate-950/50 border-white/10 text-white text-lg h-14 rounded-xl focus:border-teal-600 focus:ring-teal-600/20"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Enter at least ${currentMinimumBid.toLocaleString()}</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isBidding}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-500 hover:to-teal-300 text-white h-14 text-lg font-bold rounded-xl shadow-lg shadow-teal-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isBidding ? <Loader2 className="size-5 animate-spin mr-2" /> : null}
                    Place Bid
                  </Button>

                  {car.buyItNowPrice && (
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl"
                      onClick={() => {
                        setBidAmount(car.buyItNowPrice!.toString());
                        // User still needs to hit "Place Bid" so it triggers logic, or we could handle it instantly.
                        // For MVP, just filling input is fine.
                      }}
                    >
                      Use Buy It Now Price
                    </Button>
                  )}
                </form>
              )}

              {userRole === 'seller' && isSeller && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  <span className="text-slate-400 text-sm font-medium block mb-2">This is your listing</span>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" className="border-white/10 hover:bg-white/10" disabled>Edit</Button>
                    <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30" disabled>End Auction</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg text-white">Bid History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bids.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No bids placed yet.</div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {bids.map((bid, index) => (
                    <li key={bid.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        {index === 0 ? (
                          <div className="size-8 rounded-full bg-teal-600/20 flex items-center justify-center border border-teal-600/30">
                            <Trophy className="size-4 text-amber-500" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 text-slate-400 text-xs font-bold">
                            #{index + 1}
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                            {isSeller ? bid.buyerName : (bid.buyerId === user?.id ? "You" : `Bidder ${bid.id.substring(4,8)}`)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(bid.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${index === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        ${bid.amount.toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Tag(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}
