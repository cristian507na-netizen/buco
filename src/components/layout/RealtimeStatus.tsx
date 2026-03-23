"use client";

import { useRealtime } from "@/hooks/useRealtime";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

export function RealtimeStatus() {
  // We subscribe to any table (e.g., expenses) just to monitor the connection status
  // In a real app, we might want a dedicated 'health' channel or just use one of the existing ones
  const { status } = useRealtime({ table: 'expenses' });

  const isConnected = status === 'SUBSCRIBED';
  const isConnecting = status === 'CONNECTING';
  const isError = status === 'CHANNEL_ERROR' || status === 'TIMED_OUT';

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500",
      isConnected ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
      isConnecting ? "bg-blue-50 border-blue-100 text-blue-600" :
      "bg-red-50 border-red-100 text-red-600"
    )}>
      {isConnecting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isConnected ? (
        <Wifi className="w-3.5 h-3.5" />
      ) : (
        <WifiOff className="w-3.5 h-3.5" />
      )}
      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
        {isConnecting ? "Conectando..." : isConnected ? "En Vivo" : "Desconectado"}
      </span>
      {/* Small dot for mobile */}
      <div className={cn(
        "h-1.5 w-1.5 rounded-full sm:hidden",
        isConnected ? "bg-emerald-500 animate-pulse" :
        isConnecting ? "bg-blue-500 animate-pulse" :
        "bg-red-500"
      )} />
    </div>
  );
}
