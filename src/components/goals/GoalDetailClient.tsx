"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  ChevronLeft, 
  Calendar,
  Wallet,
  ShoppingBag,
  CreditCard,
  Target,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Clock,
  MessageSquare,
  ListTodo,
  History,
  Sparkles,
  Camera,
  Trash2,
  Edit2,
  PiggyBank,
  Gift,
  Plane,
  Hourglass,
  Info,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseMoney } from "@/lib/format";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteGoal, addContribution } from "@/app/goals/actions";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import * as LucideIcons from "lucide-react";
import { calculateGoalProgress, calculateRealAmount } from "@/lib/goalProgress";
import { useRealtime } from "@/hooks/useRealtime";

// Sub-components
import GoalTasks from "./GoalTasks";
import GoalTimeline from "./GoalTimeline";
import GoalChat from "./GoalChat";

const GOAL_TYPES: any = {
  ahorro: { name: 'Ahorrar', icon: PiggyBank, color: 'text-emerald-500', gradient: 'from-[#064e3b] to-[#10b981]', start: '#064e3b', end: '#10b981' },
  gasto: { name: 'Presupuesto', icon: TrendingDown, color: 'text-red-500', gradient: 'from-[#7c2d12] to-[#ef4444]', start: '#7c2d12', end: '#ef4444' },
  ingreso: { name: 'Ingresos', icon: TrendingUp, color: 'text-blue-500', gradient: 'from-[#1e3a8a] to-[#3b82f6]', start: '#1e3a8a', end: '#3b82f6' },
  regalo: { name: 'Deseo', icon: Gift, color: 'text-pink-500', gradient: 'from-[#581c87] to-[#d946ef]', start: '#581c87', end: '#d946ef' },
  deuda: { name: 'Deuda', icon: CreditCard, color: 'text-orange-500', gradient: 'from-[#450a0a] to-[#b91c1c]', start: '#450a0a', end: '#b91c1c' },
  habito: { name: 'Hábito', icon: Target, color: 'text-indigo-500', gradient: 'from-[#1e1b4b] to-[#6366f1]', start: '#1e1b4b', end: '#6366f1' },
};

const PREDEFINED_COLORS = [
  { id: 'blue', color: '#3b82f6' },
  { id: 'green', color: '#10b981' },
  { id: 'purple', color: '#a855f7' },
  { id: 'orange', color: '#f97316' },
  { id: 'red', color: '#ef4444' },
  { id: 'yellow', color: '#eab308' },
  { id: 'cyan', color: '#06b6d4' },
  { id: 'pink', color: '#ec4899' }
];

const renderDynamicIcon = (iconName: string, className?: string) => {
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Target;
  return <IconComponent className={className} />;
};

export default function GoalDetailClient({ 
  goal: propGoal, 
  contributions: propContributions, 
  tasks: propTasks, 
  messages: propMessages, 
  accounts, 
  creditCards,
  expenses: propExpenses, 
  incomes: propIncomes, 
  profile,
  userId,
  planSteps 
}: any) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Realtime States
  const [goal, setGoal] = useState(propGoal);
  const [contributions, setContributions] = useState(propContributions);
  const [tasks, setTasks] = useState(propTasks);
  const [messages, setMessages] = useState(propMessages);
  const [expenses, setExpenses] = useState(propExpenses);
  const [incomes, setIncomes] = useState(propIncomes);

  const [activeTab, setActiveTab] = useState<'history' | 'tasks' | 'chat'>('history');
  const [activeContributionModal, setActiveContributionModal] = useState(false);
  const [contributionData, setContributionData] = useState({
    amount: '',
    note: '',
    sourceId: '',
    sourceType: 'cash' as any
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useRealtime({
    table: 'savings_goals',
    filter: `id=eq.${goal.id}`,
    onUpdate: (updatedGoal) => setGoal(updatedGoal)
  });

  useRealtime({
    table: 'goal_contributions',
    filter: `goal_id=eq.${goal.id}`,
    onInsert: (newCont) => setContributions((prev: any) => [newCont, ...prev]),
    onUpdate: (updatedCont) => setContributions((prev: any) => prev.map((c: any) => c.id === updatedCont.id ? updatedCont : c)),
    onDelete: (deletedCont) => setContributions((prev: any) => prev.filter((c: any) => c.id !== deletedCont.id))
  });

  useRealtime({
    table: 'goal_tasks',
    filter: `goal_id=eq.${goal.id}`,
    onInsert: (newTask) => setTasks((prev: any) => [newTask, ...prev]),
    onUpdate: (updatedTask) => setTasks((prev: any) => prev.map((t: any) => t.id === updatedTask.id ? updatedTask : t)),
    onDelete: (deletedTask) => setTasks((prev: any) => prev.filter((t: any) => t.id !== deletedTask.id))
  });

  // Sync Props to State (Single Source of Truth)
  useEffect(() => {
    setGoal(propGoal);
    setContributions(propContributions);
    setTasks(propTasks);
    setMessages(propMessages);
    setExpenses(propExpenses);
    setIncomes(propIncomes);
  }, [propGoal, propContributions, propTasks, propMessages, propExpenses, propIncomes]);

  const typeInfo = GOAL_TYPES[goal.type] || GOAL_TYPES.ahorro;

  // Real data calculations - ELIMINATING HARDCODED DATA
  const realCurrentAmount = useMemo(() => {
    return calculateRealAmount(goal, contributions, expenses);
  }, [goal, contributions, expenses]);

  const progress = useMemo(() => {
    return calculateGoalProgress(realCurrentAmount, goal.target_amount, goal.type);
  }, [goal, realCurrentAmount]);

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  const handleDelete = async () => {
    if (window.confirm('¿Eliminar esta meta permanentemente?')) {
      await deleteGoal(goal.id);
      router.push('/goals');
    }
  };

  const activeColor = PREDEFINED_COLORS.find(c => c.id === goal.color)?.color || '#3b82f6';

  if (!mounted) return <div className="flex-1 bg-[var(--bg-secondary)]" />;

  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-global)] pb-[140px] text-[var(--text-primary)] page-transition">
      {/* 🚀 PREMIUM REDESIGNED HEADER */}
      <div className="section-hero min-h-[260px] md:min-h-[220px] pb-10 px-6 relative flex flex-col" style={{ borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', overflow: 'hidden' }}>
         <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
            {/* Top Row: Navigation & Simple Title */}
            <div className="flex items-center justify-between py-6">
               <Link href="/goals" className="h-10 w-10 shrink-0 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all border border-white/10 shadow-lg group">
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
               </Link>
               
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Detalle de Meta</p>
               
               <div className="flex gap-2.5">
                  <button className="h-10 w-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all border border-white/10 shadow-lg group">
                     <Edit2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-all" />
                  </button>
                  <button onClick={handleDelete} className="h-10 w-10 rounded-full bg-red-500/20 backdrop-blur-md flex items-center justify-center text-red-100 hover:bg-red-500/40 transition-all border border-white/20 shadow-lg group">
                     <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
            </div>

            {/* Center Area: Icon & Big Name */}
            <div className="flex items-center gap-5 mt-4 mb-8 px-4">
               <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border border-white/5" style={{ backgroundColor: `${activeColor}33`, color: activeColor }}>
                  {renderDynamicIcon(goal.icon || 'Target', "w-8 h-8")}
               </div>
                <div className="flex-1 min-w-0">
                   <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter uppercase italic break-words">
                      {goal.name}
                   </h1>
                  <p className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] italic mt-2 flex items-center gap-2">
                     <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activeColor }} />
                     {typeInfo?.name}
                  </p>
               </div>
            </div>

            {/* Bottom Row: Info Pills */}
            <div className="flex flex-wrap gap-2.5 px-4 mt-auto">
               <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-sm flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", goal.status === 'active' ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-gray-400")} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{goal.status === 'active' ? 'En Progreso' : 'Pausada'}</span>
               </div>

               <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-sm flex items-center gap-2 text-white">
                  <Clock className="w-3 h-3 text-white/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">
                     {getDaysRemaining(goal.deadline) !== null ? `${getDaysRemaining(goal.deadline)} días` : 'Sin fecha'}
                  </span>
               </div>

               <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-sm flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-3 h-3 text-white/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">{progress.toFixed(0)}% Completado</span>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 relative z-50 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
         {/* LEFT COLUMN: Main Highlights */}
         <div className="lg:col-span-12 xl:col-span-5 space-y-8">
             <div className="bg-[var(--bg-card)] rounded-[3rem] p-8 md:p-10 shadow-2xl border border-[var(--border-color)] overflow-hidden relative group backdrop-blur-sm">
                <div className="flex flex-col items-center relative z-10 w-full">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 italic">Progreso Actual</p>


                   {/* Moderate Progress Ring */}
                   <div className="h-[140px] w-[140px] shrink-0 relative flex items-center justify-center mb-10">
                      <div className="absolute inset-0 rounded-full border-[10px] border-[var(--bg-secondary)] shadow-inner" />
                      
                      <div className="flex flex-col items-center justify-center z-20">
                         <span className="text-4xl font-black text-white tracking-tighter italic leading-none">
                            {progress.toFixed(0)}%
                         </span>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1 italic">DEL OBJETIVO</span>
                      </div>

                      <svg className="absolute inset-0 -rotate-90 w-full h-full overflow-visible p-0" viewBox="0 0 100 100">
                         <circle
                           cx="50"
                           cy="50"
                           r="45"
                           fill="none"
                           stroke="var(--border-color)"
                           strokeWidth="10"
                         />
                         <circle
                           cx="50"
                           cy="50"
                           r="45"
                           fill="none"
                           stroke={activeColor}
                           strokeWidth="10"
                           strokeLinecap="round"
                           strokeDasharray={283}
                           strokeDashoffset={283 - (283 * Math.min(progress, 100)) / 100}
                           className="transition-all duration-[2s] ease-in-out"
                         />
                      </svg>
                   </div>

                   {/* Main Stats Row */}
                   <div className="grid grid-cols-2 gap-6 w-full mb-6">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic flex items-center gap-1.5"><Wallet className="w-3 h-3"/> Acumulado</p>
                         <p className="text-lg md:text-xl font-black tracking-tight text-white">
                            ${realCurrentAmount.toLocaleString()}
                         </p>
                      </div>
                      <div className="space-y-1 text-right">
                         <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic flex items-center justify-end gap-1.5"><Target className="w-3 h-3"/> Objetivo</p>
                         <p className="text-lg md:text-xl font-black tracking-tight text-white">
                            ${Number(goal.target_amount || 0).toLocaleString()}
                         </p>
                      </div>
                   </div>

                   {/* Date Stats Row */}
                   <div className="grid grid-cols-2 gap-6 w-full mb-8">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Fecha Límite</p>
                         <p className="text-[13px] md:text-sm font-black tracking-tight text-white">
                            {goal.deadline ? new Date(goal.deadline).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Indefinido'}
                         </p>
                      </div>
                      <div className="space-y-1 text-right">
                         <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic flex items-center justify-end gap-1.5"><Hourglass className="w-3 h-3"/> Tiempo</p>
                         <p className="text-[13px] md:text-sm font-black tracking-tight text-white">
                            {getDaysRemaining(goal.deadline) !== null ? `${getDaysRemaining(goal.deadline)} días` : '---'}
                         </p>
                      </div>
                   </div>

                   {/* Thin Horizontal Bar */}
                   <div className="w-full mb-8 mt-2 space-y-2">
                      <div className="h-1 w-full bg-[var(--border-color)] rounded-full overflow-hidden relative">
                         <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: activeColor }} />
                      </div>
                      <div className="flex items-center justify-between px-0.5">
                         <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">${realCurrentAmount.toLocaleString()}</span>
                         <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">${Number(goal.target_amount || 0).toLocaleString()}</span>
                      </div>
                   </div>

                   {/* Register Contribution Button (Centered, Compact) */}
                   <div className="w-full flex justify-center mt-2">
                      <button 
                         onClick={() => setActiveContributionModal(true)}
                         className="px-8 h-12 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic text-[10px] shadow-xl flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-[0.97] transition-all group"
                      >
                          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                          Registar Abono
                      </button>
                   </div>
                </div>
             </div>

             {/* Motivation Card */}
             {goal.description && (
                <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 shadow-lg border border-[var(--border-color)] flex gap-4 items-start">
                   <Info className="w-5 h-5 text-primary shrink-0 mt-1" />
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider italic">Inspiración</h4>
                      <p className="text-sm font-medium leading-relaxed text-[var(--text-secondary)]">"{goal.description}"</p>
                   </div>
                </div>
             )}
         </div>

         {/* RIGHT COLUMN: Details & Chat */}
         <div className="lg:col-span-12 xl:col-span-7 space-y-8">

            {/* Content Tabs Container */}
            <div className="bg-[var(--bg-card)] rounded-[3rem] p-6 md:p-10 shadow-2xl border border-[var(--border-color)] min-h-[500px]">
               <div className="flex items-center gap-1.5 mb-10 bg-[var(--bg-secondary)] p-1.5 rounded-[2rem] w-fit">
                  {(['history', 'tasks', 'chat'] as any[]).map((tab) => (
                    <button 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={cn(
                          "px-6 py-2.5 rounded-[1.5rem] text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap italic",
                          activeTab === tab 
                            ? "bg-primary text-white shadow-lg" 
                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                       )}
                    >
                      {tab === 'history' ? 'Historial' : tab === 'tasks' ? 'Tareas' : 'Plan AI'}
                    </button>
                  ))}
               </div>

               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {activeTab === 'history' && <GoalTimeline goal={goal} contributions={contributions} tasks={tasks} planSteps={planSteps} />}
                  {activeTab === 'tasks' && <GoalTasks goal={goal} initialTasks={tasks} profile={profile} />}
                  {activeTab === 'chat' && (
                    <GoalChat 
                      goal={goal} 
                      initialMessages={messages} 
                      progress={progress} 
                      expenses={expenses} 
                      incomes={incomes} 
                      tasks={tasks} 
                      profile={profile} 
                    />
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* MODAL: REGISTER ABONO */}
      <Dialog open={activeContributionModal} onOpenChange={setActiveContributionModal}>
         <DialogContent className="rounded-[2.5rem] w-[95vw] sm:max-w-md p-0 overflow-hidden bg-[var(--bg-card)] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="p-7 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
               <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic flex items-center gap-3">
                  <PiggyBank className="w-6 h-6 text-primary" />
                  {goal.type === 'deuda' ? 'Saldar Cuota' : 'Sumar Progreso'}
               </h2>
               <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] mt-2 opacity-60 italic">Alcanzarás tu meta hoy.</p>
            </div>

            <form onSubmit={async (e) => {
               e.preventDefault();
               setIsSubmitting(true);
               const res = await addContribution(
                 goal.id, 
                 parseFloat(contributionData.amount), 
                 contributionData.note,
                 contributionData.sourceId,
                 contributionData.sourceType
               );
               setIsSubmitting(false);
               if (res.success) {
                  setActiveContributionModal(false);
                  setContributionData({ amount: '', note: '', sourceId: '', sourceType: 'cash' });
                  router.refresh();
                } else alert(res.error || 'Error');
             }} className="p-5 sm:p-7 space-y-5">
               
               <div className="space-y-3">
               <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic px-2">¿Cuánto vas a {goal.type === 'deuda' ? 'pagar' : 'abonar'}?</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-primary opacity-50 group-focus-within:opacity-100 transition-opacity">$</div>
                    <input 
                       type="text" 
                       autoFocus
                       placeholder="0.00" 
                       className="w-full h-16 bg-[var(--bg-secondary)] rounded-[1.5rem] pl-14 pr-6 text-2xl font-black text-[var(--text-primary)] border-none outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all placeholder:text-[var(--text-muted)]/30"
                       value={contributionData.amount}
                       onChange={(e) => setContributionData({...contributionData, amount: parseMoney(e.target.value)})}
                       required
                    />
                  </div>
               </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic px-2">¿De dónde sale el dinero?</label>
                   <div className="grid grid-cols-2 gap-2">
                    {/* Cash Option */}
                    <div 
                      onClick={() => setContributionData({...contributionData, sourceType: 'cash', sourceId: ''})}
                      className={cn(
                        "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2",
                        contributionData.sourceType === 'cash' 
                          ? "bg-primary/10 border-primary shadow-lg" 
                          : "bg-[var(--bg-secondary)] border-transparent border-dashed hover:border-[var(--border-color)]"
                      )}
                    >
                      <LucideIcons.Wallet className={cn("w-4 h-4", contributionData.sourceType === 'cash' ? "text-primary" : "text-[var(--text-muted)]")} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] leading-none mb-1 truncate">Efectivo</span>
                        <span className="text-[9px] font-bold text-[var(--text-muted)]">${Number(profile?.cash_balance || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Bank Accounts */}
                    {accounts?.map((acc: any) => (
                      <div 
                        key={acc.id}
                        onClick={() => setContributionData({...contributionData, sourceType: 'bank_account', sourceId: acc.id})}
                        className={cn(
                          "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2",
                          contributionData.sourceType === 'bank_account' && contributionData.sourceId === acc.id
                            ? "bg-primary/10 border-primary shadow-lg" 
                            : "bg-[var(--bg-secondary)] border-transparent border-dashed hover:border-[var(--border-color)]"
                        )}
                      >
                        <LucideIcons.Building2 className={cn("w-4 h-4", contributionData.sourceType === 'bank_account' && contributionData.sourceId === acc.id ? "text-primary" : "text-[var(--text-muted)]")} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] leading-none mb-1 truncate">{acc.nombre_banco}</span>
                          <span className="text-[9px] font-bold text-[var(--text-muted)]">${Number(acc.saldo_actual || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}

                    {/* Debit Cards */}
                    {creditCards?.filter((c: any) => c.tipo_tarjeta === 'debito').map((card: any) => (
                      <div 
                        key={card.id}
                        onClick={() => setContributionData({...contributionData, sourceType: 'debit_card', sourceId: card.id})}
                        className={cn(
                          "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2",
                          contributionData.sourceType === 'debit_card' && contributionData.sourceId === card.id
                            ? "bg-primary/10 border-primary shadow-lg" 
                            : "bg-[var(--bg-secondary)] border-transparent border-dashed hover:border-[var(--border-color)]"
                        )}
                      >
                        <LucideIcons.CreditCard className={cn("w-4 h-4", contributionData.sourceType === 'debit_card' && contributionData.sourceId === card.id ? "text-primary" : "text-[var(--text-muted)]")} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] leading-none mb-1 truncate">{card.nombre_tarjeta}</span>
                          <span className="text-[9px] font-bold text-[var(--text-muted)]">${Number(card.saldo_actual || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic px-2">Nota de motivación (Opcional)</label>
                  <input 
                     type="text" 
                     placeholder="Ej: Ahorro de la semana, Premio..." 
                     className="w-full h-12 bg-[var(--bg-secondary)] rounded-xl px-4 font-bold text-xs text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 placeholder:text-[var(--text-muted)]"
                     value={contributionData.note}
                     onChange={(e) => setContributionData({...contributionData, note: e.target.value})}
                  />
               </div>

               <div className="pt-4 flex gap-4">
                  <button 
                     type="button"
                     onClick={() => setActiveContributionModal(false)}
                     className="flex-1 h-14 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-muted)] font-black uppercase tracking-widest text-[10px] border border-[var(--border-color)] hover:bg-[var(--bg-card)] transition-colors"
                  >
                     Cancelar
                  </button>
                  <button 
                     type="submit"
                     disabled={isSubmitting || !contributionData.amount}
                     className="flex-[2] h-14 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-[0.97] transition-all uppercase italic tracking-[0.2em] text-[11px] disabled:opacity-50"
                  >
                     {isSubmitting ? 'Sumando...' : 'Confirmar Abono'}
                     <ArrowUpRight className="w-5 h-5" />
                  </button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}
