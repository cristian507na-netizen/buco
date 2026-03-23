"use client";

import { Bell } from "lucide-react";
import { NotificationsModal } from "@/components/modals/NotificationsModal";

export function Header({ userId }: { userId?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4 lg:px-8 w-full shrink-0">
      {/* Mobile left side */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <span className="font-bold text-lg">B</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Buco</span>
      </div>

      {/* Desktop left side */}
      <div className="hidden lg:flex items-center gap-4" />

      {/* Right side - Actions */}
      <div className="flex items-center gap-4 ml-auto">

        {userId && (
          <NotificationsModal 
            userId={userId} 
            trigger={
              <button className="relative rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all outline-none cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
            } 
          />
        )}

        {!userId && (
          <button className="relative rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Bell className="h-5 w-5" />
          </button>
        )}

        {/* Mobile Avatar, Desktop handled in sidebar */}
        <div className="lg:hidden h-8 w-8 overflow-hidden rounded-full bg-surface border border-border">
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Carlos"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
