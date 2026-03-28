"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import PostCard from "@/components/PostCard";
import { API } from "@/lib/api";

interface Comment {
  id: number;
  content: string;
  authorName: string;
  timeAgo: string;
}

interface PostDetail {
  id: number;
  title: string;
  content: string;
  communityName: string;
  authorName: string;
  upvotes: number;
  commentCount: number;
  timeAgo: string;
  comments: Comment[];
}

export default function PostDetailPage() {
  const { name, id } = useParams();
  const router = useRouter();
  
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`${API}/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load post");
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const token = localStorage.getItem("sportsHubToken");
    if (!token) {
        alert("You must be logged in to comment.");
        router.push("/login"); // or pop a modal
        return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText.trim() })
      });

      if (!res.ok) throw new Error("Failed to post comment");
      const newComment = await res.json();
      
      // Update local state smoothly
      setPost(prev => prev ? {
          ...prev, 
          commentCount: prev.commentCount + 1,
          comments: [...prev.comments, newComment]
      } : prev);
      setCommentText("");
    } catch (error) {
      console.error(error);
      alert("Error submitting comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 bg-[#000000]">
        <div className="max-w-3xl mx-auto flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#ff6b00] border-t-transparent animate-spin"/>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-12 bg-[#000000]">
        <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
            <Link href={`/community/${name}`} className="text-[#ff6b00] hover:underline">
                Return to Community
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 bg-[#000000]">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Link 
          href={`/community/${name}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to p/{name}</span>
        </Link>
        
        {/* The Main Post Area */}
        <PostCard {...post} />
        
        {/* Comments Section */}
        <div className="glass rounded-xl p-6 border-white/5 space-y-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Comments 
                <span className="bg-white/10 text-slate-300 text-xs py-0.5 px-2 rounded-full">
                    {post.commentCount}
                </span>
            </h2>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex gap-3">
                <textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment... (Markdown not supported yet)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#ff6b00]/50 transition-colors resize-none h-[52px]"
                />
                <button 
                    type="submit"
                    disabled={!commentText.trim() || submitting}
                    className="bg-[#ff6b00] hover:bg-[#ff8533] disabled:opacity-50 disabled:hover:bg-[#ff6b00] text-black w-14 rounded-xl font-bold flex items-center justify-center transition-colors"
                >
                    {submitting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    ) : (
                        <Send size={20} />
                    )}
                </button>
            </form>

            {/* Comment List */}
            <div className="space-y-4 pt-4 border-t border-white/5">
                {post.comments.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Be the first to comment!</p>
                ) : (
                    post.comments.map((comment, index) => (
                        <div key={index} className="flex gap-3">
                            {/* Avatar placeholder */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff6b00] to-orange-400 flex items-center justify-center text-black font-bold text-xs shrink-0">
                                {comment.authorName[0]?.toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-bold text-slate-200 text-sm">{comment.authorName}</span>
                                    <span className="text-slate-500 text-[11px]">{comment.timeAgo}</span>
                                </div>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
