"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Target,
  PieChart,
  Bot,
  LogOut,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Gastos", href: "/expenses", icon: Receipt },
  { name: "Tarjetas", href: "/cards", icon: CreditCard },
  { name: "Deudas", href: "/debts", icon: Target },
  { name: "Presupuesto", href: "/budget", icon: PieChart },
  { name: "IA Buco", href: "/ai", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden h-screen w-64 flex-col border-r border-border bg-background lg:flex">
      {/* Logo Area */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Buco</span>
        </div>
      </div>

      {/* Primary Action */}
      <div className="px-4 py-6">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors">
          <span className="text-lg">+</span> Agregar gasto
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 xl:flex-col flex-col gap-1 px-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-surface text-primary"
                  : "text-gray-400 hover:bg-surface/50 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-primary" : "text-gray-400 group-hover:text-white"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface transition-colors cursor-pointer">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-surface">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Carlos"
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-white">Carlos</p>
            <p className="truncate text-xs text-gray-500">Mi Cuenta</p>
          </div>
          <Settings className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
