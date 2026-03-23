"use client";

import { useState, useMemo, useRef } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  Wallet,
  ShoppingBag,
  CreditCard,
  Coffee,
  X,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Flame,
  Target,
  PlusCircle,
  Bell,
  Clock
} from "lucide-react";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { cn } from "@/lib/utils";
import { parseMoney } from "@/lib/format";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { createGoal, deleteGoal, addContribution, updateGoalStatus, updateGoalColor } from "@/app/goals/actions";
import * as LucideIcons from "lucide-react";
import { 
  Palette, Edit2, Trash2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useEffect } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { calculateGoalProgress, calculateRealAmount } from "@/lib/goalProgress";

interface Goal {
  id: string;
  name: string;
  description: string;
  type: 'ahorro' | 'gasto' | 'ingreso' | 'regalo' | 'deuda' | 'habito';
  icon: string;
  color: string;
  image_url?: string;
  target_amount?: number;
  current_amount: number;
  target_category?: string;
  target_account_id?: string;
  target_percentage?: number;
  deadline?: string;
  status: 'active' | 'completed' | 'failed';
  streak_count: number;
  linked_account_id?: string | null;
  goal_type_savings?: 'virtual' | 'linked_account';
  created_at: string;
}

interface Contribution {
  id: string;
  goal_id: string;
  amount: number;
}

interface Movement {
  id: string;
  monto: number;
  categoria: string;
  fecha: string;
}

interface GoalsClientProps {
  initialGoals: Goal[];
  initialContributions: Contribution[];
  initialExpenses: Movement[];
  initialIncomes: Movement[];
  accounts: any[];
  categories: string[];
  userId: string;
}

const GOAL_TYPES = [
  { id: 'ahorro',  name: 'Ahorrar',  icon: Wallet,      desc: 'Juntar una suma para algo específico',        color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-700 to-emerald-400' },
  { id: 'ingreso', name: 'Ingresos', icon: ArrowUpRight, desc: 'Llegar a un objetivo de ingresos mensuales',  color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    gradient: 'from-blue-600 to-cyan-400' },
  { id: 'regalo',  name: 'Compra',   icon: ShoppingBag,  desc: 'Ahorrar para un regalo o compra puntual',     color: 'text-pink-500',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    gradient: 'from-purple-600 to-pink-400' },
  { id: 'deuda',   name: 'Deuda',    icon: CreditCard,   desc: 'Liquidar el saldo de una tarjeta o préstamo', color: 'text-orange-500',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  gradient: 'from-gray-800 to-blue-900' },
  { id: 'habito',  name: 'Hábito',   icon: Target,       desc: 'Mantener un comportamiento mes a mes',        color: 'text-indigo-500',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  gradient: 'from-amber-500 to-orange-500' },
];

const LUCIDE_ICONS = ['Plane', 'Home', 'Car', 'PiggyBank', 'Book', 'TrendingUp', 'Heart', 'Star', 'Laptop', 'Coffee'];

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

export default function GoalsClient({ 
  initialGoals = [], 
  initialContributions = [], 
  initialExpenses = [], 
  initialIncomes = [], 
  accounts = [], 
  categories = [], 
  userId 
}: GoalsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterType, setFilterType] = useState<string>("all");
  
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    type: 'ahorro',
    icon: 'PiggyBank',
    color: 'blue',
    goal_type_savings: 'virtual',
    linked_account_id: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState(false);
  const [activeContributionModal, setActiveContributionModal] = useState<string | null>(null);
  const [contributionData, setContributionData] = useState({ amount: '', note: '', date: new Date().toISOString().split('T')[0] });
  const [isContributing, setIsContributing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [activeMenuGoalId, setActiveMenuGoalId] = useState<string | null>(null);
  const [showColorPickerFor, setShowColorPickerFor] = useState<string | null>(null);

  // Realtime State
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions);
  const [expenses, setExpenses] = useState<Movement[]>(initialExpenses);
  const [incomes, setIncomes] = useState<Movement[]>(initialIncomes);

  // Realtime Subscriptions
  useRealtime({
    table: 'savings_goals',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setGoals(prev => [newVal, ...prev]),
    onUpdate: (updated) => setGoals(prev => prev.map(g => g.id === updated.id ? updated : g)),
    onDelete: (deleted) => setGoals(prev => prev.filter(g => g.id !== deleted.id))
  });

  useRealtime({
    table: 'goal_contributions',
    onInsert: (newVal) => setContributions(prev => [newVal, ...prev]),
    onUpdate: (updated) => setContributions(prev => prev.map(c => c.id === updated.id ? updated : c)),
    onDelete: (deleted) => setContributions(prev => prev.filter(c => c.id !== deleted.id))
  });

  useRealtime({
    table: 'expenses',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setExpenses(prev => [newVal, ...prev]),
    onUpdate: (updated) => setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e)),
    onDelete: (deleted) => setExpenses(prev => prev.filter(e => e.id !== deleted.id))
  });

  useRealtime({
    table: 'incomes',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setIncomes(prev => [newVal, ...prev]),
    onUpdate: (updated) => setIncomes(prev => prev.map(i => i.id === updated.id ? updated : i)),
    onDelete: (deleted) => setIncomes(prev => prev.filter(i => i.id !== deleted.id))
  });

  // Sync Props to State (Single Source of Truth)
  useEffect(() => {
    setGoals(initialGoals);
    setContributions(initialContributions);
    setExpenses(initialExpenses);
    setIncomes(initialIncomes);
  }, [initialGoals, initialContributions, initialExpenses, initialIncomes]);

  // Calculate progress for each goal using stateful values
  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      const goalContributions = contributions.filter(c => c.goal_id === goal.id);
      const realAmount = calculateRealAmount(goal, contributions, expenses);
      
      return {
        ...goal,
        realAmount,
        progress: calculateGoalProgress(realAmount, goal.target_amount || 0, goal.type)
      };
    });
  }, [goals, contributions, expenses, incomes]);

  const filteredGoals = useMemo(() => {
    return goalsWithProgress.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
      const matchesType = filterType === 'all' || g.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [goalsWithProgress, searchTerm, filterStatus, filterType]);

  // Handle automatic completion
  useEffect(() => {
    const activeAndReached = goalsWithProgress.filter(g => g.status === 'active' && g.progress >= 100);
    activeAndReached.forEach(async (goal) => {
      try {
        await updateGoalStatus(goal.id, 'completed');
        // Status updated successfully
      } catch (err) {
        console.error("Error updating goal status:", err);
      }
    });
  }, [goalsWithProgress]);

  const handleNext = () => {
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setErrorStatus(null);
    
    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        fd.append(key, formData[key]);
      }
    });
    if (fileInputRef.current?.files?.[0]) {
      fd.append('image', fileInputRef.current.files[0]);
    }
    
    try {
      const res = await createGoal(fd);
      if (res.success) {
        setSuccessStatus(true);
        setTimeout(() => {
          setActiveModal(false);
          setSuccessStatus(false);
          setStep(1);
          setFormData({ 
            type: 'ahorro', 
            icon: '💰', 
            color: 'emerald',
            goal_type_savings: 'virtual',
            linked_account_id: null
          });
          setImagePreview(null);
          router.refresh();
        }, 1500);
      } else {
        setErrorStatus(res.error || "Ocurrió un error al crear la meta.");
      }
    } catch (err: any) {
      setErrorStatus(err.message || "Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContributionModal || !contributionData.amount) return;
    
    setIsContributing(true);
    try {
      const res = await addContribution(
        activeContributionModal, 
        Number(contributionData.amount), 
        contributionData.note
      );
      if (res.success) {
        setSuccessStatus(true);
        setTimeout(() => {
          setActiveContributionModal(null);
          setSuccessStatus(false);
          setContributionData({ amount: '', note: '', date: new Date().toISOString().split('T')[0] });
          router.refresh();
        }, 1500);
      } else {
        setErrorStatus(res.error || "Error al registrar el abono.");
      }
    } catch (err: any) {
      setErrorStatus(err.message || "Error de conexión.");
    } finally {
      setIsContributing(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress <= 25) return "bg-blue-300";
    if (progress <= 50) return "bg-blue-500";
    if (progress <= 75) return "bg-lime-500";
    if (progress < 100) return "bg-emerald-500";
    return "bg-emerald-600";
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
    <Dialog open={activeModal} onOpenChange={(o) => { 
      setActiveModal(o); 
      if(!o) { 
        setStep(1); 
        setFormData({ type: 'ahorro', icon: 'PiggyBank', color: 'blue', goal_type_savings: 'virtual', linked_account_id: null }); 
        setImagePreview(null); 
        setErrorStatus(null); 
        setSuccessStatus(false); 
      } 
    }}>
      <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24 lg:pb-12 text-[var(--text-primary)] page-transition">
      {/* 🚀 PREMIUM HEADER */}
      <div className="section-hero min-h-[200px] md:h-[160px] h-auto py-8 px-6 relative" style={{ borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', overflow: 'hidden' }}>
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-between h-full gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
                <div className="flex items-center justify-between md:justify-start gap-4 mb-1">
                   <div className="flex items-center gap-2">
                      <div className="h-4 w-1 bg-white/30 rounded-full" />
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-[1.5px]">Metas y Objetivos</span>
                   </div>

                   {/* Mobile Bell */}
                   <div className="md:hidden">
                      <NotificationsModal 
                        userId={userId} 
                        trigger={
                          <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer relative">
                            <Bell className="w-4 h-4" />
                          </div>
                        } 
                      />
                   </div>
                </div>
                <h1 className="text-[28px] font-bold tracking-tight text-white leading-none">Mis Metas</h1>
              <p className="text-white/80 font-medium text-[13px] opacity-80 line-clamp-1">Visualiza tu futuro y alcanza tus sueños paso a paso.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <DialogTrigger
                 render={
                   <button 
                     className="h-12 px-6 rounded-2xl bg-white text-[#1450A0] text-sm font-black shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-[0.98] border-none outline-none cursor-pointer flex-1 md:flex-initial"
                   >
                     <Plus className="w-5 h-5" />
                     <span>Nueva Meta</span>
                   </button>
                 }
               />

               {/* Desktop Bell */}
               <div className="hidden md:block">
                  <NotificationsModal 
                    userId={userId} 
                    trigger={
                      <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer relative hover:bg-white/20">
                        <Bell className="w-5 h-5" />
                      </div>
                    } 
                  />
               </div>
            </div>
          </div>

          {/* COMPACT METRICS INSIDE HERO */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1">
             <div className="flex items-center gap-2 shrink-0">
                <Target className="w-4 h-4 text-emerald-300" />
                <span className="text-[11px] font-bold text-white/90 whitespace-nowrap">{goals.filter(g => g.status === 'active').length} Activas</span>
             </div>
             <div className="flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-300" />
                <span className="text-[11px] font-bold text-white/90 whitespace-nowrap">{goals.filter(g => g.status === 'completed').length} Cumplidas</span>
             </div>
             <div className="flex items-center gap-2 shrink-0">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-[11px] font-bold text-white/90 whitespace-nowrap">Racha de {goals.reduce((acc, g) => acc + (g.streak_count || 0), 0)} días</span>
             </div>
          </div>
        </div>
      </div>

      {/* Reduced the top gap: space-y-12 -> space-y-6 */}
      <div className="max-w-7xl mx-auto px-[24px] pt-4 pb-[24px] relative z-10 space-y-6">
        {/* FILTERS */}
        <section className="flex flex-col gap-3 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
           <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Busca por nombre..."
                className="w-full h-11 bg-[var(--bg-secondary)] rounded-xl pl-11 pr-4 font-semibold text-sm text-[var(--text-primary)] border-none outline-none placeholder:text-[var(--text-muted)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-xl shrink-0">
                {(['all', 'active', 'completed'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      filterStatus === s ? "bg-primary text-white shadow-sm" : "text-[var(--text-muted)]"
                    )}
                  >
                    {s === 'all' ? 'Todas' : s === 'active' ? 'Activas' : 'Completadas'}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-[var(--border-color)] shrink-0" />
              <select
                className="h-9 px-3 rounded-xl bg-[var(--bg-secondary)] border-none text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] outline-none shrink-0 cursor-pointer"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tipo: Todos</option>
                {GOAL_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
           </div>
        </section>

        {/* GOALS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20">
          {filteredGoals.length > 0 ? filteredGoals.map(goal => {
            const progress = goal.progress;
            const typeInfo = GOAL_TYPES.find(t => t.id === goal.type);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const activeColor = PREDEFINED_COLORS.find(c => c.id === goal.color)?.color || '#3b82f6';

            return (
              <Link key={goal.id} href={`/goals/${goal.id}`} className="group block h-full">
                <div className="h-full rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-500 flex flex-col group relative">
                  
                  {/* 4px left strip representing the chosen color */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[2.5rem]" style={{ backgroundColor: activeColor }} />

                  {/* Content Area */}
                  <div className="p-6 flex-1 flex flex-col space-y-5 ml-2">
                     {/* Top Row: Icon/Name and Status Badge + Options */}
                     <div className="flex justify-between items-start">
                        <div className="flex gap-4 items-center">
                           {/* Icon Box */}
                           <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeColor}26`, color: activeColor }}>
                              {renderDynamicIcon(goal.icon || 'Target', "w-5 h-5")}
                           </div>
                           <div className="min-w-0 pr-2">
                              <h3 className="font-black text-[var(--text-primary)] text-[17px] leading-tight truncate tracking-tight uppercase italic pr-2">{goal.name}</h3>
                              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic mt-1">{typeInfo?.name}</p>
                           </div>
                        </div>

                        {/* Status Badge & 3-dots Menu Container */}
                        <div className="flex items-center gap-2">
                           {/* Badge */}
                           <div className={cn(
                              "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              goal.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"
                           )}>
                              {goal.status === 'active' ? 'Progreso' : 'Pausada'}
                           </div>

                           {/* 3 dots menu inside relative container */}
                           <div className="relative">
                              <button 
                                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuGoalId(activeMenuGoalId === goal.id ? null : goal.id); setShowColorPickerFor(null); }}
                                 className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors"
                              >
                                 <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuGoalId === goal.id && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl z-50 overflow-hidden font-bold origin-top-right animate-in fade-in zoom-in duration-200">
                                   {!showColorPickerFor ? (
                                     <div className="flex flex-col p-1.5 text-xs">
                                        <button onClick={(e) => { e.stopPropagation(); }} className="flex items-center gap-2.5 p-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors text-left w-full"><Edit2 className="w-3.5 h-3.5"/> Editar meta</button>
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColorPickerFor(goal.id); }} className="flex items-center gap-2.5 p-3 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors text-left w-full"><Palette className="w-3.5 h-3.5"/> Cambiar color</button>
                                        <button onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if(confirm('¿Eliminar esta meta?')) await deleteGoal(goal.id); setActiveMenuGoalId(null); }} className="flex items-center gap-2.5 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left w-full"><Trash2 className="w-3.5 h-3.5"/> Eliminar</button>
                                     </div>
                                   ) : (
                                     <div className="p-3">
                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-3 text-center">Elige un color</p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                           {PREDEFINED_COLORS.map(c => (
                                              <button 
                                                 key={c.id}
                                                 onClick={async (e) => { 
                                                    e.preventDefault();
                                                    e.stopPropagation(); 
                                                    await updateGoalColor(goal.id, c.id); 
                                                    setActiveMenuGoalId(null); 
                                                    setShowColorPickerFor(null);
                                                 }}
                                                 className="w-7 h-7 rounded-full transition-transform hover:scale-110 border-2 border-[var(--border-color)] shadow-inner"
                                                 style={{ backgroundColor: c.color }}
                                              />
                                           ))}
                                        </div>
                                     </div>
                                   )}
                                </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Bottom Area: Progress Bar & Data */}
                     <div className="mt-auto pt-6 space-y-4">
                        {/* Thin Progress Bar (4px height) */}
                        <div className="h-1.5 w-full bg-[var(--border-color)] rounded-full overflow-hidden relative mt-auto shadow-inner">
                           <div className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.3)]" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: activeColor }} />
                        </div>
                        {/* Stats Row */}
                        <div className="flex items-center justify-between px-1">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5 italic">Logrado</span>
                              <p className="text-[13px] font-black text-[var(--text-primary)] tracking-tighter tabular-nums">${(goal.realAmount || 0).toLocaleString()}</p>
                           </div>
                           <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black uppercase tracking-widest mb-0.5 italic" style={{ color: activeColor }}>Progreso</span>
                              <p className="text-[13px] font-black italic tracking-widest" style={{ color: activeColor }}>{progress.toFixed(0)}%</p>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5 italic">Meta</span>
                              <p className="text-[13px] font-black text-[var(--text-muted)] tracking-tighter tabular-nums">${Number(goal.target_amount || 0).toLocaleString()}</p>
                           </div>
                        </div>
                     </div>

                  </div>
                </div>
              </Link>
            )
          }) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-8 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] rounded-[3rem] relative overflow-hidden group hover:border-primary/30 transition-all">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]/50 pointer-events-none" />
               <div className="h-32 w-32 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  <Target className="w-16 h-16 text-[var(--text-muted)] group-hover:text-primary/40 transition-colors" />
               </div>
               <div className="space-y-3 z-10">
                  <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Crea tu primer sueño 🚀</h3>
                  <p className="text-[var(--text-muted)] max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px]">Aún no tienes metas activas. Diseña tu futuro y Buco te ayudará a alcanzarlo paso a paso.</p>
               </div>
               <button 
                  onClick={() => setActiveModal(true)}
                  className="px-12 py-5 bg-primary text-white rounded-3xl font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all z-10 flex items-center gap-3"
               >
                  <Plus className="w-6 h-6" />
                  Nueva Meta
               </button>
            </div>
          )}
        </section>
      </div>
    </div>

    {/* 🧩 NEW GOAL WIZARD MODAL */}
      <DialogContent className="rounded-[3rem] sm:max-w-xl p-0 overflow-hidden border-none shadow-3xl bg-[var(--bg-card)]">
            <div className="flex flex-col h-full max-h-[90vh]">
               {/* Header */}
               <div className="p-8 bg-[#1A2234] border-b border-[#1F2D45] flex items-center justify-between">
                  <div>
                     <h2 className="text-2xl font-black text-white tracking-tight leading-none uppercase italic text-shadow">Crea tu Meta</h2>
                     <p className="text-xs text-[#64748B] font-bold uppercase tracking-widest mt-2">Paso {step} de 3</p>
                  </div>
                  <div className="flex gap-1.5">
                     <div className={cn("h-1.5 w-8 rounded-full transition-all duration-300", step >= 1 ? "bg-[#2563EB]" : "bg-[#1F2D45]")} />
                     <div className={cn("h-1.5 w-8 rounded-full transition-all duration-300", step >= 2 ? "bg-[#2563EB]" : "bg-[#1F2D45]")} />
                     <div className={cn("h-1.5 w-8 rounded-full transition-all duration-300", step >= 3 ? "bg-[#2563EB]" : "bg-[#1F2D45]")} />
                  </div>
               </div>

               {/* Feedback Messages */}
               {errorStatus && (
                 <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in zoom-in duration-300 font-bold border-none shadow-sm">
                   <AlertCircle className="w-5 h-5 shrink-0" />
                   <p className="text-xs leading-tight uppercase tracking-tight">{errorStatus}</p>
                 </div>
               )}

               {successStatus && (
                 <div className="mx-8 mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in fade-in zoom-in duration-300 font-bold border-none shadow-sm">
                   <CheckCircle2 className="w-5 h-5 shrink-0" />
                   <p className="text-xs leading-tight uppercase tracking-tight">¡Meta creada exitosamente! ✨</p>
                 </div>
               )}

               <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                  {step === 1 && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {GOAL_TYPES.map(t => (
                              <button 
                                 key={t.id}
                                 onClick={() => { setFormData({...formData, type: t.id, goal_type_savings: 'virtual'}); handleNext(); }}
                                 className={cn(
                                    "p-6 rounded-[2rem] border-2 text-left transition-all hover:translate-y-[-4px]",
                                    formData.type === t.id ? "bg-[var(--bg-card)] border-primary shadow-xl shadow-primary/5" : "bg-[var(--bg-secondary)] border-transparent hover:bg-[var(--bg-card)] hover:border-[var(--border-color)]"
                                 )}
                              >
                                 <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4", t.bg, t.color)}>
                                    <t.icon className="w-6 h-6" />
                                 </div>
                                 <h4 className="font-black text-[var(--text-primary)] tracking-tight mb-1">{t.name}</h4>
                                 <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed uppercase tracking-wide">{t.desc}</p>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* STEP 2 - INFO REDUCED (PREVIOUSLY STEP 3) */}
                  {step === 2 && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-[var(--text-primary)]">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Título de tu meta</label>
                            <input 
                               type="text" 
                               placeholder="Ej: Mi primer Porsche, Viaje a Japón..." 
                               className="w-full h-16 bg-[var(--bg-secondary)] rounded-2xl px-6 font-bold text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 placeholder:text-[var(--text-muted)]"
                               value={formData.name || ''}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               required
                            />
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">¿Por qué es importante para ti?</label>
                            <textarea 
                               placeholder="Describe tu motivación..." 
                               className="w-full h-32 bg-[var(--bg-secondary)] rounded-2xl p-6 font-bold text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 resize-none placeholder:text-[var(--text-muted)]"
                               value={formData.description || ''}
                               onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Icono (Vectorial)</label>
                               <div className="flex flex-wrap gap-2">
                                  {LUCIDE_ICONS.map(i => (
                                     <button 
                                        key={i}
                                        type="button"
                                        onClick={() => setFormData({...formData, icon: i})}
                                        className={cn(
                                           "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                           formData.icon === i ? "bg-primary/10 text-primary scale-110 border border-primary/20 shadow-lg" : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-white/5"
                                        )}
                                     >
                                        {renderDynamicIcon(i, "w-5 h-5")}
                                     </button>
                                  ))}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Foto inspiracional</label>
                               <div 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="h-24 w-full bg-[var(--bg-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--bg-secondary)]/80 transition-colors overflow-hidden group"
                               >
                                  {imagePreview ? (
                                     <img src={imagePreview} className="w-full h-full object-cover" />
                                  ) : (
                                     <>
                                        <Upload className="w-5 h-5 text-[var(--text-muted)] group-hover:text-primary transition-colors" />
                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Subir Foto</span>
                                     </>
                                  )}
                                  <input 
                                     type="file" 
                                     ref={fileInputRef} 
                                     className="hidden" 
                                     accept="image/*" 
                                     onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                           const reader = new FileReader();
                                           reader.onloadend = () => setImagePreview(reader.result as string);
                                           reader.readAsDataURL(file);
                                        }
                                     }}
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                  )}

                  {/* STEP 3 - CONFIG (PREVIOUSLY STEP 4) */}
                  {step === 3 && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                         {formData.type === 'ahorro' || formData.type === 'regalo' ? (
                            <>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Monto Objetivo ($)</label>
                                  <input 
                                     type="text" 
                                     placeholder="0.00" 
                                     className="w-full h-20 bg-[var(--bg-secondary)] rounded-2xl px-6 text-3xl font-black text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 placeholder:text-[var(--text-muted)]"
                                     value={formData.target_amount || ''}
                                     onChange={(e) => setFormData({...formData, target_amount: parseMoney(e.target.value)})}
                                  />
                               </div>

                               {formData.goal_type_savings === 'linked_account' ? (
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Vincular con Cuenta</label>
                                     <select 
                                        className="w-full h-16 bg-[var(--bg-secondary)] rounded-2xl px-6 font-bold text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20"
                                        value={formData.linked_account_id || ''}
                                        onChange={(e) => setFormData({...formData, linked_account_id: e.target.value})}
                                        required
                                     >
                                        <option value="">Selecciona una cuenta...</option>
                                        {accounts.map(acc => (
                                           <option key={acc.id} value={acc.id}>{acc.nombre} (${Number(acc.saldo_actual).toLocaleString()})</option>
                                        ))}
                                     </select>
                                     <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest px-1">
                                        El progreso se sincronizará con el saldo de esta cuenta.
                                     </p>
                                  </div>
                               ) : (
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Ya tengo ahorrado</label>
                                     <input 
                                        type="text" 
                                        placeholder="0.00" 
                                        className="w-full h-14 bg-[var(--bg-secondary)] rounded-2xl px-5 font-bold text-[var(--text-primary)] border-none outline-none"
                                        value={formData.current_amount || ''}
                                        onChange={(e) => setFormData({...formData, current_amount: parseMoney(e.target.value)})}
                                     />
                                  </div>
                               )}
                               
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Fecha Objetivo</label>
                                  <div className="relative">
                                     <button
                                        type="button"
                                        onClick={() => dateInputRef.current?.showPicker?.()}
                                        className="w-full h-14 bg-[var(--bg-secondary)] rounded-2xl px-5 font-bold text-[var(--text-primary)] border border-[var(--border-color)] flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 transition-colors"
                                     >
                                        <div className="flex items-center gap-3">
                                           <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                              <Calendar className="w-4 h-4 text-primary" />
                                           </div>
                                           <span className={formData.deadline ? 'text-[var(--text-primary)] font-black text-sm' : 'text-[var(--text-muted)] font-medium text-sm'}>
                                              {formData.deadline
                                                 ? new Date(formData.deadline + 'T00:00:00').toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })
                                                 : 'Seleccionar fecha'}
                                           </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                                     </button>
                                     <input
                                        ref={dateInputRef}
                                        type="date"
                                        className="absolute inset-0 opacity-0 pointer-events-none"
                                        value={formData.deadline || ''}
                                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                                     />
                                  </div>
                               </div>
                            </>
                         ) : formData.type === 'gasto' ? (
                           <>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Límite Mensual ($)</label>
                                  <input 
                                     type="text" 
                                    placeholder="0.00" 
                                    className="w-full h-20 bg-[var(--bg-secondary)] rounded-2xl px-6 text-3xl font-black text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 placeholder:text-[var(--text-muted)]"
                                    value={formData.target_amount || ''}
                                    onChange={(e) => setFormData({...formData, target_amount: parseMoney(e.target.value)})}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Categoría a Controlar</label>
                                 <select 
                                    className="w-full h-14 bg-[var(--bg-secondary)] rounded-2xl px-5 font-bold text-[var(--text-primary)] border-none outline-none cursor-pointer"
                                    value={formData.target_category || ''}
                                    onChange={(e) => setFormData({...formData, target_category: e.target.value})}
                                 >
                                    <option value="">Selecciona categoría</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                 </select>
                              </div>
                           </>
                        ) : formData.type === 'habito' ? (
                           <>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Porcentaje de ahorro mensual (%)</label>
                                 <input 
                                    type="text" 
                                    placeholder="20" 
                                    className="w-full h-20 bg-[var(--bg-secondary)] rounded-2xl px-6 text-3xl font-black text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20"
                                    value={formData.target_percentage || ''}
                                    onChange={(e) => setFormData({...formData, target_percentage: e.target.value})}
                                 />
                              </div>
                           </>
                        ) : (
                           // For Ingreso and Deuda, generic fields for now
                           <>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Monto Objetivo ($)</label>
                                  <input 
                                     type="text" 
                                    placeholder="0.00" 
                                    className="w-full h-20 bg-[var(--bg-secondary)] rounded-2xl px-6 text-3xl font-black text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 placeholder:text-[var(--text-muted)]"
                                    value={formData.target_amount || ''}
                                    onChange={(e) => setFormData({...formData, target_amount: parseMoney(e.target.value)})}
                                 />
                              </div>
                              {formData.type === 'deuda' && (
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Cuenta/Tarjeta Vinculada</label>
                                    <select 
                                       className="w-full h-14 bg-[var(--bg-secondary)] rounded-2xl px-5 font-bold text-[var(--text-primary)] border-none outline-none cursor-pointer"
                                       value={formData.target_account_id || ''}
                                       onChange={(e) => setFormData({...formData, target_account_id: e.target.value})}
                                    >
                                       <option value="">Selecciona cuenta</option>
                                       {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                 </div>
                              )}
                           </>
                        )}
                      </div>
                  )}
               </div>

               {/* Footer */}
               <div className="p-8 border-t border-[var(--border-color)] flex items-center justify-between gap-4">
                  {step > 1 ? (
                     <button 
                        onClick={handleBack}
                        className="h-14 px-8 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black uppercase tracking-widest text-[11px] hover:bg-[var(--bg-secondary)]/80 transition-all border border-[var(--border-color)]"
                     >Atrás</button>
                  ) : (
                     <button 
                        onClick={() => setActiveModal(false)}
                        className="h-14 px-8 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-black uppercase tracking-widest text-[11px] hover:bg-[var(--bg-secondary)]/80 transition-all border border-[var(--border-color)]"
                     >Cancelar</button>
                  )}
                  
                  {step < 3 ? (
                     <button 
                        onClick={handleNext}
                        disabled={(step === 2 && !formData.name)}
                        className="h-14 flex-1 bg-white text-[#1A2234] rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                     >
                        Siguiente
                        <ArrowRight className="w-4 h-4" />
                     </button>
                  ) : (
                     <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || successStatus}
                        className="h-14 flex-1 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                        {isSubmitting ? (
                          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : successStatus ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <>
                            Crear Meta
                            <CheckCircle2 className="w-4 h-4" />
                          </>
                        )}
                     </button>
                  )}
                </div>
            </div>
         </DialogContent>
    </Dialog>

    {/* 💰 ABONAR MANUAL MODAL */}
    <Dialog open={!!activeContributionModal} onOpenChange={(o) => { if(!o) setActiveContributionModal(null); }}>
       <DialogContent className="rounded-[3rem] sm:max-w-md p-0 overflow-hidden border-none shadow-3xl bg-[var(--bg-card)]">
          <div className="flex flex-col h-full">
             <div className="p-8 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none uppercase italic">Abonar a Meta</h2>
                   <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mt-2 shrink-0">Reserva de fondos</p>
                </div>
                <button onClick={() => setActiveContributionModal(null)} className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <form onSubmit={handleContributionSubmit} className="p-8 space-y-6">
                {errorStatus && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-[10px] uppercase">{errorStatus}</p>
                  </div>
                )}

                {successStatus && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-[10px] uppercase">¡Abono registrado! ✨</p>
                  </div>
                )}

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Monto a abonar ($)</label>
                   <input 
                      type="text" 
                      placeholder="0.00" 
                      className="w-full h-20 bg-[var(--bg-secondary)] rounded-2xl px-6 text-3xl font-black text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 placeholder:text-[var(--text-muted)]"
                      value={contributionData.amount}
                      onChange={(e) => setContributionData({...contributionData, amount: parseMoney(e.target.value)})}
                      autoFocus
                      required
                   />
                   <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest px-1">
                      Este monto se restará de tu saldo disponible libre.
                   </p>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Fecha</label>
                   <input 
                      type="date" 
                      className="w-full h-14 bg-[var(--bg-secondary)] rounded-2xl px-6 font-bold text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20"
                      value={contributionData.date}
                      onChange={(e) => setContributionData({...contributionData, date: e.target.value})}
                      required
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 italic">Nota (opcional)</label>
                   <input 
                      type="text" 
                      placeholder="Ej: Ahorro de la semana" 
                      className="w-full h-14 bg-[var(--bg-secondary)] rounded-2xl px-6 font-bold text-[var(--text-primary)] border-none outline-none focus:ring-2 ring-primary/20 placeholder:text-[var(--text-muted)]"
                      value={contributionData.note}
                      onChange={(e) => setContributionData({...contributionData, note: e.target.value})}
                   />
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                      type="button"
                      onClick={() => setActiveContributionModal(null)} 
                      className="flex-1 py-4 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-2xl font-black uppercase tracking-widest text-[10px] border border-[var(--border-color)]"
                   >
                      Cancelar
                   </button>
                   <button 
                      type="submit"
                      disabled={isContributing || successStatus}
                      className="flex-3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                   >
                      {isContributing ? 'Registrando...' : 'Confirmar Abono'}
                      <ArrowUpRight className="w-4 h-4" />
                   </button>
                </div>
             </form>
          </div>
       </DialogContent>
    </Dialog>
    </>
  );
}
