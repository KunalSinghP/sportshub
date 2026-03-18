"use client";

import Link from "next/link";
import { Home, Users, Trophy, User, Search, Activity } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/communities", label: "Communities", icon: Users },
    { href: "/matches", label: "Matches", icon: Activity },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:flex sticky top-0 z-50 glass w-full h-16 items-center px-6 justify-between border-b border-white/5">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="text-[#ff6b00]" size={28} />
            <span className="text-xl font-bold tracking-tight text-white">
              Sports<span className="text-[#ff6b00]">Hub</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-[#ff6b00]" : ""} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#141a2b] border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm w-64 focus:outline-none focus:border-[#ff6b00] transition-colors"
            />
          </div>
          <button className="flex items-center justify-center h-8 w-8 rounded-full bg-[#141a2b] border border-white/10 hover:border-[#ff6b00] transition-colors">
            <User size={16} />
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 w-full glass z-50 border-t border-white/5 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-[#ff6b00]" : "text-slate-400"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400">
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}
