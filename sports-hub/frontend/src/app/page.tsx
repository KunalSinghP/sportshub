import MatchCard from "@/components/MatchCard";
import PostCard from "@/components/PostCard";
import { Trophy, TrendingUp } from "lucide-react";

export default function Home() {
  // Mock Data for initial UI testing
  const mockMatches = [
    {
      id: 1,
      team1: "Arsenal",
      team2: "Liverpool",
      score1: 2,
      score2: 2,
      status: "live" as const,
      timeStr: "78'",
      viewers: 12450
    },
    {
      id: 2,
      team1: "Lakers",
      team2: "Warriors",
      score1: 0,
      score2: 0,
      status: "upcoming" as const,
      timeStr: "Today, 8:00 PM"
    },
    {
      id: 3,
      team1: "Real Madrid",
      team2: "Barcelona",
      score1: 3,
      score2: 1,
      status: "finished" as const,
      timeStr: "FT"
    }
  ];

  const mockPosts = [
    {
      id: 1,
      title: "What a match from Arsenal today! Truly an unbelievable performance.",
      content: "That last goal was insane. The build up play from the back was beautiful. Arteta really has them playing exceptional football right now.",
      authorName: "gunner_fan99",
      communityName: "Premier League",
      upvotes: 342,
      commentCount: 56,
      timeAgo: "2 hours ago"
    },
    {
      id: 2,
      title: "LeBron's legacy is unmatched. Period.",
      content: "People keep arguing about statistics, but the longevity alone puts him in a category of 1. What he's doing at his age defies biology.",
      authorName: "hoopshead",
      communityName: "NBA Discussion",
      upvotes: 1105,
      commentCount: 412,
      timeAgo: "5 hours ago"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        
        {/* Trending Matches Horizontal Strip */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-[#ff6b00]" size={20} />
            <h2 className="text-xl font-bold tracking-tight">Trending Matches</h2>
          </div>
          
          {/* Hide scrollbar but allow dragging/scrolling */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scroll">
            {mockMatches.map(match => (
              <div key={match.id} className="snap-start">
                <MatchCard {...match} />
              </div>
            ))}
          </div>
        </section>

        {/* Community Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Community Feed</h2>
            <div className="flex gap-2">
              <select className="bg-[#141a2b] border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#ff6b00]">
                <option>Hot</option>
                <option>New</option>
                <option>Top</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {mockPosts.map(post => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </section>

      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
        
        {/* Top Predictions */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 text-[#ff6b00]">
            <Trophy size={18} />
            <h3 className="font-bold text-white">Top Prediction Makers</h3>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
                    {i}
                  </div>
                  <span className="font-semibold">User_{i}123</span>
                </div>
                <div className="text-green-400 font-mono">
                  {75 - i * 5}%
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm font-semibold transition-colors">
            View Leaderboard
          </button>
        </div>

        {/* Trending Communities */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-bold mb-4">Trending Communities</h3>
          <div className="space-y-3">
            {["Premier League", "NBA Discussion", "NFL Picks"].map((team, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <span className="text-sm font-medium group-hover:text-[#ff6b00] transition-colors">{team}</span>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{(4 - idx) * 12}k</span>
              </div>
            ))}
          </div>
        </div>

      </aside>
    </div>
  );
}
