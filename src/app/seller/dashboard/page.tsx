"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/Root";
import { getCars, getCarBids, type Car } from "../../utils/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { CarFront, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface CarWithBids extends Car {
  highestBid: number;
  bidCount: number;
}

export default function SellerDashboard() {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const [cars, setCars] = useState<CarWithBids[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userRole === 'seller') {
      loadInventory();
      const interval = setInterval(loadInventory, 10000);
      return () => clearInterval(interval);
    } else if (user && userRole !== 'seller') {
      router.push('/');
    }
  }, [user, userRole, router]);

  const loadInventory = async () => {
    try {
      const allCars = await getCars();
      const sellerCars = allCars.filter(c => c.sellerId === user.id);
      
      const carsWithBids = await Promise.all(sellerCars.map(async (car) => {
        const bids = await getCarBids(car.id);
        const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
        return { ...car, highestBid, bidCount: bids.length };
      }));

      setCars(carsWithBids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load inventory');
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

  if (!user || userRole !== 'seller') { return null; }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="size-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-0">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">My Inventory</h1>
          <p className="text-gray-400 font-medium tracking-wide">Monitor your active listings and incoming bids</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push('/upload-car')}
            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/20 rounded-xl font-bold h-11"
          >
            + List New Car
          </Button>
        </div>
      </div>

      {cars.length === 0 ? (
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform">
              <CarFront className="size-16 text-orange-400/50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No cars listed yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm text-center">Start selling by adding your first premium vehicle to the auction platform.</p>
            <Button 
              onClick={() => router.push('/upload-car')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-8 rounded-xl h-11"
            >
              List a Car
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Card key={car.id} className="h-full bg-slate-900/40 backdrop-blur-xl border-white/10 overflow-hidden shadow-xl shadow-black/50 hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-300 flex flex-col group p-0">
              <div className="relative h-48 w-full overflow-hidden">
                <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className={`px-2 py-0.5 text-xs uppercase font-bold tracking-wider ${
                    car.status === 'active' ? 'bg-orange-500/90 text-white backdrop-blur-md' : 
                    car.status === 'sold' ? 'bg-emerald-500/90 text-white backdrop-blur-md' : 
                    'bg-gray-500/90 text-white backdrop-blur-md'
                  }`}>
                    {car.status}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold truncate">{car.year} {car.make} {car.model}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                    <Clock className="size-3.5 text-orange-400" />
                    <span className="font-medium">{getTimeRemaining(car.auctionEndTime)}</span>
                  </div>
                </div>
              </div>
              <CardContent className="pt-5 flex-1 flex flex-col">
                <div className="space-y-4 mb-6 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 shadow-inner">
                      <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Starting Price</div>
                      <div className="text-sm font-bold text-white">${car.startingPrice.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-orange-500/20 shadow-inner shadow-orange-500/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500/20 rounded-bl-full flex items-center justify-center">
                        <TrendingUp className="size-3 text-orange-400 absolute top-1.5 right-1.5" />
                      </div>
                      <div className="text-[10px] text-orange-400 uppercase font-bold mb-1">Highest Bid</div>
                      <div className="text-lg font-black text-white">
                        {car.highestBid > 0 ? `$${car.highestBid.toLocaleString()}` : 'No bids'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-medium">{car.bidCount} active bids</div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-auto">
                  <Link href={`/cars/${car.id}`} className="block">
                    <Button 
                      className="w-full bg-white/5 hover:bg-orange-600/20 text-white hover:text-orange-400 h-11 rounded-lg transition-colors font-semibold border border-white/5 hover:border-orange-500/30 shadow-sm"
                    >
                      Manage Listing <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
