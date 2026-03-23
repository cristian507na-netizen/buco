"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, Rocket, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "Gratis",
    description: "Para empezar a organizar tus gastos.",
    icon: Zap,
    features: [
      "Registro manual ilimitado",
      "Gráficos básicos de flujo",
      "Control de presupuestos",
      "Acceso a academia financiera",
    ],
    color: "var(--text-muted)",
    bg: "rgba(148, 163, 184, 0.05)",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99/mes",
    description: "Analítica avanzada con Inteligencia Artificial.",
    icon: Sparkles,
    features: [
      "Todo en plan Free",
      "Exportación completa a PDF",
      "WhatsApp: Registro inteligente",
      "Reportes de IA (5/mes)",
      "Chatbot AI dedicado (30 msgs)",
      "Sincronización bancaria básica",
    ],
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.08)",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99/mes",
    description: "Poder total para tu prosperidad financiera.",
    icon: Rocket,
    features: [
      "Todo en plan Premium",
      "Reportes de IA ilimitados",
      "Chatbot AI ilimitado",
      "Sincronización bancaria avanzada",
      "Sugerencias proactivas de ahorro",
      "Exportación avanzada (CSV, PDF, Excel)",
    ],
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.08)",
  },
];

export function PricingCards({ currentPlan }: { currentPlan: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: any) => {
    if (plan.id === 'free' || plan.id === currentPlan) return;
    
    alert("Próximamente: Las suscripciones Premium y Pro estarán disponibles pronto. Por ahora, disfruta del plan Gratuito.");
    return;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PLANS.map((plan) => {
        const Icon = plan.icon;
        const isCurrent = plan.id === currentPlan;

        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col p-8 rounded-[40px] border transition-all duration-300",
              plan.popular ? "border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10" : "border-[var(--border-color)]",
              "bg-[var(--bg-card)] hover:-translate-y-2"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-500 rounded-full">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Lo más popular</span>
              </div>
            )}

            <div className="mb-8 flex items-start justify-between">
              <div
                className="h-14 w-14 rounded-[20px] flex items-center justify-center"
                style={{ background: plan.bg }}
              >
                <Icon className="w-8 h-8" style={{ color: plan.color }} />
              </div>
              <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter italic">
                {plan.price}
              </p>
            </div>

            <div className="mb-10">
              <h3 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight italic mb-2">
                {plan.name}
              </h3>
              <p className="text-xs font-bold text-[var(--text-muted)] opacity-60">
                {plan.description}
              </p>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                     <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] opacity-80 uppercase tracking-widest">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={loading !== null || isCurrent || plan.id === 'free'}
              className={cn(
                "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 px-6",
                isCurrent
                  ? "bg-emerald-500/20 text-emerald-500 cursor-default"
                  : plan.id === 'free'
                    ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] opacity-50 cursor-default"
                    : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-500/20"
              )}
            >
              {loading === plan.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isCurrent ? (
                "Tu plan actual"
              ) : (
                "Empezar ahora"
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
