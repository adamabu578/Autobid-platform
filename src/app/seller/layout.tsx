export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {/* Seller Dashboard Hero Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-teal-600/10 ring-1 ring-white/10 group">
        <img 
          src="/honda.jpg" 
          alt="Seller Dashboard" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex items-end justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-teal-600 font-bold tracking-wider text-sm uppercase">Seller Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Manage Your Inventory</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
