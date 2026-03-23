import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Plus, Settings, AlertTriangle, PieChart, ArrowRight, TrendingUp, TrendingDown, Info } from 'lucide-react';
import Link from 'next/link';
import { CurrencyDisplay } from '@/components/ui/currency-display';

const categoryEmoji: Record<string, string> = {
  comida: '🍔',
  transporte: '🚗',
  salud: '🏥',
  ocio: '🍿',
  hogar: '🏠',
  suscripciones: '📺',
  otros: '📦',
};

export default async function BudgetPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Fetch budgets and expenses for the current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [{ data: budgets }, { data: expenses }] = await Promise.all([
    supabase.from('budgets').select('*').eq('user_id', user.id),
    supabase.from('expenses').select('*').eq('user_id', user.id).gte('fecha', firstDayOfMonth)
  ]);

  const categorySpending = expenses?.reduce((acc: Record<string, number>, exp) => {
    const cat = exp.categoria || 'otros';
    acc[cat] = (acc[cat] || 0) + Number(exp.monto);
    return acc;
  }, {}) || {};

  const budgetItems = budgets?.map(b => {
    const spent = categorySpending[b.categoria] || 0;
    const limit = Number(b.limite_mensual);
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    return { ...b, spent, percentage };
  }) || [];

  const totalBudget = budgetItems.reduce((acc, b) => acc + Number(b.limite_mensual), 0);
  const totalSpent = Object.values(categorySpending).reduce((acc, s) => acc + s, 0);
  const globalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  
  const alerts = budgetItems.filter(b => b.percentage >= 85);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (globalPercentage / 100) * circumference;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 🚀 Vibrant Header */}
      <div className="vibrant-header pt-8 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto w-full">
           <div className="flex items-center justify-between mb-8">
              <Link href="/" className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 transition-all">
                 <ArrowRight className="w-5 h-5 text-white rotate-180" />
              </Link>
              <h1 className="text-white font-bold text-lg">Mi Presupuesto</h1>
              <div className="flex items-center gap-2">
                 <button className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 transition-all">
                    <Plus className="w-5 h-5 text-white" />
                 </button>
              </div>
           </div>

           <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {/* Circular Global Progress */}
              <div className="relative w-48 h-48 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-white/10" cx="96" cy="96" r={radius} fill="transparent" stroke="currentColor" strokeWidth="12" />
                  <circle 
                    className={`${globalPercentage >= 100 ? 'text-red-400' : globalPercentage >= 85 ? 'text-yellow-400' : 'text-white'} transition-all duration-1000 ease-out`} 
                    cx="96" cy="96" r={radius} 
                    fill="transparent" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={offset} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{globalPercentage}%</span>
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Utilizado</span>
                </div>
              </div>

              <div className="text-center md:text-left space-y-2">
                 <span className="text-white/60 text-xs font-black uppercase tracking-widest italic">Consumo Total Mes</span>
                 <h2 className="text-4xl md:text-5xl font-black text-white leading-none">
                    <CurrencyDisplay amount={totalSpent} />
                 </h2>
                 <p className="text-white/40 text-sm font-medium">De un límite de <span className="text-white font-bold">${totalBudget.toLocaleString()}</span></p>
                 <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md mt-4">
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                    <span className="text-white font-bold text-[10px] uppercase tracking-tighter">Vas 12% mejor que el mes anterior</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 📊 Overlapping Content */}
      <div className="px-6 -mt-20 z-20 max-w-7xl mx-auto w-full space-y-6 pb-20">
         
         {budgetItems.length === 0 ? (
            <div className="buco-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
               <PieChart className="w-16 h-16 text-primary mb-4 opacity-50" />
               <h3 className="text-white font-bold text-xl mb-2">Define tus metas de gasto</h3>
               <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">Crea presupuestos por categoría para que Buco te avise antes de que gastes de más.</p>
               <button className="bg-primary text-white font-black py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
                  Configurar Presupuesto
               </button>
            </div>
         ) : (
            <>
               {/* Critial Alerts Banner */}
               {alerts.length > 0 && (
                  <div className="buco-card p-5 bg-red-400/10 border-red-400/20 flex gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="h-12 w-12 rounded-2xl bg-red-400/20 flex items-center justify-center text-red-500 shrink-0">
                       <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-red-500 font-black text-xs uppercase tracking-widest italic mb-1">Cuidado con el Límite</p>
                       <p className="text-white text-sm leading-snug">
                          Has superado el <span className="font-black text-red-400">85%</span> de tu presupuesto en <span className="font-bold underline uppercase">{alerts[0].categoria}</span>.
                       </p>
                    </div>
                  </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {budgetItems.map((item) => (
                     <div key={item.id} className="buco-card p-6 flex flex-col gap-5 group hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-surface-dark flex items-center justify-center text-2xl border border-border group-hover:border-primary/20 transition-all shadow-inner">
                                 {categoryEmoji[item.categoria] || '📦'}
                              </div>
                              <div>
                                 <h4 className="text-white font-bold capitalize text-lg leading-tight">{item.categoria}</h4>
                                 <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Presupuesto Mensual</span>
                              </div>
                           </div>
                           <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Settings className="w-4 h-4 text-gray-400" />
                           </button>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-baseline">
                              <p className="text-2xl font-black text-white tracking-tighter">
                                 <CurrencyDisplay amount={item.spent} /> <span className="text-gray-600 text-sm font-bold tracking-normal ml-1">/ ${Number(item.limite_mensual).toLocaleString()}</span>
                              </p>
                              <span className={`text-xs font-black italic ${item.percentage >= 85 ? 'text-red-400' : 'text-primary'}`}>
                                 {item.percentage}%
                              </span>
                           </div>
                           <div className="h-2.5 w-full bg-surface-dark rounded-full overflow-hidden border border-border">
                              <div 
                                 className={`h-full rounded-full transition-all duration-1000 ${
                                    item.percentage >= 100 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 
                                    item.percentage >= 85 ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 
                                    'bg-primary shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                                 }`} 
                                 style={{ width: `${Math.min(item.percentage, 100)}%` }}
                              ></div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-2">
                           <span>Disponible: <span className="text-white italic">${Math.max(0, Number(item.limite_mensual) - item.spent).toLocaleString()}</span></span>
                           <Link href={`/expenses?category=${item.categoria}`} className="flex items-center gap-1 text-primary hover:underline">
                              Ver Gastos <ArrowRight className="w-2.5 h-2.5" />
                           </Link>
                        </div>
                     </div>
                  ))}
               </div>
            </>
         )}

         {/* IA Tip */}
         <div className="buco-card p-6 bg-surface-dark border-border/40 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <Info className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
               <span className="text-white font-bold">Tip de IA:</span> El 40% de tus gastos en <span className="text-white underline">Comida</span> son delivery. Podrías ahorrar <span className="text-emerald-400 font-black">$45.00</span> este mes si cocinas más en casa.
            </p>
         </div>

      </div>
    </div>
  );
}

