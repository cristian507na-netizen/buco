"use client";

import { useMemo } from "react";
import { 
  Clock, 
  Calendar, 
  Activity, 
  Zap,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HabitsAnalysis({ expenses }: { expenses: any[] }) {
  const analysis = useMemo(() => {
    if (!expenses.length) return null;

    // 1. More expensive day of the week
    const dayTotals: Record<number, number> = {};
    expenses.forEach(e => {
      const day = new Date(e.fecha).getDay();
      dayTotals[day] = (dayTotals[day] || 0) + Number(e.monto);
    });

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const maxDayIdx = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0][0];
    const maxDay = days[Number(maxDayIdx)];

    // 2. Transacciones por categoría (Frecuencia)
    const categoryCounts: Record<string, number> = {};
    expenses.forEach(e => {
      categoryCounts[e.categoria] = (categoryCounts[e.categoria] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0];

    // 3. Peak hour (Mock or simplified)
    const hours: Record<number, number> = {};
    expenses.forEach(e => {
       const hour = new Date(e.fecha).getHours();
       hours[hour] = (hours[hour] || 0) + 1;
    });

    const isMorning = Object.entries(hours).some(([h]) => Number(h) < 12);

    return {
      maxDay,
      topCategory,
      peakTime: isMorning ? "Mañanas" : "Tardes/Noches",
      avgPerTransaction: expenses.reduce((acc, e) => acc + Number(e.monto), 0) / expenses.length
    };
  }, [expenses]);

  if (!analysis) return (
    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-color)] h-full flex flex-col items-center justify-center text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest text-center italic shadow-sm">
       <div className="h-12 w-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 opacity-50">
          <Activity className="w-6 h-6" />
       </div>
       Aún no hay suficientes datos<br/>para analizar tus hábitos
    </div>
  );

  return (
    <div 
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px'
      }}
      className="p-6 md:p-8 flex flex-col h-full group transition-all duration-300 relative overflow-hidden"
    >
      
      <div>
         <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-sm">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-none uppercase italic">Hábitos</h3>
               <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Tu patrón de consumo</p>
            </div>
         </div>

        <div className="space-y-6">
           <HabitItem 
             icon={Calendar} 
             label="Día más costoso" 
             value={analysis.maxDay} 
             color="bg-amber-500/10 text-amber-500"
           />
           <HabitItem
             icon={Zap}
             label="Categoría recurrente"
             value={analysis.topCategory}
             color="bg-emerald-500/10 text-emerald-500"
           />
           <HabitItem
             icon={Clock}
             label="Horario pico"
             value={analysis.peakTime}
             color="bg-blue-500/10 text-blue-500"
           />
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-[var(--border-color)] flex items-center justify-between">
         <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 opacity-70">Ticket Promedio</p>
            <h4 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] italic">
              <span className="text-xl opacity-50 mr-0.5">$</span>{analysis.avgPerTransaction.toFixed(2)}
            </h4>
         </div>
         <div className="h-10 w-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors">
            <TrendingUp className="w-5 h-5" />
         </div>
      </div>
    </div>
  );
}

function HabitItem({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center justify-between p-1">
       <div className="flex items-center gap-4">
           <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all group-hover:border-[var(--text-muted)]/30", color)}>
              <Icon className="w-5 h-5 opacity-70" />
           </div>
           <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-80">{label}</span>
        </div>
        <div className="text-right">
           <span className="text-xs font-black text-[var(--text-primary)] uppercase italic tracking-wider bg-[var(--bg-secondary)] px-3 py-1 rounded-lg border border-[var(--border-color)]">{value}</span>
        </div>
    </div>
  );
}
