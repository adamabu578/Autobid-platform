"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../components/Root";
import { useRouter } from "next/navigation";
import { getCars, getCarBids, type Car, type Bid } from "../utils/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search, MapPin, Loader2, CarFront, Tag, Clock, ShieldCheck, ArrowRight, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import Link from "next/link";

interface CarWithBids extends Car {
  highestBid: number;
  bidCount: number;
  isTopSeller?: boolean;
}

export default function LiveAuctions() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [cars, setCars] = useState<CarWithBids[]>([]);
  const [topSellers, setTopSellers] = useState<{id: string, name: string, activeListings: number}[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState("All");

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const data = await getCars();
      const activeCars = data.filter(c => c.status === 'active');
      
      // Calculate highest seller
      const sellerCounts: Record<string, number> = {};
      data.forEach(c => {
        sellerCounts[c.sellerId] = (sellerCounts[c.sellerId] || 0) + 1;
      });
      
      // Extract top sellers
      const sortedSellers = Object.entries(sellerCounts)
        .sort((a, b) => b[1] - a[1])
        .filter(([, count]) => count > 0)
        .slice(0, 3)
        .map(([sId, count]) => {
          const sellerCar = data.find(c => c.sellerId === sId);
          return { id: sId, name: sellerCar?.sellerName || 'Seller', activeListings: count };
        });
      setTopSellers(sortedSellers);

      let topSellerId = sortedSellers.length > 0 ? sortedSellers[0].id : "";
      let maxCars = sortedSellers.length > 0 ? sortedSellers[0].activeListings : 0;
      
      const carsWithBids = await Promise.all(activeCars.map(async (car) => {
        const bids = await getCarBids(car.id);
        const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
        return { 
          ...car, 
          highestBid, 
          bidCount: bids.length,
          isTopSeller: car.sellerId === topSellerId && maxCars > 0
        };
      }));
      
      setCars(carsWithBids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Failed to load cars", error);
      toast.error("Failed to load global auctions");
    } finally {
      setLoading(false);
    }
  };

  const makes = ["All", ...Array.from(new Set(cars.map(c => c.make)))];

  const filteredCars = cars.filter(car => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = car.make.toLowerCase().includes(searchLower) || 
                          car.model.toLowerCase().includes(searchLower) ||
                          car.year.toString().includes(searchLower);
    const matchesMake = selectedMake === "All" || car.make === selectedMake;
    
    return matchesSearch && matchesMake;
  });

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
        <div className="size-12 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4 px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight flex items-center gap-3">
            <GavelIcon className="size-8 text-teal-600" />
            Live Auctions
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Browse premium vehicles and place your winning bids.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input 
              placeholder="Search make or model..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900/50 border-white/10 text-white min-w-[250px] focus:border-teal-600 focus:ring-teal-600/20 rounded-xl h-11"
            />
          </div>
          <Select value={selectedMake} onValueChange={setSelectedMake}>
            <SelectTrigger className="bg-slate-900/50 border-white/10 text-white w-full sm:w-[180px] focus:ring-teal-600/20 rounded-xl h-11">
              <SelectValue placeholder="Make" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
              {makes.map(make => (
                <SelectItem key={make} value={make} className="focus:bg-teal-700/20 focus:text-white cursor-pointer">{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Top Sellers Section */}
      {topSellers.length > 0 && selectedMake === "All" && searchQuery === "" && (
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Award className="size-5 text-amber-500 mr-2" />
              Verified Top Sellers
            </h2>
            <div className="h-px bg-gradient-to-r from-amber-500/50 to-transparent flex-1" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topSellers.map((seller, index) => (
              <Card key={seller.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`size-12 rounded-2xl flex items-center justify-center font-bold text-lg border shadow-lg ${
                        index === 0 
                          ? 'bg-gradient-to-br from-amber-400 to-teal-700 border-amber-300/50 text-white shadow-teal-600/20' 
                          : 'bg-slate-800 border-white/10 text-slate-300'
                      }`}>
                        {index === 0 ? <Award className="size-6 text-white" /> : `#${index + 1}`}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white truncate max-w-[140px]" title={seller.name}>{seller.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <ShieldCheck className="size-3.5" /> Verified
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Active Auctions</div>
                      <div className="text-slate-300 font-medium">{seller.activeListings} Premium Vehicles</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.map(car => (
          <Card key={car.id} className="bg-slate-900/40 border-white/10 overflow-hidden hover:border-teal-600/50 transition-all hover:shadow-2xl hover:shadow-teal-600/10 group flex flex-col h-full rounded-2xl p-0">
            <div className="relative h-72 w-full overflow-hidden">
              <img 
                src={car.imageUrl} 
                alt={`${car.make} ${car.model}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/toyota.jpg"; // Premium car fallback
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent pointer-events-none" />
              
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <span className="bg-teal-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-white animate-pulse block" />
                  Live Bid
                </span>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-extrabold text-xl line-clamp-1 group-hover:text-amber-500 transition-colors">
                  {car.year} {car.make} {car.model}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                  <Clock className="size-3.5 text-amber-500" />
                  <span className="font-medium">{getTimeRemaining(car.auctionEndTime)}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[100px]" title={car.sellerName}>
                    {car.sellerName}
                  </span>
                  {car.isTopSeller && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-teal-700/20 border border-amber-500/30 text-[9px] font-black text-amber-400 uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]" title="Premium Verified Seller">
                      <Award className="size-3" /> Top Seller
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-white/5 rounded-md border border-white/5">
                  {car.mileage.toLocaleString()} mi
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 shadow-inner">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Bid</div>
                    <div className="text-sm font-bold text-white">${car.highestBid > 0 ? car.highestBid.toLocaleString() : car.startingPrice.toLocaleString()}</div>
                  </div>
                  {car.buyItNowPrice && (
                    <div className="bg-teal-600/10 rounded-xl p-3 border border-teal-600/20 shadow-inner shadow-teal-600/5">
                      <div className="text-[10px] text-amber-500 uppercase font-bold mb-1">Buy It Now</div>
                      <div className="text-sm font-bold text-white">${car.buyItNowPrice.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                <Link href={`/cars/${car.id}`} className="block">
                  <Button 
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-500 hover:to-teal-300 text-white shadow-lg shadow-teal-900/20 h-11 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
                  >
                    View & Bid <ArrowRight className="size-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <Card className="bg-slate-900/50 border-white/5 border-dashed py-16 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <CarFront className="size-10 text-slate-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">No auctions found</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                No active listings match your criteria. Check back later for new premium inventory.
              </p>
            </div>
            {(searchQuery || selectedMake !== "All") && (
              <Button 
                onClick={() => { setSearchQuery(""); setSelectedMake("All"); }}
                variant="outline" 
                className="mt-6 border-white/10 text-white hover:bg-white/5 h-11 rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Inline GavelIcon since it's not exported from lucide-react directly sometimes or called Gavel
function GavelIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 13L10 9" />
      <path d="M14 19a2 2 0 0 1-2 2H8.5a2.5 2.5 0 0 1-2.5-2.5V17a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2z" />
      <path d="M16 11l-3-3" />
      <path d="M16 11l4.5-4.5a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L12 6.8" />
    </svg>
  );
}
