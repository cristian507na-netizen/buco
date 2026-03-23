"use client";

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

export function PlansModal({ isOpen, onClose, currentPlan }: PlansModalProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlanChange = async (planId: string) => {
    if (planId === currentPlan || planId === 'free') return;
    setIsSubmitting(true);
    
    try {
      // Find the price ID for the plan
      const plan = plans.find(p => p.id === planId);
      const priceId = planId === 'pro' 
        ? (billingCycle === 'monthly' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL)
        : (billingCycle === 'monthly' ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_ANNUAL);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: priceId,
          planName: planId,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error al iniciar el pago: " + (data.error || "Desconocido"));
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al procesar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Fundamentos básicos',
      color: 'gray',
      features: [
        'Gastos e ingresos ilimitados',
        'Hasta 4 metas activas',
        'Hasta 5 cuentas/tarjetas',
        'Chat IA en metas: 5 msgs/mes',
        'Reportes básicos',
        'WhatsApp & Telegram'
      ],
      locked: [
        'Análisis IA avanzado',
        'Exportar PDF'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingCycle === 'monthly' ? '$4.99' : '$3.99',
      description: 'Más popular',
      color: 'blue',
      recommended: true,
      features: [
        'Todo lo de Free',
        'Metas ilimitadas',
        'Hasta 10 cuentas/tarjetas',
        'Chat IA en metas: 50 msgs/mes',
        '3 reportes IA al mes',
        'WhatsApp & Telegram',
        'Exportar PDF',
        'Soporte prioritario'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$9.99' : '$7.99',
      description: 'Control total',
      color: 'purple',
      features: [
        'Todo lo de Premium',
        'Tarjetas y cuentas ilimitadas',
        'Chat IA: 500 msgs/mes',
        'Reportes e Insights IA ilimitados',
        'Tendencias y predicciones IA',
        'Exportación Excel/CSV',
        'Soporte VIP 24/7'
      ]
    }
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[var(--bg-card)] rounded-[2rem] shadow-2xl z-[101] p-0 animate-in zoom-in-95 duration-300 focus:outline-none border border-[var(--border-color)]">
          
          {/* Header */}
          <div className="relative p-8 md:p-12 text-center border-b border-[var(--border-color)] flex flex-col items-center">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors border-none bg-transparent cursor-pointer"
            >
              <X className="w-6 h-6 text-[var(--text-muted)]" />
            </button>

            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic leading-none mb-4">
               Impulsa tus <span className="text-blue-500">Finanzas</span>
            </h2>
            <p className="text-[var(--text-muted)] font-bold max-w-md mx-auto mb-8">
               Elige el plan que mejor se adapte a tu estilo de ahorro y control.
            </p>

            {/* Toggle Billing */}
            <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-secondary)] rounded-2xl">
               <button 
                 onClick={() => setBillingCycle('monthly')}
                 className={cn(
                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    billingCycle === 'monthly' ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                 )}
               >
                 Mensual
               </button>
               <button 
                 onClick={() => setBillingCycle('annual')}
                 className={cn(
                   "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
                   billingCycle === 'annual' ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                 )}
               >
                 Anual
                 <span className="absolute -top-3 -right-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">
                   -20%
                 </span>
               </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={cn(
                  "relative flex flex-col p-8 rounded-[2rem] transition-all border-2",
                  plan.recommended 
                    ? "border-blue-600 shadow-2xl shadow-blue-500/10 scale-105 z-10 bg-[var(--bg-card)]" 
                    : "border-[var(--border-color)] bg-[var(--bg-secondary)]/50"
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Mas popular
                  </div>
                )}

                <div className="mb-8">
                  <div className={cn(
                    "flex items-center gap-2 mb-2",
                    plan.color === 'blue' ? "text-blue-600" : plan.color === 'purple' ? "text-purple-600" : "text-gray-400"
                  )}>
                    {plan.id === 'pro' ? <Crown className="w-4 h-4" /> : plan.id === 'premium' ? <Star className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-black tracking-tighter text-[var(--text-primary)]">{plan.price}</span>
                      <span className="text-[var(--text-muted)] font-bold text-sm">/mes</span>
                   </div>
                   {billingCycle === 'annual' && plan.id !== 'free' && (
                     <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Cobrado anualmente</p>
                   )}
                </div>

                <div className="flex-1 space-y-4 mb-10">
                   {plan.features.map((feature, i) => (
                     <div key={i} className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                          plan.color === 'blue' ? "bg-blue-500/10 text-blue-600" : plan.color === 'purple' ? "bg-purple-500/10 text-purple-600" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                        )}>
                           <Check className="w-2.5 h-2.5 font-bold" />
                        </div>
                        <span className="text-xs font-bold text-[var(--text-secondary)] leading-tight">{feature}</span>
                     </div>
                   ))}
                    {plan.locked?.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 opacity-40 grayscale">
                         <div className="mt-0.5 h-4 w-4 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center shrink-0">
                            <X className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                         </div>
                         <span className="text-xs font-bold text-[var(--text-muted)] leading-tight line-through">{feature}</span>
                      </div>
                    ))}
                </div>

                <Button 
                  disabled={currentPlan === plan.id || isSubmitting}
                  onClick={() => handlePlanChange(plan.id)}
                  className={cn(
                    "h-14 w-full rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                    currentPlan === plan.id 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : plan.id === 'pro'
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/20"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                  )}
                >
                  {isSubmitting && currentPlan !== plan.id ? 'Cambiando...' : currentPlan === plan.id ? 'Tu plan actual' : `Empezar ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>

           <div className="bg-[var(--bg-secondary)] p-6 text-center border-t border-[var(--border-color)]">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                 Los créditos de IA se renuevan cada mes. Sin sorpresas, sin cobros ocultos.
              </p>
           </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
