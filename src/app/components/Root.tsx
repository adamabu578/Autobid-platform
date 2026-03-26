"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase, getCurrentSession, signout } from "../utils/api";
import { Button } from "./ui/button";
import { CarFront, LogOut } from "lucide-react";

interface AuthContextType {
  user: any;
  userRole: string | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function Root({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    const session = await getCurrentSession();
    if (session?.user) {
      setUser(session.user);
      setUserRole(session.user.user_metadata?.role || null);
    } else {
      setUser(null);
      setUserRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setUserRole(session.user.user_metadata?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signout();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, refreshUser }}>
      <div className="min-h-screen flex flex-col relative">
        {/* Abstract Background Elements — hidden on landing page */}
        {user && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-900/20 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-amber-900/20 blur-[100px]" />
        </div>
        )}

        {/* Header */}
        {user && (
          <header
            className="sticky top-0 z-50 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div
                  className="flex items-center gap-3 cursor-pointer group transition-transform hover:scale-105 active:scale-95"
                  onClick={() => router.push('/')}
                >
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                    <CarFront className="size-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:inline">AutoBids</span>
                </div>

                {/* Role-based Navigation */}
                <nav className="hidden sm:flex items-center gap-1">
                  {userRole === 'seller' && (
                    <>
                      <Link href="/seller/dashboard" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith('/seller/dashboard') ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}>Dashboard</Link>
                      <Link href="/cars" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/cars' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}>Manage Inventory</Link>
                      <Link href="/upload-car" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/upload-car' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}>List a Car</Link>
                    </>
                  )}
                  {userRole === 'buyer' && (
                    <>
                      <Link href="/cars" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/cars' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}>Live Auctions</Link>
                      <Link href="/bids" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/bids' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}>My Bids</Link>
                      <Link href="/orders" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/orders' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}>Won Auctions</Link>
                    </>
                  )}
                </nav>

                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-200">
                      {user.user_metadata?.name}
                    </span>
                    <span className="text-xs text-orange-400 font-medium tracking-wider uppercase">
                      {userRole}
                    </span>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogOut className="size-4 mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full z-10 relative">
          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div
                className="size-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"
              />
            </div>
          ) : (
            <div>
              {children}
            </div>
          )}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
