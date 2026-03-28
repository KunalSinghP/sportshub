"use client";
import { API } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MessageSquare, PieChart, Activity, Zap, Send } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MatchPage({ params }: { params: any }) {
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve(params).then((p) => setMatchId(p?.id));
  }, [params]);

  const [activeTab, setActiveTab] = useState("Chat");
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState("🟡 Connecting...");
  const [msgInput, setMsgInput] = useState("");
  const [username, setUsername] = useState("Guest");
  const myMessages = useRef<Set<string>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let storedName = localStorage.getItem("chatUsername");
    if (!storedName) {
      storedName = prompt("Enter your chat username:") || `User${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("chatUsername", storedName);
    }
    setUsername(storedName);

    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = `uid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("userId", storedUserId);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const [match, setMatch] = useState<any>(null);
  const [predictedTeam, setPredictedTeam] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    const token = localStorage.getItem("sportsHubToken");
    if (!token) return;

    async function fetchUserPrediction() {
      try {
        const res = await fetch(`${API}/predictions/${matchId}/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPredictedTeam(data.predicted_winner);
        }
      } catch (err) {
        console.error("Failed to fetch user prediction", err);
      }
    }
    fetchUserPrediction();
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    async function fetchMatch() {
      const res = await fetch(`${API}/matches/${matchId}`);
      const data = await res.json();
      setMatch(data);
    }

    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    let ws: WebSocket | null = null;
    const currentUsername = localStorage.getItem("chatUsername") || "Guest";

    async function initChat() {
      setWsStatus("🟡 Loading History...");
      try {
        const res = await fetch(`${API}/matches/${matchId}/messages`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMessages(data.map((msg: any) => ({
              id: msg.id,
              user: msg.username,
              text: msg.text
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }

      setWsStatus("🟡 Connecting...");
      const wsUrl = API.replace(/^http/, 'ws');
      ws = new WebSocket(`${wsUrl}/ws/match/${matchId}`);

      ws.onopen = () => {
        console.log("✅ WS connected");
        setWsStatus("🟢 Connected");
        
        // Broadcast join message to everyone
        ws?.send(`System: ${currentUsername} joined the match`);
      };

      ws.onmessage = (event) => {
        if (myMessages.current.has(event.data)) {
          myMessages.current.delete(event.data);
          return; // Skip our own message since we optimistically added it
        }

        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "score_update") {
            setMatch((prev: any) => prev ? { ...prev, score_team1: parsed.score1, score_team2: parsed.score2 } : prev);
            return;
          }
        } catch (e) {
          // It's a plain text chat message, proceed below
        }

        const receivedText = event.data;
        const splitIndex = receivedText.indexOf(":");
        const messageUser = splitIndex > -1 ? receivedText.substring(0, splitIndex) : "User";
        const messageText = splitIndex > -1 ? receivedText.substring(splitIndex + 1).trim() : receivedText;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            user: messageUser,
            text: messageText
          }
        ]);
      };

      ws.onerror = (err) => {
        console.error("WS error:", err);
        setWsStatus("🔴 Error connecting");
      };

      ws.onclose = () => {
        console.log("WS closed");
        setWsStatus("⚪ Disconnected");
      };

      setSocket(ws);
    }

    initChat();

    return () => {
      ws?.close();
    };
  }, [matchId]);
  
  // AI Probabilities Mock
  const probTeam1 = 65;
  const probTeam2 = 35;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    if (socket && socket.readyState === WebSocket.OPEN) {
      const fullMessage = `${username}: ${msgInput}`;
      myMessages.current.add(fullMessage); // Track that we sent this
      socket.send(fullMessage); // ✅ FIXED (NO JSON)

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), user: "You", text: msgInput }
      ]);
      setMsgInput("");
    } else {
      alert(`Cannot send message. WebSocket is currently: ${wsStatus}`);
    }
  };

  const handlePredict = async (team: string) => {
    if (!matchId) return;
    
    const token = localStorage.getItem("sportsHubToken");
    if (!token) {
      alert("You must be logged in to make a live prediction!");
      return;
    }
    
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          match_id: parseInt(matchId),
          user_id: "secured", // Backend overrides this securely
          username: username,
          predicted_winner: team
        })
      });
      if (res.ok) {
        setPredictedTeam(team);
        alert(`Successfully locked in: ${team}! Checked your profile.`);
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.detail || "Failed to successfully lock prediction.");
      }
    } catch (err) {
      console.error(err);
      alert("Error predicting winner.");
    }
  };
  
  if (!match) return <LoadingSpinner message="Loading Match..." />;
  return (
    <div className="max-w-5xl mx-auto pb-8 p-4">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">Back to Matches</span>
      </Link>

      {/* Match Header Scoreboard */}
      <div className="glass rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden">
        {/* Dynamic Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#ff6b00]/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{match.team1}</h2>
            <p className="text-slate-400">Home</p>
          </div>
          
          <div className="flex flex-col items-center px-8">
            <div className="flex items-center gap-4 text-4xl md:text-6xl font-black font-mono tracking-tighter mb-2">
              <span>{match.score_team1}</span>
              <span className="text-slate-600">-</span>
              <span>{match.score_team2}</span>
            </div>
            <div className="flex items-center gap-2 text-red-500 font-bold text-sm bg-red-500/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {match.status?.toUpperCase()}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{match.team2}</h2>
            <p className="text-slate-400">Away</p>
          </div>
        </div>
      </div>

      {/* AI Win Probability Bar */}
      <div className="glass rounded-xl p-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-[#ff6b00] font-bold">
            <Zap size={18} />
            <span>AI Win Probability</span>
          </div>
          <span className="text-xs text-slate-400">Live Updating</span>
        </div>
        
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
          <div style={{ width: `${probTeam1}%` }} className="bg-blue-500 transition-all duration-1000 relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold">{match.team1?.substring(0,3).toUpperCase()} {probTeam1}%</span>
          </div>
          <div style={{ width: `${probTeam2}%` }} className="bg-red-500 transition-all duration-1000 relative">
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold">{match.team2?.substring(0,3).toUpperCase()} {probTeam2}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content (Tabs) */}
        <div className="flex-[2] min-w-0">
          <div className="flex gap-4 border-b border-white/10 mb-6 overflow-x-auto hide-scroll">
            {[
              { id: "Chat", icon: MessageSquare },
              { id: "Stats", icon: Activity },
              { id: "Predictions", icon: PieChart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Icon size={16} />
                  {tab.id}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b00] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="glass-accent rounded-xl p-1 mb-6">
            <div className="bg-[#141a2b] rounded-lg p-5">
              <h3 className="font-bold text-[#ff6b00] mb-2 flex items-center gap-2">
                <Zap size={16} /> AI Match Analyst Insight
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Based on the pitch report and historical data, the home team holds a slight advantage chasing. Their spinners have consistently restricted runs in the middle overs. The AI predicts a high-scoring thriller.
              </p>
            </div>
          </div>

          {activeTab === "Chat" && (
            <div className="glass rounded-xl flex flex-col h-[500px]">
              <div className="p-4 border-b border-white/5 font-bold flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} /> Live Match Chat
                </div>
                <div className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full">
                  {wsStatus}
                </div>
              </div>
              
              {/* Messages Area */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="text-sm">
                    {msg.user !== "System" && (
                      <span className={`font-bold mr-2 ${msg.user === "You" ? "text-[#ff6b00]" : "text-blue-400"}`}>
                        {msg.user}
                      </span>
                    )}
                    <span className={msg.user === "System" ? "text-green-500/80 italic" : "text-slate-300"}>
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder="Say something in live chat..."
                  className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ff6b00] transition-colors"
                />
                <button 
                  type="submit"
                  className="bg-[#ff6b00] hover:bg-[#e05e00] text-white p-2 w-10 h-10 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                  disabled={!msgInput.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {activeTab === "Predictions" && (
            <div className="glass rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">
                {predictedTeam ? `You predicted: ${predictedTeam}` : "Who will win?"}
              </h3>
              <p className="text-slate-400 mb-8">
                {predictedTeam 
                  ? "Your prediction is locked! Wait for the match to end to see the results."
                  : "Cast your vote to climb the global leaderboard!"}
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => handlePredict(match.team1)}
                  disabled={!!predictedTeam}
                  className={`flex-1 border p-4 rounded-xl font-bold text-lg transition-all 
                    ${predictedTeam === match.team1 
                      ? "bg-blue-500/20 border-blue-500 text-blue-400 opacity-100" 
                      : predictedTeam 
                        ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                        : "bg-white/5 hover:bg-white/10 border-white/10 hover:scale-105 hover:border-blue-500"}`}>
                  {match.team1}
                </button>
                <button 
                  onClick={() => handlePredict("Tie")}
                  disabled={!!predictedTeam}
                  className={`flex-1 border p-4 rounded-xl font-bold text-lg transition-all 
                    ${predictedTeam === "Tie" 
                      ? "bg-slate-500/20 border-slate-500 text-slate-400 opacity-100" 
                      : predictedTeam 
                        ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                        : "bg-white/5 hover:bg-white/10 border-white/10 hover:scale-105 hover:border-slate-500"}`}>
                  Tie
                </button>
                <button 
                  onClick={() => handlePredict(match.team2)}
                  disabled={!!predictedTeam}
                  className={`flex-1 border p-4 rounded-xl font-bold text-lg transition-all 
                    ${predictedTeam === match.team2 
                      ? "bg-red-500/20 border-red-500 text-red-400 opacity-100" 
                      : predictedTeam 
                        ? "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                        : "bg-white/5 hover:bg-white/10 border-white/10 hover:scale-105 hover:border-red-500"}`}>
                  {match.team2}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex-1 space-y-6">
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-4">Match Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Tournament</span>
                <span className="font-semibold">Indian Premier League</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Venue</span>
                <span className="font-semibold">Wankhede Stadium</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Umpire</span>
                <span className="font-semibold">Nitin Menon</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
