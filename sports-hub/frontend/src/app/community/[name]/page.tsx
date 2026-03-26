"use client";

import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import PostCard from "@/components/PostCard";

export default function CommunityPage({ params }: { params: { name: string } }) {
  const communityName = decodeURIComponent(params.name).replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  const [activeTab, setActiveTab] = useState("Posts");

  const requireAuthToParticipate = (e: React.MouseEvent | React.FocusEvent) => {
    const token = localStorage.getItem("sportsHubToken");
    if (!token) {
      e.preventDefault();
      if ('blur' in e.target) {
        (e.target as HTMLElement).blur();
      }
      alert("You must be signed up or logged in to participate in communities!");
      // Optionally redirect: window.location.href = '/login';
    }
  };

  // Mock
  const mockPosts = [
    {
      id: 1,
      title: "Weekly Discussion Thread",
      content: "Discuss anything related to the matches this week. Please keep it civil.",
      authorName: "mod_team",
      communityName: communityName,
      upvotes: 42,
      commentCount: 120,
      timeAgo: "1 day ago"
    },
    {
      id: 2,
      title: "Unpopular Opinion: The new rules are actually better",
      content: "I know everyone is complaining, but having faster game times is making things way more exciting to watch.",
      authorName: "sports_fanatic",
      communityName: communityName,
      upvotes: 215,
      commentCount: 89,
      timeAgo: "3 hours ago"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-8">
      
      {/* Community Banner & Header */}
      <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-900 to-[#141a2b] relative">
        <Link href="/communities" className="absolute top-4 left-4 bg-black/40 p-2 rounded-full hover:bg-black/60 transition-colors">
          <ArrowLeft size={20} />
        </Link>
      </div>
      
      <div className="px-6 -mt-8 relative z-10 flex items-end justify-between mb-8">
        <div className="flex items-end gap-5">
          <div className="w-24 h-24 rounded-full border-4 border-[#0b0f19] bg-gradient-to-br from-[#ff6b00] to-orange-800 flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-white">{communityName.charAt(0)}</span>
          </div>
          <div className="pb-2">
            <h1 className="text-3xl font-bold">p/{communityName}</h1>
            <p className="text-slate-400 text-sm mt-1">45.2k Members • 1.2k Online</p>
          </div>
        </div>
        <button onClick={requireAuthToParticipate} className="mb-2 bg-[#ff6b00] hover:bg-[#e05e00] text-white px-6 py-2 rounded-full font-bold transition-colors">
          Join
        </button>
      </div>

      <div className="px-4">
        {/* Create Post Input */}
        <div className="glass rounded-xl p-4 flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0" />
          <input 
            type="text" 
            onFocus={requireAuthToParticipate}
            placeholder="Create Post" 
            className="flex-1 bg-black/20 border border-white/5 rounded-lg px-4 py-2.5 text-sm hover:border-white/20 focus:border-[#ff6b00] outline-none transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/10 mb-6">
          {["Posts", "About", "Rules"].map((tab) => (
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

        {/* Feed */}
        {activeTab === "Posts" && (
          <div className="space-y-4">
            {mockPosts.map(post => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
