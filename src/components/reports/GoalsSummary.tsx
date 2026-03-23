"use client";

import { useMemo } from "react";
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function GoalsSummary({ goals }: any) {
  const stats = useMemo(() => {
    const active = goals.filter((g: any) => g.status === 'active');
    const completed = goals.filter((g: any) => g.status === 'completed');
    
    const avgProgress = active.length > 0 
      ? active.reduce((acc: number, g: any) => acc + (g.current_amount / g.target_amount * 100), 0) / active.length 
      : 0;

    const closestToFinish = [...active].sort((a, b) => 
      ((b.current_amount / b.target_amount) - (a.current_amount / a.target_amount))
    )[0];

    return {
      activeCount: active.length,
      completedCount: completed.length,
      avgProgress,
      closestToFinish
    };
  }, [goals]);

  return (
    <div 
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px'
      }}
      className="p-6 md:p-10 flex flex-col group transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
         <div>
            <h3 className="text-2xl font-black text-[var(--text-primary)] leading-none mb-2 uppercase italic">Reporte de Metas</h3>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Estado de tu planificación a futuro</p>
         </div>
         <div className="flex items-center gap-8">
            <div className="text-center">
               <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Promedio</p>
               <p className="text-xl font-black text-indigo-500">{stats.avgProgress.toFixed(0)}%</p>
            </div>
            <div className="h-10 w-px bg-[var(--border-color)]" />
            <div className="text-center">
               <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Activas</p>
               <p className="text-xl font-black text-[var(--text-primary)]">{stats.activeCount}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.slice(0, 3).map((goal: any, idx: number) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          return (
            <Link 
              key={idx} 
              href={`/goals/${goal.id}`}
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
                borderRadius: '16px'
              }}
              className="p-6 transition-all group/card"
            >
               <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-xl shadow-sm group-hover/card:scale-110 transition-transform">
                     {goal.icon || "🎯"}
                  </div>
                 <div className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                    goal.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                 )}>
                    {goal.status === 'completed' ? 'Completado' : 'En curso'}
                  </div>
               </div>
               <h4 className="text-sm font-black text-[var(--text-primary)] mb-4 line-clamp-1">{goal.name}</h4>
               <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                     <span>Progreso</span>
                     <span className="text-[var(--text-primary)]">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--bg-global)] rounded-full overflow-hidden border border-[var(--border-color)] relative">
                     <div 
                       className={cn("h-full rounded-full transition-all duration-1000 relative", 
                         progress >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                       )} 
                       style={{ width: `${Math.min(progress, 100)}%` }} 
                     />
                  </div>
               </div>
            </Link>
          );
        })}

        {/* Highlight Card */}
        {stats.closestToFinish && (
            <div 
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px'
              }}
              className="p-8 flex flex-col justify-between relative overflow-hidden lg:col-span-1"
            >
               <div className="relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/30">
                     <Target className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black italic uppercase leading-none mb-2 text-white">Casi listo</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60 mb-8 leading-relaxed">
                     Estás a punto de completar <span className="text-white italic">{stats.closestToFinish.name}</span>. ¡Un último esfuerzo!
                  </p>
               </div>

               <Link 
                 href={`/goals/${stats.closestToFinish.id}`}
                 className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-lg active:scale-95 z-10"
               >
                  Ver Progreso
               </Link>
            </div>
        )}
      </div>

      {goals.length === 0 && (
         <div className="py-20 text-center space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto grayscale opacity-50">
               <Target className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest italic">Aún no has definido metas para este período.</p>
         </div>
      )}
    </div>
  );
}
