"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Target,
  BarChart3,
  GraduationCap,
  Wallet,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RealtimeStatus } from "./RealtimeStatus";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Gastos", href: "/expenses", icon: Receipt },
  { name: "Cuentas", href: "/cards", icon: CreditCard },
  { name: "Metas", href: "/goals", icon: Target },
  { name: "Reportes", href: "/reports", icon: BarChart3 },
  { name: "Aprende", href: "/learn", icon: GraduationCap },
];

export function Sidebar({ profile }: { profile?: any }) {
  const pathname = usePathname();

  const isPremium = profile?.plan === 'premium';
  const isPro = profile?.plan === 'pro';

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-card)] h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-8 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <span className="text-2xl font-black italic tracking-tighter text-[var(--text-primary)] uppercase">Buco</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] transition-all cursor-pointer group",
                isActive
                  ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-[#2563EB]" : "text-[var(--text-muted)]")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
          {!profile?.plan || profile?.plan === 'free' ? (
            <Link
              href="/billing"
              className="w-full flex items-center justify-center p-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 transition-all group border border-blue-400 shadow-xl shadow-blue-500/20 mb-4"
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic mb-1">Empieza tu plan</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">PREMIUM 🚀</span>
              </div>
            </Link>
          ) : null}
          <Link
            href="/profile"
            className="w-full flex items-center justify-between p-3 rounded-2xl transition-all group hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border-color)]"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-black uppercase italic text-sm overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-sm font-black text-[var(--text-primary)] italic leading-none mb-1 truncate w-full pr-3">
                  {profile?.nombre || 'Usuario'}
                </span>
                {isPro ? (
                  <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-purple-400/30 bg-purple-400/5">
                    PRO 🚀
                  </span>
                ) : isPremium ? (
                  <span className="text-[9px] text-[#93c5fd] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-[#93c5fd]/30 bg-blue-500/5">
                    PREMIUM
                  </span>
                ) : (
                  <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-[var(--border-color)]">
                    FREE
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#2563EB]" />
          </Link>
          <RealtimeStatus />
        </div>
      </div>
    </div>
  );
}
