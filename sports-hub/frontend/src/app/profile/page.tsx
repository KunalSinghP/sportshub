"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, Settings, Target, MessageSquare, Clock } from "lucide-react";
import PostCard from "@/components/PostCard";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Posts");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sportsHubToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`${API}/auth/me/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Invalid token");

        const data = await res.json();
        setUser(data);
      } catch (error) {
        localStorage.removeItem("sportsHubToken");
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("sportsHubToken");
    localStorage.removeItem("chatUsername");
    router.push("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#ff6b00]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-8 p-4">
      
      {/* Profile Header */}
      <div className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 mt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 border-4 border-[#0b0f19] shadow-xl">
          <UserIcon size={40} className="text-white" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <span className="bg-[#ff6b00]/20 text-[#ff6b00] border border-[#ff6b00]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              #1 Global Rank
            </span>
          </div>
          <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1">
            <Clock size={14} /> Joined {user.joined}
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border border-white/10">
            <Settings size={16} /> Edit Profile
          </button>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border border-red-500/20">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-5 text-center transition-transform hover:scale-105">
          <Target className="mx-auto text-[#ff6b00] mb-2" size={24} />
          <div className="text-2xl font-black">{user.accuracy}%</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Accuracy</div>
        </div>
        <div className="glass rounded-xl p-5 text-center transition-transform hover:scale-105">
          <TrophyIcon className="mx-auto text-yellow-500 mb-2" size={24} />
          <div className="text-2xl font-black">#{user.rank}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Global Rank</div>
        </div>
        <div className="glass rounded-xl p-5 text-center transition-transform hover:scale-105">
          <ActivityIcon className="mx-auto text-blue-400 mb-2" size={24} />
          <div className="text-2xl font-black font-mono">{user.totalPicks}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total Picks</div>
        </div>
        <div className="glass rounded-xl p-5 text-center transition-transform hover:scale-105">
          <MessageSquare className="mx-auto text-purple-400 mb-2" size={24} />
          <div className="text-2xl font-black font-mono">34</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Posts</div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex gap-6 border-b border-white/10 mb-6 px-2 overflow-x-auto whitespace-nowrap">
        {["Posts", "Comments", "Prediction History"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b00] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Posts" && (
        <div className="space-y-4">
          {user?.posts?.map((post: any) => (
            <PostCard key={post.id} {...post} />
          ))}
          {(!user?.posts || user.posts.length === 0) && (
             <div className="py-12 text-center text-slate-500 font-semibold border border-dashed border-white/5 rounded-xl">
               You haven't made any Community Posts yet!
             </div>
          )}
        </div>
      )}

      {activeTab === "Prediction History" && (
        <div className="glass rounded-xl overflow-hidden p-2">
           <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-white/5 bg-white/5">
                <tr>
                  <th className="p-4 font-bold rounded-tl-lg">Match</th>
                  <th className="p-4 font-bold">Prediction</th>
                  <th className="p-4 text-right font-bold rounded-tr-lg">Result</th>
                </tr>
              </thead>
              <tbody>
                {user?.predictions?.map((pred: any) => (
                  <tr key={pred.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                     <td className="p-4 font-semibold text-white">{pred.match_title}</td>
                     <td className="p-4 text-[#ff6b00] font-bold">{pred.predicted_winner}</td>
                     <td className={`p-4 text-right font-black tracking-wider ${
                       pred.result === 'WIN' ? 'text-green-500' :
                       pred.result === 'LOSS' ? 'text-red-500' :
                       'text-yellow-500'
                     }`}>{pred.result}</td>
                  </tr>
                ))}
                {(!user?.predictions || user.predictions.length === 0) && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 font-semibold">
                      You haven't made any match predictions yet!
                    </td>
                  </tr>
                )}
              </tbody>
           </table>
        </div>
      )}

    </div>
  );
}

// Extracted icons for aesthetic consistency
function TrophyIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
  );
}
