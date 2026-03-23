"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  RefreshCw,
  ShoppingBag,
  Calendar,
  Target,
  Lock,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  trend: TrendingUp,
  warning: AlertCircle,
  success: CheckCircle2,
  spending: Zap,
  goal: Target,
  shopping: ShoppingBag,
  calendar: Calendar,
};

const PLAN_LIMITS: Record<string, number> = {
  free: 0,
  premium: 3,
  pro: 999,
};

interface AIInsightsProps {
  data: any;
  bankAccounts: any[];
  creditCards: any[];
  profile: { plan: string; ai_reports_used: number } | null;
}

export default function AIInsights({ data, bankAccounts, creditCards, profile }: AIInsightsProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = profile?.plan || "free";
  const used = profile?.ai_reports_used || 0;
  const limit = PLAN_LIMITS[plan];
  const remaining = Math.max(0, limit - used);
  const isFree = plan === "free";
  const isLimitReached = !isFree && remaining <= 0;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: "Reporte Actual", data, bankAccounts, creditCards }),
      });
      const result = await res.json();

      if (result.error === "LIMIT_REACHED") {
        setError(result.message);
        return;
      }
      if (result.error) {
        setError("Error al generar el análisis. Intenta de nuevo.");
        return;
      }

      setInsights(result.insights || []);
      setGenerated(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "20px" }}
      className="p-6 md:p-8 shadow-sm relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-blue-500 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[var(--text-primary)] leading-none italic uppercase">
              Análisis de Buco AI
            </h3>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">
              Insights inteligentes y accionables
            </p>
          </div>
        </div>

        {/* Plan badge */}
        {!isFree && (
          <div className={cn(
            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
            plan === "pro"
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          )}>
            {plan === "pro" ? "♾️ Ilimitado" : `${remaining}/${limit} restantes`}
          </div>
        )}
      </div>

      {/* FREE WALL */}
      {isFree && (
        <div className="rounded-2xl border-2 border-dashed border-blue-500/20 bg-blue-500/5 p-8 flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">
              Función exclusiva Premium / Pro
            </p>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-sm">
              Obtén análisis profundos con IA sobre tus hábitos financieros, tendencias y recomendaciones personalizadas.
            </p>
          </div>
          <div className="flex gap-3 mt-1">
            <div className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Premium</p>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">3 análisis/mes</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-center">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1 justify-center">
                <Crown className="w-3 h-3" /> Pro
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">Ilimitados</p>
            </div>
          </div>
        </div>
      )}

      {/* LIMIT REACHED */}
      {!isFree && isLimitReached && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-[var(--text-primary)]">Límite mensual alcanzado</p>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
              {plan === "premium"
                ? "Has usado tus 3 análisis de este mes. Mejora a Pro para análisis ilimitados."
                : "Has alcanzado el límite de análisis de este mes."}
            </p>
          </div>
        </div>
      )}

      {/* GENERATE BUTTON — visible when not free, not limit reached, not yet generated */}
      {!isFree && !isLimitReached && !generated && !loading && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
              Listo para analizar tus finanzas
            </p>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
              {plan === "premium"
                ? `Usarás 1 de tus ${remaining} análisis disponibles este mes.`
                : "Análisis ilimitado con tu plan Pro."}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="h-12 px-8 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Generar Análisis IA
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 animate-pulse">
            <Sparkles className="w-7 h-7 text-blue-500 animate-spin" style={{ animationDuration: "2s" }} />
          </div>
          <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
            Analizando tus finanzas...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[var(--bg-secondary)] animate-pulse rounded-2xl border border-[var(--border-color)]" />
            ))}
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 mt-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-400">{error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {generated && !loading && insights.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertCircle className="w-8 h-8 text-[var(--text-muted)]" />
          <p className="text-sm font-bold text-[var(--text-muted)]">No se pudieron generar insights. Intenta de nuevo.</p>
          <button
            onClick={handleGenerate}
            className="h-9 px-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-blue-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500/10 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {/* RESULTS */}
      {generated && !loading && insights.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
            {insights.map((insight, idx) => {
              const Icon = ICON_MAP[insight.type] || Zap;
              return (
                <div
                  key={idx}
                  className="bg-[var(--bg-secondary)] p-5 rounded-[1.5rem] border border-[var(--border-color)] flex items-start gap-4 hover:border-blue-500/30 transition-all"
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    insight.sentiment === "positive"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : insight.sentiment === "negative"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">{insight.text}</p>
                    {insight.action && (
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{insight.action}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Regenerate button */}
          {!isLimitReached && (
            <div className="flex justify-end mt-5">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="h-9 px-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-blue-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500/10 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
