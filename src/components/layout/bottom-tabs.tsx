"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  PieChart,
  Bot,
} from "lucide-react";

// For mobile we usually show a reduced set of critical tabs
const navigation = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Gastos", href: "/expenses", icon: Receipt },
  { name: "Tarjetas", href: "/cards", icon: CreditCard },
  { name: "Ppto", href: "/budget", icon: PieChart },
  { name: "IA", href: "/ai", icon: Bot },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-surface border-t border-border lg:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="inline-flex flex-col items-center justify-center px-2 hover:bg-white/5 transition-colors"
            >
              <item.icon
                className={cn(
                  "w-6 h-6 mb-1",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive ? "text-primary" : "text-gray-400"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
