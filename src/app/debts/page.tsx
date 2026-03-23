import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Plus, Target, Rocket, Landmark, User, Wallet, TrendingDown, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function DebtsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', user.id)
    .eq('activa', true)
    .order('monto_total', { ascending: false });

  const totalOutstanding = debts?.reduce((acc: number, d: any) => acc + (Number(d.monto_total) - Number(d.monto_pagado)), 0) || 0;
  const totalOriginal = debts?.reduce((acc: number, d: any) => acc + Number(d.monto_total), 0) || 0;
  const globalProgress = totalOriginal > 0 ? Math.round(( (totalOriginal - totalOutstanding) / totalOriginal) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🚀 Vibrant Header */}
      <div className="vibrant-header pt-8 pb-32 px-6 relative">
        <div className="max-w-7xl mx-auto w-full">
           <div className="flex items-center justify-between mb-8">
              <Link href="/" className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 transition-all">
                 <ArrowRight className="w-5 h-5 text-white rotate-180" />
              </Link>
              <h1 className="text-white font-bold text-lg">Control de Deudas</h1>
              <div className="flex items-center gap-2">
                 <button className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 transition-all">
                    <Plus className="w-5 h-5 text-white" />
                 </button>
              </div>
           </div>

           <div className="flex flex-col items-center text-center">
              <span className="text-white/70 text-sm font-medium mb-1 uppercase tracking-widest">Deuda Pendiente Total</span>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                 ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <div className="mt-6 w-full max-w-sm">
                 <div className="flex justify-between text-[10px] text-white/50 font-black uppercase tracking-widest mb-2">
                    <span>Progreso Global</span>
                    <span>{globalProgress}% Pagado</span>
                 </div>
                 <div className="h-3 w-full bg-white/10 rounded-full border border-white/10 overflow-hidden backdrop-blur-md">
                    <div 
                       className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                       style={{ width: `${globalProgress}%` }}
                    ></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 📊 Overlapping Content */}
      <div className="px-6 -mt-16 z-20 max-w-7xl mx-auto w-full space-y-8 pb-20">
         
         {(!debts || debts.length === 0) ? (
            <div className="buco-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
               <ShieldCheck className="w-16 h-16 text-primary mb-4 opacity-50" />
               <h3 className="text-white font-bold text-xl mb-2">¡Felicidades! Estás libre de deudas</h3>
               <p className="text-gray-500 text-sm max-w-xs mx-auto">Sigue así y utiliza Buco para no volver a caer en deudas innecesarias.</p>
            </div>
         ) : (
            <>
               {/* 🚀 Strategy / Accelerator Card */}
               <div className="buco-card p-6 bg-primary/10 border-primary/20 relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110">
                     <Rocket size={180} className="text-primary" />
                  </div>
                  <div className="flex items-start gap-5 relative z-10">
                     <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner shrink-0">
                        <Rocket className="w-8 h-8" />
                     </div>
                     <div>
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-1 italic">Estrategia Buco Inteligente</h3>
                        <p className="text-white text-base leading-snug font-medium max-w-md">
                           Si pagas <span className="text-primary font-black">$150 extra</span> a tu deuda más pequeña, quedarás libre <span className="text-primary font-black text-lg">7 meses antes</span> de lo previsto.
                        </p>
                        <button className="mt-4 text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                           Ver plan detallado <ArrowRight className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Debt Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {debts.map((debt: any) => {
                     const remaining = Number(debt.monto_total) - Number(debt.monto_pagado);
                     const progress = Math.round((Number(debt.monto_pagado) / Number(debt.monto_total)) * 100);
                     
                     return (
                        <div key={debt.id} className="buco-card p-6 flex flex-col justify-between hover:border-primary/30 transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="h-12 w-12 rounded-2xl bg-surface-dark flex items-center justify-center border border-border group-hover:border-primary/20 transition-all">
                                 {debt.tipo === 'banco' ? <Landmark className="w-6 h-6 text-gray-400 group-hover:text-primary" /> : <User className="w-6 h-6 text-gray-400 group-hover:text-primary" />}
                              </div>
                              <div className="text-right">
                                 <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{debt.acreedor}</span>
                                 <p className="text-white font-bold text-lg">{debt.nombre_deuda || 'Préstamo'}</p>
                              </div>
                           </div>

                           <div className="mb-6">
                              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Pendiente</span>
                              <h4 className="text-3xl font-black text-white tracking-tighter">${remaining.toLocaleString()}</h4>
                              <p className="text-[10px] text-gray-500 font-medium">Original: ${Number(debt.monto_total).toLocaleString()}</p>
                           </div>

                           <div className="space-y-2">
                              <div className="flex justify-between items-end">
                                 <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Progreso</span>
                                 <span className="text-lg font-black text-primary italic leading-none">{progress}%</span>
                              </div>
                              <div className="h-2 w-full bg-surface-dark rounded-full overflow-hidden border border-border">
                                 <div 
                                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                                    style={{ width: `${progress}%` }}
                                 ></div>
                              </div>
                           </div>

                           <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-4 h-4 text-gray-500" />
                                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Próximo Pago: 15 Oct</span>
                              </div>
                              <button className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all">
                                 <ArrowRight className="w-4 h-4 text-white" />
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </>
         )}

      </div>
    </div>
  );
}
