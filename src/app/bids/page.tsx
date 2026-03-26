"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/Root";
import { getUserBids, getCar, getCarBids, type Bid, type Car } from "../utils/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowRight, Clock, AlertCircle, Trophy, TrendingUp, Gavel } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BidStatus extends Bid {
  car: Car;
  isWinning: boolean;
  highestBidAmount: number;
}

export default function MyBidsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bids, setBids] = useState<BidStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'buyer') {
        router.push("/");
      } else {
        loadBids();
        const interval = setInterval(loadBids, 15000);
        return () => clearInterval(interval);
      }
    }
  }, [user, userRole, authLoading, router]);

  const loadBids = async () => {
    try {
      const userBids = await getUserBids();
      // Group by car to show only latest bid per car
      const latestBidsMap = new Map<string, Bid>();
      userBids.forEach(bid => {
        if (!latestBidsMap.has(bid.carId) || new Date(bid.createdAt) > new Date(latestBidsMap.get(bid.carId)!.createdAt)) {
          latestBidsMap.set(bid.carId, bid);
        }
      });
      
      const uniqueBids = Array.from(latestBidsMap.values());
      const detailedBids = await Promise.all(uniqueBids.map(async (bid) => {
        try {
          const car = await getCar(bid.carId);
          const allCarBids = await getCarBids(bid.carId);
          const highestBid = allCarBids[0]; // Already sorted descending
          const isWinning = highestBid.buyerId === user.id;
          
          return {
            ...bid,
            car,
            isWinning,
            highestBidAmount: highestBid.amount
          };
        } catch (e) {
          return null;
        }
      }));

      const validBids = detailedBids.filter(b => b !== null) as BidStatus[];
      setBids(validBids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      toast.error("Failed to load your bids");
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const total = Date.parse(endTime) - Date.parse(new Date().toString());
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    if (total <= 0) return "Ended";
    return `${days}d ${hours}h left`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="size-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 flex items-center gap-3">
            <Gavel className="size-8 text-orange-500" />
            My Active Bids
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">Track your auction activity and stay ahead of the competition.</p>
        </div>
      </div>

      {bids.length === 0 ? (
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-6">
              <Gavel className="size-10 text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No bids placed yet</h3>
            <p className="text-slate-400 max-w-sm mb-8">
              You haven't participated in any auctions yet. Head over to the Live Auctions page to find your dream car.
            </p>
            <Button 
              onClick={() => router.push('/cars')}
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white h-11 px-8 rounded-xl shadow-lg font-bold"
            >
              Browse Auctions
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {bids.map((bid) => {
            const isAuctionActive = bid.car.status === 'active' && Date.parse(bid.car.auctionEndTime) > Date.now();
            
            return (
              <Card key={bid.id} className="bg-slate-900/40 border-white/10 overflow-hidden hover:border-orange-500/30 transition-all hover:shadow-xl group rounded-2xl">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden shrink-0">
                    <img 
                      src={bid.car.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000"} 
                      alt={bid.car.make} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 to-transparent" />
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                            isAuctionActive ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {isAuctionActive ? 'Live' : 'Ended'}
                          </span>
                          {isAuctionActive && (
                            <span className="flex items-center text-xs font-medium text-slate-300">
                              <Clock className="size-3.5 mr-1 text-slate-400" />
                              {getTimeRemaining(bid.car.auctionEndTime)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {bid.car.year} {bid.car.make} {bid.car.model}
                        </h3>
                      </div>
                      
                      <div className="shrink-0">
                        {isAuctionActive ? (
                          bid.isWinning ? (
                            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center text-emerald-400 text-sm font-bold">
                              <Trophy className="size-4 mr-2" /> Winning
                            </div>
                          ) : (
                            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center text-red-500 text-sm font-bold">
                              <AlertCircle className="size-4 mr-2" /> Outbid
                            </div>
                          )
                        ) : (
                          bid.isWinning ? (
                            <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center text-green-400 text-sm font-bold">
                              <Trophy className="size-4 mr-2" /> You Won
                            </div>
                          ) : (
                            <div className="px-4 py-2 rounded-xl bg-gray-500/20 border border-gray-500/30 flex items-center text-gray-400 text-sm font-bold">
                              Auction Lost
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Your Max Bid</div>
                        <div className="text-lg font-bold text-white">${bid.amount.toLocaleString()}</div>
                      </div>
                      <div className={`rounded-xl p-3 border shadow-inner ${bid.isWinning ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-orange-500/5 border-orange-500/20'}`}>
                        <div className={`text-[10px] uppercase font-bold mb-1 flex items-center ${bid.isWinning ? 'text-emerald-400' : 'text-orange-400'}`}>
                          <TrendingUp className="size-3 mr-1" /> Highest Bid
                        </div>
                        <div className={`text-lg font-black ${bid.isWinning ? 'text-emerald-400' : 'text-orange-400'}`}>
                          ${bid.highestBidAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-auto">
                      <Link href={`/cars/${bid.car.id}`}>
                        <Button 
                          className="w-full md:w-auto bg-white/10 hover:bg-orange-600 text-white h-11 rounded-xl transition-colors font-medium border border-white/10 hover:border-orange-500/50"
                        >
                          {isAuctionActive && !bid.isWinning ? 'Increase Bid' : 'View Details'} <ArrowRight className="size-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
