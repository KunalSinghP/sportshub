import Link from "next/link";
import { ArrowBigUp, MessageSquare, Share2, MoreHorizontal } from "lucide-react";

interface PostCardProps {
  id: number;
  title: string;
  content: string;
  authorName: string;
  communityName: string;
  upvotes: number;
  commentCount: number;
  timeAgo: string;
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
  return (
    <div className="glass rounded-xl p-4 transition-colors hover:border-white/10 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs">
          <Link href={`/community/${communityName.toLowerCase().replace(' ', '-')}`} className="font-bold text-white hover:underline">
            p/{communityName}
          </Link>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">Posted by u/{authorName}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">{timeAgo}</span>
        </div>
        <button className="text-slate-500 hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Content */}
      <Link href={`/community/${communityName.toLowerCase().replace(' ', '-')}/post/${id}`} className="block mb-3">
        <h3 className="text-lg font-bold text-slate-100 mb-1 leading-tight group-hover:text-[#ff6b00] transition-colors">{title}</h3>
        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
          {content}
        </p>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mt-2">
        <div className="flex items-center bg-white/5 rounded-full border border-white/5">
          <button className="p-1.5 hover:bg-white/10 rounded-l-full hover:text-[#ff6b00] transition-colors">
            <ArrowBigUp size={18} />
          </button>
          <span className="px-1 text-white">{upvotes}</span>
          <button className="p-1.5 hover:bg-white/10 rounded-r-full hover:text-[#ff6b00] transition-colors rotate-180">
            <ArrowBigUp size={18} />
          </button>
        </div>
        
        <Link href={`/community/${communityName.toLowerCase().replace(' ', '-')}/post/${id}`} className="flex items-center gap-1.5 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
          <MessageSquare size={16} />
          <span>{commentCount} Comments</span>
        </Link>

        <button className="flex items-center gap-1.5 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
