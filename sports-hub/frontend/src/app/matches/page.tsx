import MatchCard from "@/components/MatchCard";
import { API } from "@/lib/api";
import { Trophy, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function MatchesPage() {
  const matchRes = await fetch(`${API}/matches`, {
    cache: "no-store",
  });

  const matchData = await matchRes.json();

  const matchesArray = Array.isArray(matchData)
    ? matchData.map((m: any) => ({
        ...m,
        score1: m.score_team1 ?? 0,
        score2: m.score_team2 ?? 0,
      }))
    : [];

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
          <Trophy className="text-[#ff6b00]" size={28} />
          <h1 className="text-3xl font-black tracking-tight">All Matches</h1>
        </div>
        
        {/* Dynamic Filters */}
        <div className="flex items-center gap-3">
          <select className="bg-[#141a2b] border border-white/10 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:border-[#ff6b00] transition-colors">
            <option>All Tournaments</option>
            <option>IPL</option>
            <option>Pro Kabaddi</option>
          </select>
          <select className="bg-[#141a2b] border border-white/10 rounded-lg px-4 py-2 text-sm font-semibold outline-none focus:border-[#ff6b00] transition-colors">
            <option>All Statuses</option>
            <option>Live Now</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      {/* Matches Grid Layout */}
      {matchesArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchesArray.map((match: any) => (
            <MatchCard key={match.id} {...match} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-24 glass rounded-xl border-2 border-dashed border-white/5">
          <Activity className="text-slate-500 mb-4 animate-pulse" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">No Matches Found</h3>
          <p className="text-slate-400">There are currently no active matches available to display.</p>
        </div>
      )}
    </div>
  );
}
