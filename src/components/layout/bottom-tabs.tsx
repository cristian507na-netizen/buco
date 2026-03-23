"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Target,
  GraduationCap,
  Plus,
  CreditCard,
  User,
  BarChart3,
  X
} from "lucide-react";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";

const mainTabs = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Cuentas", href: "/cards", icon: CreditCard },
  { name: "FAB", href: "#", icon: Plus, isFAB: true },
  { name: "Metas", href: "/goals", icon: Target },
  { name: "Perfil", href: "/profile", icon: User },
];

const speedDialItems = [
  { name: "Nuevo Gasto", href: "/expenses", icon: Receipt, color: "bg-orange-500" },
  { name: "Reportes", href: "/reports", icon: BarChart3, color: "bg-blue-500" },
  { name: "Aprende", href: "/learn", icon: GraduationCap, color: "bg-emerald-500" },
];

export function BottomTabs({ userId }: { userId: string }) {
  const pathname = usePathname();
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/welcome";
  if (isAuthPage) return null;

  return (
    <>
      {/* Speed Dial Overlay */}
      {isSpeedDialOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] animate-in fade-in duration-300 md:hidden"
          onClick={() => setIsSpeedDialOpen(false)}
        />
      )}

      {/* Speed Dial Panel */}
      <div className={cn(
        "fixed bottom-[90px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[340px] bg-[rgba(10,15,30,0.85)] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 z-[1001] shadow-3xl md:hidden transition-all duration-300",
        isSpeedDialOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}>
        <div className="grid grid-cols-3 gap-6">
          <NewTransactionModal
            userId={userId}
            trigger={
              <button className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => setIsSpeedDialOpen(false)}>
                <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic text-center leading-tight">Añadir</span>
              </button>
            }
          />
          {speedDialItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setIsSpeedDialOpen(false)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn("h-14 w-14 rounded-2xl text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105", item.color)}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest italic text-center leading-tight">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Navigation Pill */}
      <div className="fixed bottom-[16px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-sm h-[58px] bg-[rgba(10,15,30,0.85)] backdrop-blur-2xl border border-white/10 rounded-full z-[999] flex items-center justify-between px-2.5 shadow-2xl md:hidden mb-[env(safe-area-inset-bottom)]">
        {mainTabs.map((item) => {
          if (item.isFAB) {
            return (
              <button
                key={item.name}
                onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
                className="relative -top-8 h-[52px] w-[52px] rounded-full bg-[#2563EB] text-white shadow-[0_8px_20px_rgba(37,99,235,0.5)] flex items-center justify-center transition-all active:scale-90 border-none outline-none cursor-pointer z-[1002]"
              >
                <div className={cn("transition-transform duration-300", isSpeedDialOpen && "rotate-45")}>
                   {isSpeedDialOpen ? <X className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                </div>
              </button>
            );
          }

          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "h-11 px-4 rounded-full flex items-center justify-center transition-all duration-150 relative",
                isActive ? "bg-[#2563EB]/25 border border-[#2563EB]/40 shadow-inner" : ""
              )}
            >
              <item.icon
                className={cn(
                  "transition-all",
                  isActive ? "w-6 h-6 text-[#2563EB]" : "w-6 h-6 text-white/45"
                )}
              />
            </Link>
          );
        })}
      </div>
    </>
  );
}
