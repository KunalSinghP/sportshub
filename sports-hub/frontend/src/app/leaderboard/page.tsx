"use client";

import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const mockUsers = [
    { rank: 1, name: "OracleSports", accuracy: 82.5, total: 142, trend: "up" },
    { rank: 2, name: "prophet_101", accuracy: 78.3, total: 89, trend: "up" },
    { rank: 3, name: "analytic_mind", accuracy: 75.1, total: 210, trend: "down" },
    { rank: 4, name: "lucky_guesser", accuracy: 72.8, total: 45, trend: "same" },
    { rank: 5, name: "stats_nerd", accuracy: 70.4, total: 312, trend: "up" },
    { rank: 6, name: "sports_fan99", accuracy: 68.9, total: 110, trend: "down" },
    { rank: 7, name: "weekend_warrior", accuracy: 65.2, total: 25, trend: "same" },
  ];

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
      case 2: return "text-zinc-300 drop-shadow-[0_0_10px_rgba(212,212,216,0.5)]";
      case 3: return "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]";
      default: return "text-slate-500";
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-8 p-4">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center py-10 mb-8 border-b border-white/5">
        <Trophy size={48} className="text-[#ff6b00] mb-4 drop-shadow-[0_0_15px_rgba(255,107,0,0.4)]" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Global Leaderboard
        </h1>
        <p className="text-slate-400 mt-2">Ranked by overall prediction accuracy</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-12 h-48">
        {[
          { ...mockUsers[1], height: "h-32", bg: "from-zinc-400 to-zinc-600" },
          { ...mockUsers[0], height: "h-40", bg: "from-yellow-400 to-yellow-600" },
          { ...mockUsers[2], height: "h-28", bg: "from-amber-600 to-amber-800" },
        ].map(user => (
          <div key={user.rank} className="flex flex-col items-center w-28 group">
            <Link href={`/profile/${user.name}`} className="font-bold text-sm mb-1 group-hover:text-[#ff6b00] transition-colors truncate w-full text-center">
              {user.name}
            </Link>
            <span className="text-xs text-slate-400 mb-2">{user.accuracy}%</span>
            <div className={`w-full ${user.height} bg-gradient-to-b ${user.bg} rounded-t-lg border-t-2 border-white/20 flex justify-center pt-2 shadow-2xl relative overflow-hidden`}>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent w-full h-full pointer-events-none" />
              <span className="text-xl font-black font-mono text-black/40">{user.rank}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-black/20 border-b border-white/5">
              <th className="p-4 font-semibold text-slate-400 w-16 text-center">Rank</th>
              <th className="p-4 font-semibold text-slate-400">Predictor</th>
              <th className="p-4 font-semibold text-slate-400 text-right">Accuracy</th>
              <th className="p-4 font-semibold text-slate-400 text-right">Total Picks</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, idx) => (
              <tr key={user.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="p-4 text-center">
                  <span className={`font-black font-mono text-lg ${getMedalColor(user.rank)}`}>
                    #{user.rank}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs uppercase text-slate-300">
                      {user.name.substring(0, 2)}
                    </div>
                    <Link href={`/profile/${user.name}`} className="font-semibold text-slate-200 group-hover:text-[#ff6b00] transition-colors">
                      {user.name}
                    </Link>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold text-green-400">{user.accuracy}%</span>
                    {user.trend === "up" && <TrendingUp size={14} className="text-green-500" />}
                    {user.trend === "down" && <TrendingDown size={14} className="text-red-500" />}
                    {user.trend === "same" && <Minus size={14} className="text-slate-500" />}
                  </div>
                </td>
                <td className="p-4 text-right font-mono text-slate-400">
                  {user.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
