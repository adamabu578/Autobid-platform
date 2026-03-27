"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/Root";
import { createCarListing, type Car } from "../utils/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Loader2, CarFront, UploadCloud, ArrowLeft, DollarSign, ImagePlus, CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UploadCarPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState<Car['condition']>('Used - Excellent');
  const [startingPrice, setStartingPrice] = useState("");
  const [buyItNowPrice, setBuyItNowPrice] = useState("");
  const [auctionDays, setAuctionDays] = useState("7");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const LISTING_FEE = 49.99; // $49.99 Premium Listing Fee

  useEffect(() => {
    if (!authLoading) {
      if (!user || userRole !== 'seller') {
        router.push("/");
      }
    }
  }, [user, userRole, authLoading, router]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !year || !mileage || !startingPrice) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Trigger Payment Modal Instead of Submitting Directly
    setShowPaymentModal(true);
  };

  const processPaymentAndListCar = async () => {
    setPaymentProcessing(true);
    
    try {
      // Simulate Payment Gateway Delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentSuccess(true);
      
      // Wait a moment so the user sees the success state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalImage = imageUrl.trim() || "/bmw.jpg";

      await createCarListing(
        make,
        model,
        parseInt(year),
        parseInt(mileage),
        condition,
        parseFloat(startingPrice),
        buyItNowPrice ? parseFloat(buyItNowPrice) : undefined,
        parseInt(auctionDays),
        finalImage
      );

      toast.success('Payment successful! Car listed for auction.');
      router.push('/seller/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to list car');
      setPaymentProcessing(false);
      setPaymentSuccess(false);
      setShowPaymentModal(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6 flex items-center">
        <Link href="/seller/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center group">
          <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">List Your Premium Vehicle</h1>
          <p className="text-slate-400 text-lg mb-8">Reach thousands of engaged buyers across our live auction platform.</p>

          <form onSubmit={handleInitialSubmit}>
            <Card className="bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-r from-teal-700/20 to-transparent p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-600/20 border border-teal-600/30 text-amber-500">
                    <CarFront className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Vehicle Specifications</h2>
                    <p className="text-slate-400 text-sm">Provide accurate details to attract serious bidders.</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="make" className="text-slate-300 font-medium">Make</Label>
                    <Input
                      id="make"
                      placeholder="e.g. Mercedes-Benz"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      className="bg-slate-950/50 border-white/10 text-white h-12 rounded-xl focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-slate-300 font-medium">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g. AMG GT"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="bg-slate-950/50 border-white/10 text-white h-12 rounded-xl focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-slate-300 font-medium">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="e.g. 2023"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="bg-slate-950/50 border-white/10 text-white h-12 rounded-xl focus:border-teal-600 focus:ring-teal-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage" className="text-slate-300 font-medium">Mileage</Label>
                    <div className="relative">
                      <Input
                        id="mileage"
                        type="number"
                        placeholder="e.g. 12500"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                        className="bg-slate-950/50 border-white/10 text-white pl-4 pr-12 h-12 rounded-xl focus:border-teal-600 focus:ring-teal-600/20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">mi</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-slate-300 font-medium">Condition</Label>
                  <Select value={condition} onValueChange={(v: any) => setCondition(v)}>
                    <SelectTrigger className="bg-slate-950/50 border-white/10 text-white h-12 rounded-xl focus:ring-teal-600/20">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                      <SelectItem value="New" className="focus:bg-teal-700/20 focus:text-white cursor-pointer py-2.5">New</SelectItem>
                      <SelectItem value="Used - Excellent" className="focus:bg-teal-700/20 focus:text-white cursor-pointer py-2.5">Used - Excellent</SelectItem>
                      <SelectItem value="Used - Good" className="focus:bg-teal-700/20 focus:text-white cursor-pointer py-2.5">Used - Good</SelectItem>
                      <SelectItem value="Used - Fair" className="focus:bg-teal-700/20 focus:text-white cursor-pointer py-2.5">Used - Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-white/5 my-8 pt-8" />
                
                <h3 className="text-lg font-bold text-white mb-4">Auction Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startingPrice" className="text-slate-300 font-medium">Starting Bid</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <DollarSign className="size-4 text-amber-500" />
                      </div>
                      <Input
                        id="startingPrice"
                        type="number"
                        placeholder="0.00"
                        value={startingPrice}
                        onChange={(e) => setStartingPrice(e.target.value)}
                        className="bg-slate-950/50 border-white/10 text-white pl-10 h-12 rounded-xl focus:border-teal-600 focus:ring-teal-600/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyItNowPrice" className="text-slate-300 font-medium">Buy It Now Price (Optional)</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <DollarSign className="size-4 text-emerald-400" />
                      </div>
                      <Input
                        id="buyItNowPrice"
                        type="number"
                        placeholder="0.00"
                        value={buyItNowPrice}
                        onChange={(e) => setBuyItNowPrice(e.target.value)}
                        className="bg-slate-950/50 border-white/10 text-white pl-10 h-12 rounded-xl focus:border-teal-600 focus:ring-teal-600/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auctionDays" className="text-slate-300 font-medium">Auction Duration</Label>
                  <Select value={auctionDays} onValueChange={setAuctionDays}>
                    <SelectTrigger className="bg-slate-950/50 border-white/10 text-white h-12 rounded-xl focus:ring-teal-600/20">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                      <SelectItem value="1" className="cursor-pointer py-2.5">1 Day (Flash Auction)</SelectItem>
                      <SelectItem value="3" className="cursor-pointer py-2.5">3 Days</SelectItem>
                      <SelectItem value="5" className="cursor-pointer py-2.5">5 Days</SelectItem>
                      <SelectItem value="7" className="cursor-pointer py-2.5">7 Days (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium">Vehicle Image</Label>
                  <div className="flex flex-col gap-4">
                    <div className="relative group cursor-pointer w-full h-40 bg-slate-950/50 border-2 border-dashed border-white/20 rounded-xl hover:border-teal-600/50 transition-colors flex flex-col items-center justify-center text-slate-400 overflow-hidden">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {imageUrl ? (
                        <>
                          <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                              <UploadCloud className="size-4" /> Change Image
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="size-8 mb-3 text-slate-500 group-hover:text-amber-500 transition-colors" />
                          <span className="text-sm font-medium text-slate-300 group-hover:text-amber-400 transition-colors">Click or drag image to upload</span>
                          <span className="text-xs opacity-70 mt-1">PNG, JPG, WEBP</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-500 hover:to-teal-300 text-white h-14 rounded-xl text-lg font-bold shadow-xl shadow-teal-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6"
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Live Preview Side Panel */}
        <div className="w-full md:w-80 hidden md:block">
          <div className="sticky top-24">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4 pl-1">Live Preview</h3>
            <Card className="bg-slate-900/40 border-white/5 overflow-hidden shadow-2xl rounded-2xl p-0">
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img 
                  src={imageUrl || "/bmw.jpg"} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="bg-teal-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-white animate-pulse block" /> Live Bid
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-extrabold text-lg line-clamp-1">
                    {year || "2023"} {make || "Make"} {model || "Model"}
                  </h3>
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <div className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Starting Bid</div>
                    <div className="text-xs font-bold text-white">${startingPrice ? parseFloat(startingPrice).toLocaleString() : '0'}</div>
                  </div>
                  {buyItNowPrice && (
                    <div className="bg-teal-600/10 rounded-lg p-2 border border-teal-600/20">
                      <div className="text-[9px] text-amber-500 uppercase font-bold mb-0.5">Buy It Now</div>
                      <div className="text-xs font-bold text-white">${parseFloat(buyItNowPrice).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Overlay Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => !paymentProcessing && !paymentSuccess && setShowPaymentModal(false)} />
          
          <Card className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 rounded-2xl">
            {/* Success State Overlay */}
            {paymentSuccess && (
              <div className="absolute inset-0 bg-green-500/20 backdrop-blur-md z-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
                <CheckCircle2 className="size-20 text-green-400 mb-4 animate-in zoom-in duration-500" />
                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                <p className="text-green-100">Launching your live auction...</p>
              </div>
            )}

            <div className="bg-gradient-to-r from-teal-700/20 to-transparent p-6 border-b border-white/5 relative">
              <button 
                onClick={() => !paymentProcessing && !paymentSuccess && setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                disabled={paymentProcessing || paymentSuccess}
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-600/20 border border-teal-600/30 text-amber-500">
                  <CreditCard className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Listing Checkout</h2>
                  <p className="text-slate-400 text-sm">Secure premium vehicle placement</p>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-white/5 mb-6">
                <div>
                  <div className="text-sm font-bold text-slate-300">{year} {make} {model}</div>
                  <div className="text-xs text-slate-500">Premium Listing Fee - {auctionDays} Days</div>
                </div>
                <div className="text-2xl font-extrabold text-white">${LISTING_FEE.toFixed(2)}</div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Card Information</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
                    <Input 
                      placeholder="4242 4242 4242 4242" 
                      className="bg-slate-950/50 border-white/10 text-white pl-10 h-12 rounded-xl focus:border-teal-600"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Expiry</Label>
                    <Input 
                      placeholder="MM/YY" 
                      className="bg-slate-950/50 border-white/10 text-white h-12 rounded-xl focus:border-teal-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider">CVC</Label>
                    <Input 
                      placeholder="123" 
                      type="password"
                      maxLength={4}
                      className="bg-slate-950/50 border-white/10 text-white h-12 rounded-xl focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
                <Lock className="size-3" /> Payments are secure and encrypted
              </div>

              <Button 
                onClick={processPaymentAndListCar}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-400 hover:from-teal-500 hover:to-teal-300 text-white h-14 rounded-xl text-lg font-bold shadow-xl transition-all"
                disabled={paymentProcessing}
              >
                {paymentProcessing ? (
                  <>
                    <Loader2 className="size-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>Pay ${LISTING_FEE} & List Car</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
