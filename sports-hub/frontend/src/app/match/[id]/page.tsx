"use client";

import { API } from "@/lib/api";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, PieChart, Activity, Zap, Send } from "lucide-react";
import Link from "next/link";

export default function MatchPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("Chat");
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [match, setMatch] = useState<any>(null);

  // ✅ Fetch match
  useEffect(() => {
    async function fetchMatch() {
      const res = await fetch(`${API}/matches/${params.id}`);
      const data = await res.json();
      setMatch(data);
    }
    fetchMatch();
  }, [params.id]);

  // ✅ WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`wss://sportshub-hjro.onrender.com/ws/match/${params.id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.onopen = () => {
      console.log("Connected to chat");
    };

    ws.onclose = () => {
      console.log("Disconnected from chat");
    };

    setSocket(ws);

    return () => ws.close();
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

  if (!match) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-8 p-4">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">Back to Matches</span>
      </Link>

      {/* Scoreboard */}
      <div className="glass rounded-2xl p-6 md:p-10 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">{match.team1}</h2>
          <div className="text-4xl font-mono">
            {match.score_team1} - {match.score_team2}
          </div>
          <h2 className="text-3xl font-bold">{match.team2}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-6">
        {["Chat", "Stats", "Predictions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "text-white border-b-2 border-orange-500 pb-2" : "text-slate-500"}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CHAT */}
      {activeTab === "Chat" && (
        <div className="glass rounded-xl flex flex-col h-[500px]">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className="font-bold text-blue-400 mr-2">
                  {msg.user}
                </span>
                <span className="text-slate-300">{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Say something..."
              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm"
            />
            <button className="bg-[#ff6b00] text-white p-2 rounded-lg">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}