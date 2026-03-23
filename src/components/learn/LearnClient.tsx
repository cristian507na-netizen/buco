"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Module, TOTAL_CHAPTERS } from "@/lib/learn-content";
import { GraduationCap, Sparkles, ChevronRight, BookOpen, CheckCircle2, Lock, RefreshCw } from "lucide-react";

interface Props {
  modules: Module[];
  totalChapters: number;
  completedChapterIds: string[];
  userData: {
    expensesByCategory: Record<string, number>;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: number;
    creditCards: any[];
    bankAccounts: any[];
    goals: any[];
    userName: string;
  };
}

export default function LearnClient({ modules, totalChapters, completedChapterIds, userData }: Props) {
  const [insight, setInsight] = useState<{ insight: string; recommendedModule: number; moduleTitle: string } | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const completedSet = new Set(completedChapterIds);
  const totalCompleted = completedChapterIds.length;
  const overallProgress = Math.round((totalCompleted / totalChapters) * 100);

  const fetchInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch("/api/learn/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expensesByCategory: userData.expensesByCategory,
          totalIncome: userData.totalIncome,
          totalExpenses: userData.totalExpenses,
          savingsRate: userData.savingsRate,
          activeGoals: userData.goals.length,
          creditCards: userData.creditCards.length,
        }),
      });
      if (res.ok) setInsight(await res.json());
    } catch {
      // silently fail
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24 lg:pb-12 text-[var(--text-primary)] page-transition">
      {/* HERO */}
      <div
        className="section-hero min-h-[160px] py-8 px-6 relative"
        style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: "hidden" }}
      >
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-1 bg-white/30 rounded-full" />
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-[1.5px]">Biblioteca Financiera</span>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-white leading-none">Buco Aprende 🎓</h1>
          <p className="text-white/80 font-medium text-[13px]">Educación financiera basada en tus datos reales.</p>

          {/* Progreso general */}
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-white/70 font-bold mb-1.5">
              <span>{totalCompleted} de {totalChapters} lecciones completadas</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* INSIGHT PERSONALIZADO */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Insight Personalizado</span>
            </div>
            {insight && !loadingInsight && (
              <button
                onClick={fetchInsight}
                className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
                title="Regenerar"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white/70" />
              </button>
            )}
          </div>

          {loadingInsight ? (
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded animate-pulse w-full" />
              <div className="h-4 bg-white/20 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-white/20 rounded animate-pulse w-1/2 mt-1" />
            </div>
          ) : insight ? (
            <>
              <p className="text-sm font-medium leading-relaxed mb-4">{insight.insight}</p>
              <Link
                href={`/learn/${modules.find(m => m.id === `m${insight.recommendedModule}`)?.slug || ""}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all"
              >
                Ir al Módulo {insight.recommendedModule}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-white/70 leading-relaxed">
                Genera un análisis personalizado basado en tus datos financieros reales.
              </p>
              <button
                onClick={fetchInsight}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generar
              </button>
            </div>
          )}
        </div>

        {/* BANNER FREE */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            ✨ Los 6 módulos actuales son completamente gratis. Los nuevos módulos requerirán plan Premium o Pro.
          </p>
        </div>

        {/* GRID DE MÓDULOS */}
        <section>
          <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight mb-4">Módulos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod) => {
              const completedInModule = mod.chapters.filter((c) => completedSet.has(c.id)).length;
              const moduleProgress = Math.round((completedInModule / mod.chapters.length) * 100);
              const isLocked = mod.minPlan !== "free";
              const status: "locked" | "done" | "in_progress" | "not_started" =
                isLocked ? "locked" :
                moduleProgress === 100 ? "done" :
                moduleProgress > 0 ? "in_progress" : "not_started";

              return (
                <Link
                  key={mod.id}
                  href={isLocked ? "#" : `/learn/${mod.slug}`}
                  className={cn("group block rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm hover:shadow-md transition-all", isLocked && "opacity-60 cursor-not-allowed")}
                >
                  {/* Gradient top strip */}
                  <div className={cn("h-2 w-full bg-gradient-to-r", mod.gradient)} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{mod.icon}</span>
                      {status === "locked" ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[9px] font-black uppercase text-gray-500">
                          <Lock className="w-2.5 h-2.5" />Premium
                        </span>
                      ) : status === "done" ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-[9px] font-black uppercase text-emerald-600">
                          <CheckCircle2 className="w-2.5 h-2.5" />Completado
                        </span>
                      ) : status === "in_progress" ? (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-[9px] font-black uppercase text-blue-600">{moduleProgress}%</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[9px] font-black uppercase text-gray-500">Sin empezar</span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-[var(--text-primary)] mb-1 group-hover:text-primary transition-colors">{mod.title}</h3>
                    <p className="text-[11px] text-[var(--text-muted)] mb-4 line-clamp-2">{mod.description}</p>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-bold mb-1">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{completedInModule}/{mod.chapters.length} capítulos</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", mod.gradient)}
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
