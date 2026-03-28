import Link from "next/link";
import { Users, ChevronRight, MessageSquare, Activity } from "lucide-react";

interface MatchCardProps {
  id: number;
  team1: string;
  team2: string;
  status: "live" | "upcoming" | "finished";
  viewers?: number;
}

export default function MatchCard({
  id,
  team1,
  team2,
  status,
  viewers,
}: MatchCardProps) {
  return (
    <div className="glass rounded-xl p-4 min-w-[300px] flex-shrink-0 relative overflow-hidden group hover:border-[#ff6b00]/50 transition-colors">
      
      {/* Status Badge header */}
      <div className="flex justify-between items-center mb-4 text-xs font-semibold">
        {status === "live" ? (
          <div className="flex items-center gap-1.5 text-[#ff6b00] bg-[#ff6b00]/10 px-2 py-0.5 rounded-full border border-[#ff6b00]/20">
            <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse"></span>
            🔥 Live Chatroom
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full border border-white/5">
            <MessageSquare size={12} />
            Chatroom
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-1 mb-5 text-center py-2">
        <div className="font-bold text-xl">{team1}</div>
        <div className="text-sm font-semibold text-slate-500">vs</div>
        <div className="font-bold text-xl">{team2}</div>
      </div>

      {/* Footer and CTA */}
      <div className="pt-3 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center text-xs text-slate-400">
          <Activity size={12} className="text-[#ff6b00] mr-1" />
          🔥 Active Discussion
        </div>
        
        <Link 
          href={`/match/${id}`}
          className="text-xs px-3 py-1.5 bg-white/5 group-hover:bg-[#ff6b00] text-white rounded-lg font-semibold flex items-center gap-1 transition-all"
        >
          Join Chatroom
          <ChevronRight size={14} />
        </Link>
      </div>

    </div>
  );
}
