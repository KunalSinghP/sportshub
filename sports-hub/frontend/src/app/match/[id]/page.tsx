"use client";

import { API } from "@/lib/api";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, PieChart, Activity, Zap, Send } from "lucide-react";
import Link from "next/link";

export default function MatchPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("Chat");

  // ✅ NEW chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [msgInput, setMsgInput] = useState("");
  const [match, setMatch] = useState<any>(null);

  // ✅ Fetch match
  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch(`${API}/matches/${params.id}`);
        const data = await res.json();
        setMatch(data);
      } catch (err) {
        console.error("Match fetch error:", err);
      }
    }

    if (params?.id) fetchMatch();
  }, [params.id]);

  // ✅ WebSocket (SAFE)
  useEffect(() => {
    if (!params?.id) return;

    try {
      const ws = new WebSocket(`wss://sportshub-njro.onrender.com/ws/match/${params.id}`);

      ws.onopen = () => console.log("✅ WS connected");

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch {
          console.log("Invalid WS message");
        }
      };

      ws.onerror = (err) => console.error("WS error:", err);
      ws.onclose = () => console.log("WS closed");

      setSocket(ws);

      return () => ws.close();
    } catch (e) {
      console.error("WS failed:", e);
    }
  }, [params.id]);

  // ✅ Send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !socket) return;

    socket.send(
      JSON.stringify({
        user: "You",
        text: msgInput,
      })
    );

    setMsgInput("");
  };

  // ✅ SAFE DATA (IMPORTANT FIX)
  const safeTeam1 = match?.team1 || "Team A";
  const safeTeam2 = match?.team2 || "Team B";
  const safeScore1 = match?.score_team1 ?? 0;
  const safeScore2 = match?.score_team2 ?? 0;
  const safeStatus = (match?.status || "live").toUpperCase();

  const probTeam1 = 65;
  const probTeam2 = 35;

  if (!match) {
    return <div className="p-10 text-center text-slate-400">Loading match...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-8 p-4">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={16} />
        Back to Matches
      </Link>

      {/* ✅ SCOREBOARD FIXED */}
      <div className="glass rounded-2xl p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-3xl font-bold">{safeTeam1}</h2>
          </div>

          <div className="flex flex-col items-center px-8">
            <div className="text-4xl font-black font-mono">
              {safeScore1} - {safeScore2}
            </div>

            <div className="text-red-500 text-sm mt-2">
              {safeStatus}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold">{safeTeam2}</h2>
          </div>
        </div>
      </div>

      {/* AI BAR */}
      <div className="glass rounded-xl p-5 mb-8">
        <div className="flex justify-between mb-3">
          <span className="text-[#ff6b00] font-bold flex items-center gap-2">
            <Zap size={16} /> AI Win Probability
          </span>
        </div>

        <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
          <div style={{ width: `${probTeam1}%` }} className="bg-blue-500" />
          <div style={{ width: `${probTeam2}%` }} className="bg-red-500" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-white/10 mb-6">
        {["Chat", "Stats", "Predictions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab ? "text-white border-b-2 border-[#ff6b00]" : "text-slate-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CHAT */}
      {activeTab === "Chat" && (
        <div className="glass rounded-xl flex flex-col h-[500px]">
          <div className="p-4 border-b text-sm font-bold">Live Match Chat</div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-slate-500 text-sm">No messages yet</div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className="font-bold text-blue-400 mr-2">{msg.user}</span>
                <span className="text-slate-300">{msg.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
            <input
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              className="flex-1 bg-black/20 border rounded px-3 py-2 text-sm"
              placeholder="Say something..."
            />
            <button className="bg-[#ff6b00] px-4 py-2 rounded text-white">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}