"use client";

import Link from "next/link";
import { ArrowBigUp, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface PostCardProps {
  id: number;
  title: string;
  content: string;
  authorName?: string;
  communityName?: string;
  upvotes?: number;
  commentCount?: number;
  timeAgo?: string;
}

export default function PostCard({
  id,
  title,
  content,
  authorName,
  communityName,
  upvotes,
  commentCount,
  timeAgo,
}: PostCardProps) {

  // ✅ SAFE FALLBACKS
  const safeCommunity = (communityName || "general")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const safeAuthor = authorName || "user";
  const safeComments = commentCount ?? 0;
  const safeTime = timeAgo || "Just now";

  const [localUpvotes, setLocalUpvotes] = useState(upvotes ?? 0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  const handleVote = async (e: React.MouseEvent, type: "up" | "down") => {
    e.preventDefault();
    e.stopPropagation();

    if (userVote === type) return;

    const previousVotes = localUpvotes;
    const previousUserVote = userVote;

    // Optimistic Update
    let newVotes = localUpvotes;
    if (type === "up") {
      newVotes = userVote === "down" ? localUpvotes + 2 : localUpvotes + 1;
    } else {
      newVotes = userVote === "up" ? localUpvotes - 2 : localUpvotes - 1;
    }
    setLocalUpvotes(newVotes);
    setUserVote(type);

    try {
      const res = await fetch(`http://127.0.0.1:8000/posts/${id}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: type })
      });
      if (!res.ok) throw new Error("Vote failed");
      
      const data = await res.json();
      setLocalUpvotes(data.upvotes); // Sync with truth
    } catch (error) {
       setLocalUpvotes(previousVotes);
       setUserVote(previousUserVote);
    }
  };

  return (
    <div className="glass rounded-xl p-4 transition-colors hover:border-white/10 group">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs">
          
          <Link
            href={`/community/${safeCommunity}`}
            className="font-bold text-white hover:underline"
          >
            p/{communityName || "General"}
          </Link>

          <span className="text-slate-500">•</span>

          <span className="text-slate-400 text-[11px]">
            Posted by u/{safeAuthor}
          </span>

          <span className="text-slate-500">•</span>

          <span className="text-slate-400 text-[11px]">
            {safeTime}
          </span>
        </div>

        <button className="text-slate-500 hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <Link
        href={`/community/${safeCommunity}/post/${id}`}
        className="block mb-3"
      >
        <h3 className="text-lg font-bold text-slate-100 mb-1 leading-tight group-hover:text-[#ff6b00] transition-colors">
          {title || "Untitled Post"}
        </h3>

        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-wrap">
          {content || "No content available"}
        </p>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-2">
        
        {/* Upvotes */}
        <div className="flex items-center bg-white/5 rounded-full border border-white/5">
          <button 
            onClick={(e) => handleVote(e, "up")}
            className={`p-1.5 hover:bg-white/10 rounded-l-full hover:text-[#ff6b00] transition-colors ${userVote === 'up' ? 'text-[#ff6b00]' : ''}`}
          >
            <ArrowBigUp size={18} className={userVote === 'up' ? 'fill-current' : ''} />
          </button>

          <span className={`px-1 ${userVote ? 'text-[#ff6b00]' : 'text-white'}`}>{localUpvotes}</span>

          <button 
            onClick={(e) => handleVote(e, "down")}
            className={`p-1.5 hover:bg-white/10 rounded-r-full hover:text-[#ff6b00] transition-colors rotate-180 ${userVote === 'down' ? 'text-[#ff6b00]' : ''}`}
          >
            <ArrowBigUp size={18} className={userVote === 'down' ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Comments */}
        <Link
          href={`/community/${safeCommunity}/post/${id}`}
          className="flex items-center gap-1.5 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors"
        >
          <MessageSquare size={16} />
          <span>{safeComments} Comments</span>
        </Link>

        {/* Share */}
        <button className="flex items-center gap-1.5 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}