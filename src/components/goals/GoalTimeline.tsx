"use client";

import { useState, useMemo } from "react";
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Calendar,
  Wallet,
  TrendingUp,
  Award,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateGoalPlan } from "@/app/goals/actions";
import { useRouter } from "next/navigation";

export default function GoalTimeline({ goal, contributions, tasks, planSteps = [] }: any) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<'historial' | 'plan'>('historial');
  const [isGenerating, setIsGenerating] = useState(false);

  const events = useMemo(() => {
    const list: any[] = [];

    // 1. Goal Created
    list.push({
      type: 'created',
      date: goal.created_at,
      title: 'Meta Creada',
      desc: `Iniciaste el camino para "${goal.name}"`,
      icon: Target,
      color: 'bg-primary text-white'
    });

    // 2. Contributions
    contributions.forEach((c: any) => {
      list.push({
        type: 'contribution',
        date: c.created_at,
        title: `Aportación de $${c.amount.toLocaleString()}`,
        desc: c.note || 'Ahorro registrado',
        icon: Wallet,
        color: 'bg-emerald-500 text-white'
      });
    });

    // 3. Completed Tasks
    tasks.filter((t: any) => t.completed).forEach((t: any) => {
      list.push({
        type: 'task',
        date: t.completed_at || t.created_at,
        title: `Tarea completada: ${t.title}`,
        desc: 'Un paso más cerca de tu objetivo',
        icon: CheckCircle2,
        color: 'bg-blue-500 text-white'
      });
    });

    // 4. Milestones (Calculated from real contribution dates)
    const total = goal.target_amount || 0;
    if (total > 0) {
      const sortedContributions = [...contributions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      let runningSum = 0;
      let reached25 = false;
      let reached50 = false;
      let reached75 = false;

      sortedContributions.forEach(c => {
        runningSum += Number(c.amount);
        if (!reached25 && runningSum >= total * 0.25) {
          list.push({ type: 'milestone', date: c.created_at, title: '¡25% Alcanzado! 🚀', desc: '¡Buen comienzo! Sigue así.', icon: Award, color: 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' });
          reached25 = true;
        }
        if (!reached50 && runningSum >= total * 0.50) {
          list.push({ type: 'milestone', date: c.created_at, title: '¡Mitad de Camino! 🏔️', desc: '¡Ya recorriste el 50%!', icon: Award, color: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' });
          reached50 = true;
        }
        if (!reached75 && runningSum >= total * 0.75) {
          list.push({ type: 'milestone', date: c.created_at, title: '¡75% Completado! 🔥', desc: 'Estás muy cerca de lograrlo.', icon: Award, color: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' });
          reached75 = true;
        }
      });
    }

    if (goal.status === 'completed') {
      list.push({
        type: 'completed',
        date: goal.updated_at,
        title: '¡Meta Alcanzada!',
        desc: 'Lo lograste. ¡Felicidades! 🎉',
        icon: CheckCircle2,
        color: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
      });
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [goal, contributions, tasks]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      <div className="p-8 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between bg-[var(--bg-card)] shrink-0 gap-6">
         <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-none italic uppercase">Ruta de la Meta</h3>
            <p className="text-xs font-medium text-[var(--text-muted)]">Historial de logros y proyección de futuro.</p>
         </div>

         <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] self-start md:self-center">
            <button 
               onClick={() => setActiveSubTab('historial')}
               className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                  activeSubTab === 'historial' ? "bg-[var(--bg-card)] text-primary shadow-lg border border-[var(--border-color)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
               )}
            >
               Historial
            </button>
            <button 
               onClick={() => setActiveSubTab('plan')}
               className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-2",
                  activeSubTab === 'plan' ? "bg-[var(--bg-card)] text-primary shadow-lg border border-[var(--border-color)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
               )}
            >
               Plan <Sparkles className="w-3 h-3" />
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-[var(--bg-card)]/30 backdrop-blur-sm">
         <div className="max-w-2xl mx-auto relative pt-10 pb-20 px-4 mt-8">
            {/* 🛣 ROADMAP LINE (SVG) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-[var(--border-color)] to-primary/30 w-1 mx-auto rounded-full" />
                <div 
                   className="absolute top-0 w-1 mx-auto bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                   style={{ height: `${activeSubTab === 'historial' ? '100%' : '50%'}` }}
                />
            </div>

            {activeSubTab === 'historial' ? (
               <div className="relative">
                  {events.map((event: any, idx: number) => {
                     const isLeft = idx % 2 === 0;
                     return (
                        <div key={idx} className={cn(
                           "relative flex items-center mb-16 w-full animate-in fade-in zoom-in duration-700",
                           isLeft ? "flex-row" : "flex-row-reverse"
                        )} style={{ animationDelay: `${idx * 150}ms` }}>
                           
                           {/* Content Card */}
                           <div className={cn(
                              "w-[42%] p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl relative group hover:scale-[1.02] transition-all",
                              "hover:shadow-2xl hover:border-primary/30"
                           )}>
                              <div className="flex flex-col gap-2">
                                 <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">{new Date(event.date).toLocaleDateString()}</span>
                                 <h4 className="text-sm lg:text-base font-black text-[var(--text-primary)] leading-none italic uppercase group-hover:text-primary transition-colors">{event.title}</h4>
                                 <p className="text-[10px] lg:text-xs font-bold text-[var(--text-muted)] leading-tight">{event.desc}</p>
                              </div>
                              
                              {/* Connection Dot to Main Line */}
                              <div className={cn(
                                 "absolute top-1/2 -translate-y-1/2 w-4 h-[2px] bg-[var(--border-color)] group-hover:bg-primary transition-colors",
                                 isLeft ? "-right-4" : "-left-4"
                              )} />
                           </div>

                           {/* Central Icon / Node */}
                           <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                              <div className={cn(
                                 "h-12 w-12 rounded-2xl flex items-center justify-center z-10 shadow-2xl border-4 border-[var(--bg-secondary)] scale-90 md:scale-100",
                                 event.color
                              )}>
                                 <event.icon className="w-5 h-5" />
                              </div>
                           </div>

                           {/* Spacer for the other side */}
                           <div className="w-[42%]" />
                        </div>
                     );
                  })}

                  {events.length === 0 && (
                     <div className="py-24 text-center space-y-6 relative z-10">
                        <div className="h-24 w-24 rounded-[2.5rem] bg-[var(--bg-secondary)] flex items-center justify-center mx-auto border border-[var(--border-color)] shadow-inner transform -rotate-12">
                           <HistoryIcon className="w-12 h-12 text-[var(--text-muted)] opacity-30" />
                        </div>
                        <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-[0.3em] italic">Explora tu camino...</p>
                     </div>
                  )}
               </div>
            ) : (
               <div className="relative">
                  {planSteps.length > 0 ? (
                     <div className="relative">
                        {planSteps.map((step: any, idx: number) => {
                           const isLeft = idx % 2 === 0;
                           const active = isActiveStep(step);
                           return (
                              <div key={idx} className={cn(
                                 "relative flex items-center mb-20 w-full animate-in slide-in-from-bottom-5 duration-700",
                                 isLeft ? "flex-row" : "flex-row-reverse"
                              )} style={{ animationDelay: `${idx * 150}ms` }}>
                                 
                                 <div className={cn(
                                    "w-[42%] p-6 rounded-[2rem] bg-[var(--bg-card)] border shadow-2xl relative transition-all group",
                                    active ? "border-primary ring-4 ring-primary/10 scale-105 z-20" : "border-[var(--border-color)] hover:border-primary/20",
                                    step.completed ? "opacity-70" : ""
                                 )}>
                                    <div className="flex flex-col gap-3">
                                       <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{step.month_label}</span>
                                          {active && <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg animate-pulse italic">Actual</span>}
                                       </div>
                                       <h4 className="text-lg font-black text-[var(--text-primary)] leading-none italic uppercase">Ahorrar ${step.suggested_amount}</h4>
                                       {step.description && <p className="text-xs font-bold text-[var(--text-muted)] line-clamp-2">{step.description}</p>}
                                    </div>

                                    {/* Connection Dot to Main Line */}
                                    <div className={cn(
                                       "absolute top-1/2 -translate-y-1/2 w-4 h-[2px] bg-[var(--border-color)]",
                                       isLeft ? "-right-4" : "-left-4",
                                       active ? "bg-primary" : ""
                                    )} />
                                 </div>

                                 <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                                    <div className={cn(
                                       "h-14 w-14 rounded-full flex items-center justify-center z-10 shadow-2xl border-4 transition-all duration-500",
                                       step.completed ? "bg-emerald-500 text-white border-white" : 
                                       active ? "bg-primary text-white border-white scale-110 shadow-primary/30" : 
                                       "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]"
                                    )}>
                                       {step.completed ? <CheckCircle2 className="w-6 h-6" /> : <div className="text-sm font-black italic">{idx + 1}</div>}
                                    </div>
                                 </div>

                                 <div className="w-[42%]" />
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="py-12 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 p-10 text-center space-y-8 relative z-10 backdrop-blur-md">
                        <div className="h-24 w-24 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto border border-primary/30 relative">
                           <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                           <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-xl flex items-center justify-center">
                              <Target className="w-4 h-4 text-primary" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase italic leading-none tracking-tighter">Plan Maestro con IA</h3>
                           <p className="text-xs font-bold text-[var(--text-muted)] max-w-[240px] mx-auto leading-relaxed">Analizaré tus metas y crearé un roadmap visual optimizado para tu éxito financiero.</p>
                        </div>
                        <button 
                           onClick={async () => {
                              setIsGenerating(true);
                              const res = await generateGoalPlan(goal.id);
                              setIsGenerating(false);
                              if (res.success) {
                                 router.refresh();
                              } else {
                                 alert(res.error || 'Error al generar plan');
                              }
                           }}
                           disabled={isGenerating}
                           className="w-full h-18 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] font-black shadow-[0_15px_30px_rgba(59,130,246,0.3)] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase italic tracking-widest text-xs py-5"
                        >
                           {isGenerating ? 'Calculando Ruta...' : 'Generar Mi Roadmap'}
                           <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                        </button>
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function isActiveStep(step: any) {
   const now = new Date();
   const month = now.toLocaleString('es-ES', { month: 'long' });
   return step.month_label?.toLowerCase() === month.toLowerCase();
}

function HistoryIcon({ className }: { className?: string }) {
   return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
}
