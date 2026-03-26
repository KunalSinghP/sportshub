"use client";

import { useState } from "react";
import { API } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, CheckCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Registration failed.");
      }

      // Registration is successful! Let's immediately log them in
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const loginRes = await fetch(`${API}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem("sportsHubToken", loginData.access_token);
        localStorage.setItem("chatUsername", username);
        router.push("/profile");
      } else {
        // Fallback if instant login fails
        router.push("/login"); 
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Aesthetic Background Glow */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ff6b00]/20 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Join the Action</h1>
          <p className="text-slate-400 text-sm">Create an account to start predicting</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center shadow-lg shadow-red-500/10 transition-all">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Create Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="RookieBettor99"
                className="w-full bg-[#0b0f19]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#ff6b00] transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b0f19]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#ff6b00] transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative">
              <CheckCircle className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-slate-500'}`} size={18} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b0f19]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#ff6b00] transition-colors shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#ff6b00] to-orange-500 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#ff6b00]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8">
          Already a pro?{" "}
          <Link href="/login" className="text-[#ff6b00] font-bold hover:underline transition-all">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
