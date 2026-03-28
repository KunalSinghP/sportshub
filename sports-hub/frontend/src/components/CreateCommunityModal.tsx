"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { API } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateCommunityModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("sportsHubToken");
    if (!token) {
      setError("You must be logged in to create a community.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/communities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create community.");
      }

      setIsOpen(false);
      setName("");
      setDescription("");
      router.refresh(); // Refresh the Server Component to show newly created community
    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#ff6b00] hover:bg-[#e05e00] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,107,0,0.3)] whitespace-nowrap"
      >
        <Plus size={18} /> Create Community
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 relative border border-white/10 shadow-2xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-black mb-6">Start a New Hub</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg mb-4 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Community Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">p/</span>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value.replace(/\s+/g, '-'))}
                    placeholder="premier-league"
                    className="w-full bg-[#0b0f19]/80 border border-white/10 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-[#ff6b00] transition-colors text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What is this community about?"
                  className="w-full bg-[#0b0f19]/80 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#ff6b00] transition-colors text-sm resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ff6b00] to-orange-500 hover:to-orange-400 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-[#ff6b00]/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Launch Community"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
