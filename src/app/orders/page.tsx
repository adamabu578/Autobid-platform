"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/Root";
import { getOrders, getCar, type Order, type Car } from "../utils/api";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowRight, Trophy, CheckCircle2, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface WonAuction {
  order: Order;
  car: Car;
}

export default function WonAuctionsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [wins, setWins] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'buyer') {
        router.push("/");
      } else {
        loadWins();
      }
    }
  }, [user, userRole, authLoading, router]);

  const loadWins = async () => {
    try {
      const allOrders = await getOrders();
      
      const populated = await Promise.all(allOrders.map(async (order) => {
        try {
          const car = await getCar(order.carId);
          return { order, car };
        } catch (e) {
          return null;
        }
      }));

      const validWins = populated.filter(w => w !== null) as WonAuction[];
      setWins(validWins.sort((a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime()));
    } catch (error) {
      toast.error("Failed to load won auctions");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-2 flex items-center gap-3">
            <Trophy className="size-8 text-emerald-400" />
            Won Auctions
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">Vehicles you have successfully purchased.</p>
        </div>
      </div>

      {wins.length === 0 ? (
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
              <Trophy className="size-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No wins yet</h3>
            <p className="text-slate-400 max-w-sm mb-8">
              Keep bidding to win your first premium vehicle. Check out the Live Auctions to get started.
            </p>
            <Button 
              onClick={() => router.push('/cars')}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white h-11 px-8 rounded-xl shadow-lg font-bold"
            >
              Find a Car
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {wins.map(({ order, car }) => (
            <Card key={order.id} className="bg-slate-900/40 border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all hover:shadow-xl group rounded-2xl">
              <div className="flex flex-col md:flex-row h-full">
                <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden shrink-0">
                  <img 
                    src={car.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000"} 
                    alt={car.make} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 to-transparent" />
                  <div className="absolute top-3 left-3 flex">
                    <span className="bg-emerald-500/90 text-white border border-emerald-500/30 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center">
                      <CheckCircle2 className="size-3 mr-1" /> Won
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <div className="flex items-center text-sm font-medium text-slate-400">
                        <Calendar className="size-3.5 mr-1" /> Won on {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
                    <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 shadow-inner">
                      <div className="text-[10px] text-emerald-400/80 uppercase font-bold mb-1 flex items-center">
                        <DollarSign className="size-3 mr-1" /> Final Price
                      </div>
                      <div className="text-xl font-black text-emerald-400">
                        ${order.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Status</div>
                      <div className="text-sm font-bold text-white capitalize">
                        {order.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-auto">
                    <div className="text-xs text-slate-500">
                      Purchased from: <span className="text-slate-300 font-medium">{car.sellerName}</span>
                    </div>
                    <Link href={`/cars/${car.id}`}>
                      <Button 
                        variant="outline"
                        className="bg-white/5 hover:bg-white/10 text-white h-10 rounded-xl transition-colors font-medium border border-white/10"
                      >
                        Listing Details <ArrowRight className="size-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
