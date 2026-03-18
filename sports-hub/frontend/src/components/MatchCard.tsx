import Link from "next/link";
import { Activity, Users, ChevronRight } from "lucide-react";

interface MatchCardProps {
  id: number;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: "live" | "upcoming" | "finished";
  timeStr: string;
  viewers?: number;
}

export default function MatchCard({
  id,
  team1,
  team2,
  score1,
  score2,
  status,
  timeStr,
  viewers,
}: MatchCardProps) {
  return (
    <div className="glass rounded-xl p-4 min-w-[300px] flex-shrink-0 relative overflow-hidden group hover:border-[#ff6b00]/50 transition-colors">
      
      {/* Status Badge header */}
      <div className="flex justify-between items-center mb-4 text-xs font-semibold">
        {status === "live" ? (
          <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE
          </div>
        ) : (
          <div className="text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5 uppercase">
            {status}
          </div>
        )}
        <div className="text-slate-400">{timeStr}</div>
      </div>

      {/* Teams and Score */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{team1}</span>
          <span className={`text-xl font-bold font-mono ${status === "live" ? "text-white" : "text-slate-300"}`}>
            {score1}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{team2}</span>
          <span className={`text-xl font-bold font-mono ${status === "live" ? "text-white" : "text-slate-300"}`}>
            {score2}
          </span>
        </div>
      </div>

      {/* Footer and CTA */}
      <div className="pt-3 border-t border-white/5 flex justify-between items-center">
        {status === "live" && viewers !== undefined ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={14} />
            <span>{viewers.toLocaleString()}</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Match Insights</div>
        )}
        
        <Link 
          href={`/match/${id}`}
          className="text-xs font-semibold text-[#ff6b00] flex items-center group-hover:translate-x-1 transition-transform"
        >
          {status === "live" ? "Join Discussion" : "View Details"}
          <ChevronRight size={14} />
        </Link>
      </div>

    </div>
  );
}
