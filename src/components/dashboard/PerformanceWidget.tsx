"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, ChevronDown, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from "@/utils/supabase/client";

const timeRanges = [
  { label: 'Esta Semana', value: 'week' },
  { label: 'Este Mes', value: 'month' },
];

export function PerformanceWidget() {
  const [range, setRange] = useState('week');
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      let startDate = new Date();
      let prevStartDate = new Date();

      if (range === 'week') {
        startDate.setDate(now.getDate() - 7);
        prevStartDate.setDate(now.getDate() - 14);
      } else {
        startDate.setMonth(now.getMonth() - 1);
        prevStartDate.setMonth(now.getMonth() - 2);
      }

      const [
        { data: currentExpenses },
        { data: prevExpenses }
      ] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', user.id).gte('fecha', startDate.toISOString()),
        supabase.from('expenses').select('*').eq('user_id', user.id).gte('fecha', prevStartDate.toISOString()).lt('fecha', startDate.toISOString())
      ]);

      // Simple normalization for the chart (grouped by day of week or week of month)
      const days = range === 'week' ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'] : ['S1', 'S2', 'S3', 'S4'];
      const chartData = days.map((label, idx) => {
        // Mocking grouping logic for now, in real scenario we'd group by date
        const currentBatch = currentExpenses?.slice(idx * 2, (idx + 1) * 2).reduce((acc, e) => acc + Number(e.monto), 0) || Math.random() * 50;
        const prevBatch = prevExpenses?.slice(idx * 2, (idx + 1) * 2).reduce((acc, e) => acc + Number(e.monto), 0) || Math.random() * 50;
        return { label, spent: currentBatch, prev: prevBatch };
      });

      setData(chartData);
      
      const totalCurrent = currentExpenses?.reduce((acc, e) => acc + Number(e.monto), 0) || 0;
      const totalPrev = prevExpenses?.reduce((acc, e) => acc + Number(e.monto), 0) || 0;
      const diff = totalPrev > 0 ? ((totalCurrent - totalPrev) / totalPrev) * 100 : 0;
      
      const topCat = currentExpenses?.reduce((acc: any, e: any) => {
        acc[e.categoria] = (acc[e.categoria] || 0) + Number(e.monto);
        return acc;
      }, {});
      const topCategory = Object.entries(topCat || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Varios';

      setInsights({
        diff: diff.toFixed(1),
        avgDaily: (totalCurrent / (range === 'week' ? 7 : 30)).toFixed(0),
        topCategory
      });
      
      setLoading(false);
    };

    fetchData();
  }, [range]);

  const maxVal = Math.max(...data.map(d => Math.max(d.spent, d.prev)), 1);

  return (
    <div className="buco-card p-6 flex flex-col gap-8 group relative overflow-hidden transition-all border-white/5 hover:border-primary/20 bg-gradient-to-tr from-[#0A0F1E] to-[#030712]">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-primary/10 transition-colors" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-black italic text-xl leading-none mb-1 uppercase tracking-tight">Análisis de Rendimiento</h3>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] italic">Evolución de Gasto vs Periodo Anterior</p>
          </div>
        </div>

        <div className="relative">
           <button 
             onClick={() => setIsOpen(!isOpen)}
             className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3 text-xs text-gray-400 font-bold transition-all hover:text-white"
           >
             <Calendar className="w-4 h-4 text-primary" />
             {timeRanges.find(r => r.value === range)?.label}
             <ChevronDown className={cn("w-4 h-4 transition-transform text-gray-600", isOpen && "rotate-180")} />
           </button>
           
           {isOpen && (
             <div className="absolute top-full right-0 mt-2 w-48 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {timeRanges.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => { setRange(r.value); setIsOpen(false); }}
                    className={cn(
                      "w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:bg-white/5",
                      range === r.value ? "text-primary bg-primary/5" : "text-gray-500"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 h-48 pt-6 relative">
        {/* Grid lines background */}
        <div className="absolute inset-x-0 bottom-6 top-6 flex flex-col justify-between opacity-20 pointer-events-none">
           <div className="border-t border-gray-600 w-full" />
           <div className="border-t border-gray-600 w-full" />
           <div className="border-t border-gray-600 w-full" />
        </div>

        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar h-full justify-end relative z-10">
            <div className="w-full flex justify-center gap-1.5 items-end h-full">
               {/* Previous Period Bar */}
               <div 
                  className="w-2 bg-white/5 rounded-t-full transition-all duration-700"
                  style={{ height: `${(d.prev / maxVal) * 100}%` }}
               />
               {/* Current Period Bar */}
               <div 
                  className={cn(
                    "w-4 bg-gradient-to-t rounded-t-full transition-all duration-1000 group-hover/bar:scale-x-125 group-hover/bar:shadow-[0_0_20px_rgba(37,99,235,0.3)]",
                    d.spent > d.prev ? "from-red-500 to-red-400" : "from-primary to-blue-400"
                  )}
                  style={{ height: `${(d.spent / maxVal) * 100}%` }}
               />
            </div>
            <span className="text-[10px] text-gray-600 font-black tracking-widest group-hover/bar:text-white transition-colors uppercase leading-none italic">{d.label}</span>
          </div>
        ))}
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 border-t border-white/5 relative z-10">
         <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 group/insight hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2">
               {Number(insights?.diff) > 0 ? (
                 <ArrowUpRight className="w-4 h-4 text-red-400" />
               ) : (
                 <ArrowDownRight className="w-4 h-4 text-emerald-400" />
               )}
               <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Tendencia</span>
            </div>
            <p className={cn("font-black italic text-2xl uppercase tracking-tighter", Number(insights?.diff) > 0 ? "text-red-400" : "text-emerald-400")}>
              {insights?.diff > 0 ? '+' : ''}{insights?.diff}%
            </p>
         </div>

         <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 group/insight hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-primary" />
               <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Gasto Prom.</span>
            </div>
            <p className="text-white font-black italic text-2xl uppercase tracking-tighter">${insights?.avgDaily}</p>
         </div>

         <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 group/insight hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2">
               <Info className="w-4 h-4 text-yellow-400" />
               <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Categoría Top</span>
            </div>
            <p className="text-white font-black italic text-2xl uppercase tracking-tighter truncate pr-2">{insights?.topCategory}</p>
         </div>

         <div className="md:col-span-1 flex items-center">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary text-[10px] leading-tight font-bold italic">
               &quot;Tu gasto en {insights?.topCategory} ha crecido significativamente esta {range === 'week' ? 'semana' : 'mes'}.&quot;
            </div>
         </div>
      </div>
    </div>
  );
}
