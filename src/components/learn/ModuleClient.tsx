"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Module } from "@/lib/learn-content";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface Props {
  module: Module;
  completedChapterIds: string[];
}

export default function ModuleClient({ module: mod, completedChapterIds }: Props) {
  const completedSet = new Set(completedChapterIds);
  const completedCount = mod.chapters.filter((c) => completedSet.has(c.id)).length;
  const progress = Math.round((completedCount / mod.chapters.length) * 100);

  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24 lg:pb-12 text-[var(--text-primary)] page-transition">
      {/* HERO */}
      <div
        className="section-hero min-h-[160px] py-8 px-6 relative"
        style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: "hidden" }}
      >
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col gap-4">
          <Link href="/learn" className="flex items-center gap-1.5 text-white/70 text-xs font-bold hover:text-white transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Buco Aprende
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{mod.icon}</span>
            <div>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1">Módulo</p>
              <h1 className="text-[22px] font-black text-white leading-tight">{mod.title}</h1>
              <p className="text-white/70 text-sm mt-1">{mod.description}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-white/70 font-bold mb-1.5">
              <span>Capítulo {completedCount} de {mod.chapters.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full bg-white transition-all duration-700")}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Capítulos</h2>
        <div className="space-y-2">
          {mod.chapters.map((chapter, idx) => {
            const isCompleted = completedSet.has(chapter.id);
            const isNext = !isCompleted && idx > 0 && completedSet.has(mod.chapters[idx - 1]?.id);
            const isFirst = idx === 0;

            return (
              <Link
                key={chapter.id}
                href={`/learn/${mod.slug}/${chapter.slug}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary/30 hover:shadow-sm transition-all"
              >
                {/* Number / check */}
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition-all",
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : (isNext || isFirst)
                    ? "bg-primary text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{idx + 1}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-bold text-sm leading-tight truncate group-hover:text-primary transition-colors",
                    isCompleted ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"
                  )}>
                    {chapter.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                      <Clock className="w-3 h-3" />{chapter.estimatedMinutes} min
                    </span>
                    {chapter.hasAiSection && (
                      <span className="flex items-center gap-1 text-[10px] text-purple-500 font-bold">
                        <Sparkles className="w-3 h-3" />IA personalizada
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-primary transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
