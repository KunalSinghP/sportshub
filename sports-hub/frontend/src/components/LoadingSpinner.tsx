import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 w-full p-8">
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border border-[#ff6b00]/20 animate-ping" style={{ animationDuration: '2s' }}></div>
        {/* Middle gradient spinner */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#ff6b00] border-r-orange-400 animate-spin shadow-[0_0_20px_rgba(255,107,0,0.4)]" style={{ animationDuration: '1.5s' }}></div>
        {/* Inner solid ring */}
        <div className="absolute inset-4 rounded-full border border-white/10 bg-[#0b0f19]/80 backdrop-blur-sm"></div>
        {/* Center icon */}
        <Loader2 className="absolute text-white animate-[spin_3s_linear_infinite]" size={20} />
      </div>
      <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b00] to-orange-400 font-black tracking-[0.2em] uppercase text-sm animate-pulse glow-text">
        {message}
      </div>
    </div>
  );
}
