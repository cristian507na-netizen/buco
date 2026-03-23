"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button 
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)}
        className={cn(
          "inline-flex items-center justify-center rounded-full p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors outline-none",
          className
        )}
      >
        <Info className="w-3.5 h-3.5" />
        <span className="sr-only">Información</span>
      </button>

      {visible && (
        <div 
          className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl text-[var(--text-primary)] text-[11px] font-medium leading-relaxed pointer-events-none animate-in fade-in zoom-in duration-200"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-top-[var(--bg-card)] mt-[-1px]" />
        </div>
      )}
    </div>
  );
}
