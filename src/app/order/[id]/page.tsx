"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../components/Root";
import { getOrders, type Order } from "../../utils/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Package, Store, Bike, CheckCircle, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

const statusSteps = [
  { key: 'vendor_accepted', label: 'Vendor Accepted', icon: Store },
  { key: 'rider_assigned', label: 'Rider Assigned', icon: Bike },
  { key: 'picked_up', label: 'Item Picked Up', icon: Package },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderStatusPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadOrder();
      const interval = setInterval(loadOrder, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, id]);

  const loadOrder = async () => {
    try {
      const orders = await getOrders();
      const orderIdObj = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
      const foundOrder = orders.find(o => o.requestId === orderIdObj || o.id === orderIdObj);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div 
          className="size-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-white/5 rounded-full mb-6 text-gray-400">
              <Package className="size-12" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Order Not Found</h3>
            <p className="text-gray-400 text-center max-w-sm">This order doesn't exist, hasn't been created yet, or you do not have permission to view it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Order Tracking</h1>
        <p className="text-gray-400 font-medium tracking-wide">Track your delivery in real-time</p>
      </div>

      <div>
        <Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 shadow-2xl shadow-amber-500/10 mb-8 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <div className="p-2 bg-gradient-to-bl from-amber-500 to-purple-500 rounded-lg text-white">
                <Package className="size-6" />
              </div>
              {order.productName}
            </CardTitle>
            <CardDescription className="text-gray-400 font-medium">
              Order ID: <span className="font-mono text-amber-300">{order.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <DollarSign className="size-6 text-green-400" />
                <div>
                  <div className="text-xs uppercase text-gray-500 font-bold mb-1">Price</div>
                  <div className="text-lg font-bold text-white">₦{order.price.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <MapPin className="size-6 text-orange-400" />
                <div className="overflow-hidden">
                  <div className="text-xs uppercase text-gray-500 font-bold mb-1">Destination</div>
                  <div className="text-lg font-bold text-white truncate w-full" title={order.location}>{order.location}</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Delivery Progress</span>
                <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-1000 ease-in-out" 
                />
              </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isUpcoming = index > currentStepIndex;
                
                return (
                  <div
                    key={step.key}
                    className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}
                  >
                    <div className={`flex items-center justify-center size-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-500 ${
                      isCompleted 
                        ? 'bg-amber-500 border-amber-900 text-white shadow-amber-500/40' 
                        : 'bg-gray-800 border-gray-900 text-gray-500'
                    }`}>
                      <Icon className="size-5" />
                    </div>
                    
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                      isCurrent ? 'bg-amber-500/10 border-amber-500/30' : 
                      isCompleted ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className={`font-bold text-lg ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</div>
                        {isCompleted && !isCurrent && (
                          <CheckCircle className="size-5 text-amber-400" />
                        )}
                        {isCurrent && (
                          <div className="text-xs font-bold text-amber-400 uppercase tracking-wide bg-amber-500/20 px-2 py-1 rounded animate-pulse">
                            In progress
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        {order.status === 'delivered' && (
          <div 
            className="p-6 bg-gradient-to-r from-green-900/40 to-emerald-900/20 rounded-2xl border border-green-500/30 shadow-2xl shadow-green-900/20"
          >
            <div className="flex items-center gap-3 text-green-400 mb-2">
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle className="size-6" />
              </div>
              <h3 className="text-xl font-bold">Order Delivered Successfully!</h3>
            </div>
            <p className="text-md text-green-100/70 ml-14 font-medium">
              Thank you for using QuickDeliver. Enjoy your item!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
