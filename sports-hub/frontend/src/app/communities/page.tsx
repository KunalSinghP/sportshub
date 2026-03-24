import { API } from "@/lib/api";
import { Users, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default async function CommunitiesPage() {
  const res = await fetch(`${API}/communities`, {
    cache: "no-store",
  });
  
  const data = await res.json();
  const communities = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Users className="text-[#ff6b00]" size={28} />
          <h1 className="text-3xl font-black tracking-tight">Communities</h1>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search communities..." 
            className="w-full bg-[#141a2b] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#ff6b00] transition-colors"
          />
        </div>
      </div>

      {/* Communities Grid Layout */}
      {communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((comm: any) => (
            <div key={comm.id} className="glass rounded-xl p-6 group hover:border-[#ff6b00]/50 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center font-black text-lg text-white shadow-xl group-hover:from-[#ff6b00] transition-colors">
                  {comm.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2 py-1 rounded-full">
                  {(Math.random() * 50 + 1).toFixed(1)}k Members
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-[#ff6b00] transition-colors">
                #/{comm.name.replace(/\s+/g, '-').toLowerCase()}
              </h3>
              <p className="text-sm text-slate-400 mb-6 line-clamp-2">{comm.description}</p>
              
              <Link 
                href={`/community/${comm.name.replace(/\s+/g, '-').toLowerCase()}`}
                className="block w-full text-center bg-[#ff6b00]/10 hover:bg-[#ff6b00] text-[#ff6b00] hover:text-white border border-[#ff6b00]/20 py-2 rounded-lg font-bold transition-all shadow-lg"
              >
                Enter Hub
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-24 glass rounded-xl border-2 border-dashed border-white/5">
          <Users className="text-slate-500 mb-4 opacity-50" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No Communities Found</h3>
          <p className="text-slate-400">There are currently no active communities available.</p>
        </div>
      )}
    </div>
  );
}
