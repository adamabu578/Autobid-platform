"use client";

import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div
        className="w-full max-w-md"
      >
        <Card className="bg-black/60 backdrop-blur-2xl border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500"></div>
          
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div 
              className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white/20 to-white/5 mb-6 select-none"
            >
              404
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">Page Not Found</h3>
            <p className="text-gray-400 mb-8 max-w-[250px]">
              Looks like you've ventured into the unknown. This page doesn't exist.
            </p>
            
            <Button 
              onClick={() => router.push('/')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-lg backdrop-blur-md rounded-xl h-12 px-8 font-semibold transition-all group"
            >
              <Home className="size-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
