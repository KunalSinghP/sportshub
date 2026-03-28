"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { API } from "@/lib/api";

export default function CommunityPage({ params }: { params: any }) {
  const [actualName, setActualName] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState("");
  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("Posts");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem("sportsHubToken") : null;

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      if (p?.name) {
        setActualName(p.name);
        setCommunityName(decodeURIComponent(p.name).replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()));
      }
    });
  }, [params]);

  useEffect(() => {
    if (!actualName) return;

    async function fetchCommunityData() {
      try {
        const headers: any = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        const commRes = await fetch(`${API}/communities/name/${actualName}`, { headers });
        if (commRes.ok) {
          const commData = await commRes.json();
          setCommunity(commData);
          setCommunityName(commData.name);
          
          const postsRes = await fetch(`${API}/communities/${commData.id}/posts`);
          if (postsRes.ok) {
            setPosts(await postsRes.json());
          }
        }
      } catch (err) {
        console.error("Failed to load community", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCommunityData();
  }, [actualName, token]);

  const requireAuthToParticipate = (e: React.MouseEvent | React.FocusEvent) => {
    if (!token) {
      e.preventDefault();
      if ('blur' in e.target) {
        (e.target as HTMLElement).blur();
      }
      alert("You must be logged in to participate in communities!");
      return false;
    }
    return true;
  };

  const handleJoinToggle = async () => {
    if (!token) {
      alert("You must be logged in to join a community.");
      return;
    }
    if (!community) return;
    
    setIsJoining(true);
    try {
      const res = await fetch(`${API}/communities/${community.id}/join`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCommunity((prev: any) => ({
          ...prev,
          is_member: data.action === "joined",
          member_count: data.member_count
        }));
      } else if (res.status === 401) {
        localStorage.removeItem("sportsHubToken");
        localStorage.removeItem("chatUsername");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        alert("Failed to update membership status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const res = await fetch(`${API}/communities/posts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          community_id: community.id
        })
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostTitle("");
        setNewPostContent("");
      } else if (res.status === 401) {
        localStorage.removeItem("sportsHubToken");
        localStorage.removeItem("chatUsername");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        alert("Failed to create post");
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Hub..." />;
  
  if (!community) return (
    <div className="max-w-4xl mx-auto pb-8 p-10 text-center">
      <h1 className="text-3xl font-bold mb-4 text-white">Community Not Found</h1>
      <Link href="/communities" className="text-[#ff6b00] underline hover:text-white transition-colors">Back to Communities</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-8">
      
      {/* Community Banner & Header */}
      <div className="h-40 bg-gradient-to-r from-blue-900 via-[#1a142b] to-[#0b0f19] relative rounded-b-3xl shadow-xl overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-black/40 mix-blend-overlay"></div>
        <Link href="/communities" className="absolute top-6 left-6 bg-black/40 p-2.5 rounded-full hover:bg-black/80 transition-all hover:-translate-x-1 z-10 text-white">
          <ArrowLeft size={20} />
        </Link>
      </div>
      
      <div className="px-6 -mt-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          <div className="w-28 h-28 rounded-full border-4 border-[#0b0f19] bg-gradient-to-br from-[#ff6b00] to-rose-600 flex items-center justify-center shadow-2xl shrink-0">
            <span className="text-4xl font-black text-white">{communityName.charAt(0)}</span>
          </div>
          <div className="pb-2">
            <h1 className="text-3xl md:text-4xl font-black mb-1 p-1">p/{communityName.replace(/\s+/g, '')}</h1>
            <p className="text-slate-300 max-w-lg text-sm mb-3 px-1">
              {community.description}
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold bg-white/5 px-3 py-1.5 rounded-full inline-flex ml-1 border border-white/5">
              <Users size={16} className="text-[#ff6b00]" />
              {(community.member_count / 1000).toFixed(1)}k Members
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleJoinToggle} 
          disabled={isJoining}
          className={`mb-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 justify-center min-w-[140px] border border-transparent
            ${community.is_member 
              ? 'bg-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' 
              : 'bg-gradient-to-r from-[#ff6b00] to-orange-500 hover:to-orange-400 text-white shadow-[#ff6b00]/25 hover:-translate-y-0.5'}`}
        >
          {isJoining ? <Loader2 className="animate-spin" size={20} /> : (community.is_member ? "Leave Hub" : "Join Hub")}
        </button>
      </div>

      <div className="px-4">
        {/* Create Post Interface */}
        <div className="glass rounded-xl p-5 mb-8 border border-white/5 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner flex-shrink-0 flex items-center justify-center font-bold text-white border border-white/10">
              ?
            </div>
            <div className="flex-1 space-y-3">
              <input 
                type="text" 
                onFocus={requireAuthToParticipate}
                value={newPostTitle}
                onChange={e => setNewPostTitle(e.target.value)}
                placeholder="Title your post" 
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:border-white/20 focus:border-[#ff6b00] outline-none transition-colors placeholder:text-slate-500 shadow-inner"
              />
              <textarea 
                onFocus={requireAuthToParticipate}
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?" 
                rows={3}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-sm text-white hover:border-white/20 focus:border-[#ff6b00] outline-none transition-colors resize-none placeholder:text-slate-500 shadow-inner"
              />
            </div>
          </div>
          <div className="flex justify-end pt-3 border-t border-white/5">
            <button 
              onClick={handlePostSubmit}
              disabled={isPosting || !newPostTitle.trim() || !newPostContent.trim()}
              className="bg-[#ff6b00] hover:bg-[#e05e00] text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#ff6b00]/20"
            >
              {isPosting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Post to p/{communityName.replace(/\s+/g, '')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/10 mb-6 px-2">
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
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b00] rounded-t-full shadow-[0_-2px_10px_rgba(255,107,0,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Feed */}
        {activeTab === "Posts" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-16 glass rounded-xl text-slate-400 border border-dashed border-white/10 shadow-inner">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-white mb-1">No posts right now</h3>
                <p className="text-sm">Be the first to start the conversation!</p>
              </div>
            ) : (
              posts.map((post: any) => (
                <PostCard key={post.id} {...post} />
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
