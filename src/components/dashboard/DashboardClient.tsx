"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatRelative, format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Receipt,
  TrendingUp,
  Wallet,
  Plus,
  Bell,
  BellRing,
  User,
  PieChart,
  Target,
  ChevronRight,
  LogOut,
  CreditCard,
  Settings,
  Trash2,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Coffee,
  Car,
  ShoppingBag,
  Clock,
  Calendar,
  AlertCircle,
  LayoutDashboard,
  Sun,
  Moon,
  ArrowLeftRight,
  PiggyBank,
  Sparkles,
  X,
  CheckCircle2,
  RotateCw,
  Check,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { useTheme } from '@/hooks/useTheme';
import { transferBetweenAccounts } from '@/app/dashboard/actions';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { CashFlowMiniChart } from '@/components/dashboard/CashFlowMiniChart';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import { NewTransactionModal } from '@/components/modals/NewTransactionModal';
import { triggerUserNotifications } from "@/app/notifications/actions";
import { PushBanner } from "@/components/notifications/PushBanner";
import { NewReminderModal } from '@/components/modals/NewReminderModal';
import { calculateGoalProgress, calculateRealAmount } from "@/lib/goalProgress";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { parseMoney } from '@/lib/format';
import { 
  addExpense, 
  addIncome, 
  deleteMovement, 
  signOut
} from '@/app/dashboard/actions';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { useRealtime } from '@/hooks/useRealtime';

interface DashboardClientProps {
  initialProfile: any;
  initialExpenses: any[];
  initialIncomes: any[];
  yearExpenses: any[];
  prevYearExpenses: any[];
  allTransactions: any[];
  bankAccounts: any[];
  creditCards: any[];
  reminders: any[];
  savingsGoals: any[];
  goalContributions: any[];
  userSettings: any;
  debts: any[];
}

export default function DashboardClient({ 
  initialProfile, 
  initialExpenses, 
  initialIncomes: propIncomes, 
  yearExpenses: propYearExpenses,
  prevYearExpenses,
  allTransactions,
  bankAccounts: propBankAccounts,
  creditCards: propCreditCards,
  reminders: propReminders,
  savingsGoals: propGoals,
  goalContributions: propGoalContributions,
  userSettings,
  debts: propDebts,
}: DashboardClientProps) {
  const [periodFilter, setPeriodFilter] = useState<'dia' | 'semana' | 'mes' | 'anual' | 'todos'>('mes');
  const [activeModal, setActiveModal] = useState<'gasto' | 'ingreso' | 'detalle' | 'recordatorio' | 'ver_mas' | 'balance_breakdown' | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Realtime State
  const [expenses, setExpenses] = useState(propYearExpenses);
  const [incomes, setIncomes] = useState(propIncomes);
  const [bankAccounts, setBankAccounts] = useState(propBankAccounts);
  const [creditCards, setCreditCards] = useState(propCreditCards);
  const [reminders, setReminders] = useState(propReminders);
  const [savingsGoals, setGoals] = useState(propGoals);
  const [goalContributions, setGoalContributions] = useState(propGoalContributions);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cashBalance, setCashBalance] = useState(Number(initialProfile?.cash_balance) || 0);
  const [debts, setDebts] = useState(propDebts);

  // Reminder interaction state
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null);
  const [pendingConfirmTimer, setPendingConfirmTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [paidThisCycle, setPaidThisCycle] = useState<Set<string>>(new Set());
  const [snoozePickerId, setSnoozePickerId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Transfer State
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferFrom, setTransferFrom] = useState<string>("");
  const [transferTo, setTransferTo] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const userId = initialProfile?.id;
  const supabase = createClient();

  // Realtime Subscriptions
  useRealtime({
    table: 'expenses',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => { setExpenses(prev => [newVal, ...prev]); router.refresh(); },
    onUpdate: (updated) => { setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e)); router.refresh(); },
    onDelete: (deleted) => { setExpenses(prev => prev.filter(e => e.id !== deleted.id)); router.refresh(); }
  });

  useRealtime({
    table: 'incomes',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => { setIncomes(prev => [newVal, ...prev]); router.refresh(); },
    onUpdate: (updated) => { setIncomes(prev => prev.map(i => i.id === updated.id ? updated : i)); router.refresh(); },
    onDelete: (deleted) => { setIncomes(prev => prev.filter(i => i.id !== deleted.id)); router.refresh(); }
  });

  useRealtime({
    table: 'credit_cards',
    filter: `user_id=eq.${userId}`,
    onUpdate: (updated) => { setCreditCards(prev => prev.map(c => c.id === updated.id ? updated : c)); router.refresh(); }
  });

  useRealtime({
    table: 'bank_accounts',
    filter: `user_id=eq.${userId}`,
    onUpdate: (updated) => { setBankAccounts(prev => prev.map(a => a.id === updated.id ? updated : a)); router.refresh(); }
  });

  // Fetch notifications
  useEffect(() => {
    if (userId) {
      const fetchNotifications = async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        if (data) setNotifications(data);
      };
      fetchNotifications();
      triggerUserNotifications().catch(console.error);
    }
  }, [userId]);

  useRealtime({
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setNotifications(prev => [newVal, ...prev]),
    onUpdate: (updated) => setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n)),
    onDelete: (deleted) => setNotifications(prev => prev.filter(n => n.id !== deleted.id))
  });

  useRealtime({
    table: 'savings_goals',
    filter: `user_id=eq.${userId}`,
    onInsert: (newGoal) => setGoals(prev => [newGoal, ...prev]),
    onUpdate: (updatedGoal) => setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g)),
    onDelete: (deletedGoal) => setGoals(prev => prev.filter(g => g.id !== deletedGoal.id))
  });

  useRealtime({
    table: 'goal_contributions',
    filter: `user_id=eq.${userId}`,
    onInsert: (newCont) => setGoalContributions(prev => [...prev, newCont]),
    onUpdate: (updatedCont) => setGoalContributions(prev => prev.map(c => c.id === updatedCont.id ? updatedCont : c)),
    onDelete: (deletedCont) => setGoalContributions(prev => prev.filter(c => c.id !== deletedCont.id))
  });

  useRealtime({
    table: 'profiles',
    filter: `id=eq.${userId}`,
    onUpdate: (updated) => setCashBalance(Number(updated.cash_balance) || 0)
  });

  // Sync Props to State (Single Source of Truth)
  useEffect(() => {
    setExpenses(propYearExpenses);
    setIncomes(propIncomes);
    setBankAccounts(propBankAccounts);
    setCreditCards(propCreditCards);
    setReminders(propReminders);
    setGoals(propGoals);
    setGoalContributions(propGoalContributions);
    setCashBalance(Number(initialProfile?.cash_balance) || 0);
    setDebts(propDebts);
  }, [propYearExpenses, propIncomes, propBankAccounts, propCreditCards, propReminders, propGoals, propGoalContributions, initialProfile, propDebts]);

  // Reactive recent movements — combines live expenses + incomes states
  const MOVEMENTS_LIMIT = 5;
  const [showAllMovements, setShowAllMovements] = useState(false);

  const recentMovements = useMemo(() => {
    const exps = expenses.map((e: any) => ({
      ...e,
      type: 'expense',
      date: e.fecha || e.created_at || '',
      concept: e.descripcion || e.comercio || '',
      category: e.categoria || '',
      amount: e.monto,
    }));
    const incs = incomes.map((i: any) => ({
      ...i,
      type: 'income',
      date: i.fecha || i.created_at?.split('T')[0] || '',
      concept: i.descripcion || i.nombre || 'Ingreso',
      category: i.categoria || 'ingreso',
      amount: i.monto,
    }));
    return [...exps, ...incs]
      .filter(m => m.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, incomes]);

  const visibleMovements = showAllMovements ? recentMovements : recentMovements.slice(0, MOVEMENTS_LIMIT);

  const unreadCount = notifications.filter(n => !n.leido).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ leido: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ leido: true }).eq('user_id', userId).eq('leido', false);
    setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
  };

  const showSuccessToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCheckClick = (rem: any) => {
    if (pendingConfirmTimer) clearTimeout(pendingConfirmTimer);
    setPendingConfirm(rem.id);
    const timer = setTimeout(() => setPendingConfirm(null), 4000);
    setPendingConfirmTimer(timer);
  };

  const handleConfirmPaid = async (rem: any) => {
    setPendingConfirm(null);
    if (pendingConfirmTimer) clearTimeout(pendingConfirmTimer);
    try {
      // 1. Register real expense
      if (rem.monto) {
        await supabase.from('expenses').insert({
          user_id: userId,
          monto: rem.monto,
          comercio: rem.nombre,
          descripcion: rem.nombre,
          fecha: new Date().toISOString().split('T')[0],
          origen: 'recordatorio',
          categoria: rem.type === 'subscription' ? 'suscripciones' : rem.type === 'card_payment' ? 'tarjeta' : 'otros',
          metodo_pago: 'efectivo',
        });
      }
      // 2. Advance date or complete
      if (rem.is_recurring) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextDate = new Date(rem.fecha);
        // Advance until the next occurrence is in the future
        while (nextDate <= today) {
          if (rem.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
          else if (rem.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
          else if (rem.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 15);
          else if (rem.frequency === 'annual') nextDate.setFullYear(nextDate.getFullYear() + 1);
          else nextDate.setMonth(nextDate.getMonth() + 1);
        }
        const newDateStr = nextDate.toISOString().split('T')[0];
        await supabase.from('reminders').update({ fecha: newDateStr }).eq('id', rem.id);
        setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, fecha: newDateStr } : r));
      } else {
        await supabase.from('reminders').update({ status: 'completed' }).eq('id', rem.id);
        setReminders(prev => prev.filter(r => r.id !== rem.id));
      }
      // 3. Visual paid state for this cycle (keep hidden for the session)
      setPaidThisCycle(prev => new Set(Array.from(prev).concat(rem.id)));
      showSuccessToast('Gasto registrado y recordatorio actualizado.');
    } catch (err) {
      console.error('Error marking reminder as paid:', err);
    }
  };

  const handleSnooze = async (rem: any, days: number) => {
    setSnoozePickerId(null);
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toISOString().split('T')[0];
    await supabase.from('reminders').update({ fecha: newDateStr }).eq('id', rem.id);
    setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, fecha: newDateStr } : r));
  };

  const handleDeleteReminder = async (id: string) => {
    await supabase.from('reminders').update({ status: 'deleted' }).eq('id', id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleTransfer = async () => {
    if (!transferFrom || !transferTo || !transferAmount || Number(transferAmount) <= 0) return;
    
    setIsTransferring(true);
    const amount = Number(transferAmount);

    // Optimistic Update
    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === transferFrom) return { ...acc, saldo_actual: Number(acc.saldo_actual) - amount };
      if (acc.id === transferTo) return { ...acc, saldo_actual: Number(acc.saldo_actual) + amount };
      return acc;
    }));

    try {
      const res = await transferBetweenAccounts(transferFrom, transferTo, amount, "Transferencia interna");
      if (res.success) {
        setTransferAmount("");
        setShowTransferForm(false);
      }
    } catch (err: any) {
      alert("Error en la transferencia: " + err.message);
      // Rollback
      setBankAccounts(propBankAccounts);
    } finally {
      setIsTransferring(false);
    }
  };

  // Load period filter from localStorage

  // Data helpers
  const now = new Date();
  const getGreeting = () => {
    const hour = now.getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };
  const normalAccounts = [
    ...bankAccounts.filter(a => a.tipo_cuenta === 'corriente' || a.tipo_cuenta === 'nomina'),
    ...creditCards.filter(c => c.tipo_tarjeta === 'debito').map(c => ({
      id: c.id,
      alias: c.nombre_tarjeta,
      nombre_banco: c.nombre_banco,
      saldo_actual: c.saldo_actual,
      isDebitCard: true,
      color: c.color,
      icon_name: 'CreditCard'
    }))
  ].sort((a, b) => {
    // Cash always first
    // Cash (default) always first
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return 0;
  });
  const savingsAccounts = bankAccounts.filter(a => a.tipo_cuenta === 'ahorro');
  const totalCreditDebt = creditCards.filter(c => c.tipo_tarjeta === 'credito').reduce((acc, c) => acc + Number(c.saldo_actual), 0);

  // availableBalance calculation
  const currentMonthStart = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []);

  const totalSpentThisMonth = useMemo(() => {
    return (expenses || [])
      .filter(e => {
        const d = new Date(e.fecha);
        return d >= currentMonthStart;
      })
      .reduce((acc: number, e: any) => acc + Number(e.monto), 0);
  }, [expenses, currentMonthStart]);

  // Available Balance: spendable accounts (Banks Corriente/Nomina + Debit Cards)
  // We don't subtract totalSpentThisMonth because the account balances in the DB already reflect those expenses.
  const rawAccountBalance = normalAccounts.reduce((acc: number, a: any) => acc + Number(a.saldo_actual), 0);
  const savingsBalance = savingsAccounts.reduce((acc: number, a: any) => acc + Number(a.saldo_actual), 0);
  const totalAssets = rawAccountBalance + savingsBalance; // Wealth is the sum of account balances

  // Breakdown calculations — count ALL income sources (activo may be null/false on legacy records)
  const totalMonthlyIncomes = incomes.reduce((acc: number, i: any) => acc + Number(i.monto), 0);
  const totalMonthlyExpenses = expenses.filter(e => {
    const d = new Date(e.fecha);
    return d >= currentMonthStart;
  }).reduce((acc: number, e: any) => acc + Number(e.monto), 0);
  const totalDebtInstallments = debts.filter(d => d.activa).reduce((acc: number, d: any) => acc + Number(d.cuota_mensual), 0);
  const totalMinPayments = creditCards.filter(c => c.tipo_tarjeta === 'credito').reduce((acc: number, c: any) => {
    const minPercent = Number(c.pago_minimo_porcentaje) || 5;
    return acc + (Number(c.saldo_actual) * (minPercent / 100));
  }, 0);
  
  // Available Balance = Saldo real cuentas débito - Cuotas deudas - Pagos mínimos TC
  // We no longer subtract totalMonthlyExpenses because they are already auto-deducted from bank balance via the RPC on registration.
  const availableBalance = rawAccountBalance - totalDebtInstallments - totalMinPayments;
  const freeBalance = availableBalance;

  // Remove obsolete alerts and references
  // The logic for virtualReserved and virtualGoals has been simplified
  // and is now handled directly in the Ver Desglose modal if needed.

  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = (currentDay / daysInMonth) * 100;

  // PERIOD DATA CALCULATION
  const getPeriodData = (filter: string) => {
    let start = new Date(now);
    let prevStart = new Date(now);
    let prevEnd = new Date(now);

    if (filter === 'todos') {
      start = new Date(0);
      prevStart = new Date(0);
      prevEnd = new Date(0);
    } else if (filter === 'dia') {
      start.setHours(0, 0, 0, 0);
      prevStart.setDate(now.getDate() - 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (filter === 'semana') {
      const day = now.getDay();
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      prevStart.setDate(start.getDate() - 7);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(start.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (filter === 'mes') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      prevStart.setMonth(now.getMonth() - 1, 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setMonth(now.getMonth(), 0);
      prevEnd.setHours(23, 59, 59, 999);
    } else { // anual
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      prevStart.setFullYear(now.getFullYear() - 1, 0, 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setFullYear(now.getFullYear() - 1, 11, 31);
      prevEnd.setHours(23, 59, 59, 999);
    }

    const parseAsLocal = (dStr: string) => {
      if (!dStr) return new Date();
      const parts = dStr.split('T')[0].split('-');
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    const todayStr = now.toLocaleDateString('en-CA');
    const yesterdayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toLocaleDateString('en-CA');

    const currentExpenses = (expenses || []).filter(e => {
      if (filter === 'dia') return e.fecha.split('T')[0] === todayStr;
      return parseAsLocal(e.fecha) >= start;
    });

    const comparativeSource = filter === 'anual' ? prevYearExpenses : (expenses || []).concat(prevYearExpenses || []);
    const previousExpenses = comparativeSource.filter((e: any) => {
        if (filter === 'dia') return e.fecha.split('T')[0] === yesterdayStr;
        const d = parseAsLocal(e.fecha);
        return d >= prevStart && d <= prevEnd;
    });

    const totalSpent = currentExpenses.reduce((acc: number, e: any) => acc + Number(e.monto), 0);
    const prevTotalSpent = previousExpenses.reduce((acc: number, e: any) => acc + Number(e.monto), 0);
    
    // Incomes (Linked to real transactions)
    const incDate = (i: any) => i.fecha || i.created_at || i.date;
    const incAmount = (i: any) => Number(i.monto ?? i.amount ?? 0);

    const currentIncomes = (incomes || []).filter(i => {
      if (filter === 'dia') return incDate(i).split('T')[0] === todayStr;
      return parseAsLocal(incDate(i)) >= start;
    });

    const totalIncome = currentIncomes.reduce((acc: number, i: any) => acc + incAmount(i), 0);

    const diffPercent = prevTotalSpent > 0 ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 : 0;

    return { currentExpenses, totalSpent, prevTotalSpent, totalIncome, diffPercent };
  };

  const { currentExpenses, totalSpent, totalIncome, diffPercent } = useMemo(
    () => getPeriodData(periodFilter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [periodFilter, expenses, incomes]
  );
  const monthBalance = totalIncome - totalSpent;
  const projectedSavings = monthBalance > 0 ? (monthBalance / currentDay) * daysInMonth : 0;

  // Category breakdown — memoizado para no recalcular en cada render
  const { sortedCategories, top2 } = useMemo(() => {
    const summary = currentExpenses.reduce((acc: any, exp: any) => {
      const cat = exp.categoria || 'Otros';
      acc[cat] = (acc[cat] || 0) + Number(exp.monto);
      return acc;
    }, {});
    const sorted = Object.entries(summary)
      .map(([name, amount]) => ({
        name,
        amount: Number(amount),
        percentage: totalSpent > 0 ? (Number(amount) / totalSpent) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
    return { sortedCategories: sorted, top2: sorted.slice(0, 2) };
  }, [currentExpenses, totalSpent]);

  const getInsight = () => {
    if (monthBalance < 0) return "⚠️ Cuidado, estás gastando más de lo que entra";
    if (totalSpent > (totalIncome * 0.8)) return "Tus gastos están cerca del 80% de tus ingresos.";
    return "Tus finanzas van por buen camino. ¡Sigue así! 🚀";
  };

  const categoriesUI = [
    { name: "Total Gastos", amount: totalSpent, icon: Receipt, iconBg: '#fee2e2', iconColor: '#ef4444' },
    { name: "Ganancias", amount: totalIncome, icon: TrendingUp, iconBg: '#dcfce7', iconColor: '#22c55e' },
    ...top2.map(c => ({
      name: c.name,
      amount: c.amount,
      icon: c.name.toLowerCase().includes('comida') ? Coffee : c.name.toLowerCase().includes('transporte') ? Car : ShoppingBag,
      iconBg: '#eff6ff',
      iconColor: '#3b82f6'
    }))
  ];


  const handleCreateExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addExpense(formData);
    setActiveModal(null);
    router.refresh();
  };

  const handleCreateIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await addIncome(formData);
    setActiveModal(null);
    router.refresh();
  };

  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-global)] page-transition relative">
      {/* Success toast */}
      {successToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-500 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-2 pointer-events-none">
          <Check className="w-4 h-4" />
          {successToast}
        </div>
      )}
      {/* keyframes for check button animation */}
      <style>{`@keyframes reminderCheckIn { from { transform: scale(0.8); } to { transform: scale(1); } }`}</style>
      <div className="relative z-10 w-full">
        {/* Hero section with Curves */}
         <div 
           className="section-hero h-[320px] md:h-[260px] flex flex-col items-center w-full relative" 
           style={{ 
             borderBottomLeftRadius: '40px', 
             borderBottomRightRadius: '40px', 
             borderTopLeftRadius: '0px', 
             borderTopRightRadius: '0px', 
             overflow: 'hidden',
             background: 'var(--buco-gradient)'
           }}
         >
           {/* Visual Effects */}
           <div className="absolute inset-0 bg-black/10 pointer-events-none" />
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
          
          <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-between h-full px-6 md:px-8 py-7 md:py-8">
            {/* TOP BAR: Greeting & Profile Actions */}
            <div className="flex items-start justify-between w-full gap-4">
              <div className="animate-in fade-in slide-in-from-left duration-700 max-w-[70%]">
                <h1 className="text-2xl md:text-3xl font-black text-white leading-none tracking-tight">
                  {getGreeting()}, {initialProfile?.nombre?.split(' ')[0] || "papa"}
                </h1>
                <p className="text-[11px] md:text-sm text-white/70 font-medium mt-2 opacity-80">
                  Resumen financiero listo para hoy.
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                {/* Theme Toggle — Header (36px circular) */}
                <button
                  onClick={() => {
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                    if (newTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                    localStorage.setItem('buco-theme', newTheme);
                  }}
                  className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer hover:bg-white/20"
                  title={theme === 'dark' ? 'Cambiar a modo luz' : 'Cambiar a modo oscuro'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <NotificationsModal 
                  userId={initialProfile.id} 
                  trigger={
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer relative">
                      <Bell className="w-4 h-4 md:w-5 md:h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#1450A0]">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  } 
                />
                <Link
                  href="/goals"
                  className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 flex items-center justify-center text-white font-black overflow-hidden relative cursor-pointer hover:bg-white/20 transition-all"
                >
                  <Target className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </div>
            </div>

            {/* BOTTOM BAR: Balance & Info Pill — centrado en móvil */}
            <div className="flex flex-col items-center md:flex-row md:items-end md:justify-between w-full gap-3 animate-in slide-in-from-bottom duration-700 pb-2">
               <div className="flex flex-col items-center md:items-start">
                <div className="flex flex-col">
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest mb-1 italic">Saldo Disponible</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        <CurrencyDisplay amount={freeBalance} />
                    </h2>
                    <Dialog open={activeModal === 'balance_breakdown'} onOpenChange={(open) => setActiveModal(open ? 'balance_breakdown' : null)}>
                      <DialogTrigger>
                        <div className="text-[var(--text-muted)] text-[10px] uppercase font-black tracking-widest mt-2 hover:text-white transition-all flex items-center gap-1 cursor-pointer">
                            VER DESGLOSE <ChevronRight className="w-3 h-3" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="bg-[var(--bg-card)] border-none text-[var(--text-primary)] p-0 overflow-hidden sm:max-w-[420px] w-[92vw] rounded-[24px] shadow-3xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-1/2 md:bottom-auto">
                        <div className="flex flex-col max-h-[85vh]">
                           {/* Header */}
                           <div className="p-6 pb-2 flex justify-between items-center border-b border-[var(--border-color)]">
                              <h3 className="text-xl font-black uppercase italic tracking-tighter">Ver Desglose</h3>
                              <X className="w-5 h-5 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors" onClick={() => setActiveModal(null)} />
                           </div>

                           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                               {/* RESUMEN ACTUAL CALCULO */}
                               <section className="space-y-4">
                                  <div className="flex items-center justify-between px-1">
                                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] italic">Cálculo de Flujo</h4>
                                     <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Saldo Mensual</span>
                                  </div>
                                  
                                  <div className="space-y-3">
                                     {/* SALDO CUENTAS DÉBITO (+) */}
                                     <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                              <TrendingUp className="w-4 h-4 text-emerald-500" />
                                           </div>
                                           <div className="flex flex-col">
                                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Saldo Cuentas Débito</span>
                                              <span className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-wider">Corriente · Nómina · Débito</span>
                                           </div>
                                        </div>
                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                           +<CurrencyDisplay amount={rawAccountBalance} />
                                        </span>
                                     </div>

                                     {/* GASTOS (-) */}
                                     <div className="flex justify-between items-center p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                              <TrendingDown className="w-4 h-4 text-red-500" />
                                           </div>
                                           <div className="flex flex-col">
                                              <span className="text-xs font-black text-red-600 dark:text-red-400">Gastos del Mes</span>
                                              <span className="text-[9px] font-bold text-red-500/50 uppercase tracking-wider">Transacciones Realizadas</span>
                                           </div>
                                        </div>
                                        <span className="font-black text-red-600 dark:text-red-400 text-sm">
                                           -<CurrencyDisplay amount={totalMonthlyExpenses} />
                                        </span>
                                     </div>

                                     {/* DEUDAS (-) */}
                                     <div className="flex justify-between items-center p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                                              <AlertCircle className="w-4 h-4 text-orange-500" />
                                           </div>
                                           <div className="flex flex-col">
                                              <span className="text-xs font-black text-orange-600 dark:text-orange-400">Cuotas de Deudas</span>
                                              <span className="text-[9px] font-bold text-orange-500/50 uppercase tracking-wider">Préstamos y Otros</span>
                                           </div>
                                        </div>
                                        <span className="font-black text-orange-600 dark:text-orange-400 text-sm">
                                           -<CurrencyDisplay amount={totalDebtInstallments} />
                                        </span>
                                     </div>

                                     {/* PAGOS MINIMOS (-) */}
                                     <div className="flex justify-between items-center p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                              <CreditCard className="w-4 h-4 text-indigo-500" />
                                           </div>
                                           <div className="flex flex-col">
                                              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Pagos Mínimos TC</span>
                                              <span className="text-[9px] font-bold text-indigo-500/50 uppercase tracking-wider">Tarjetas de Crédito</span>
                                           </div>
                                        </div>
                                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">
                                           -<CurrencyDisplay amount={totalMinPayments} />
                                        </span>
                                     </div>
                                  </div>
                               </section>

                               {/* SECCIÓN 2: DETALLE DE CUENTAS */}
                               <section className="space-y-4">
                                  <div className="flex items-center justify-between px-1">
                                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] italic">Distribución de Fondos</h4>
                                     <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Saldo Real</span>
                                  </div>
                                  <div className="space-y-2">
                                     {normalAccounts.map(acc => (
                                        <div key={acc.id} className="flex justify-between items-center p-3.5 bg-white/5 rounded-2xl border border-white/5">
                                           <div className="flex flex-col">
                                              <span className="text-xs font-black text-[var(--text-primary)]">{acc.alias}</span>
                                              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{acc.nombre_banco}</span>
                                           </div>
                                           <span className="font-black text-[var(--text-primary)] text-sm"><CurrencyDisplay amount={Number(acc.saldo_actual)} /></span>
                                        </div>
                                     ))}
                                  </div>
                               </section>

                              {/* SECCIÓN 2: CUENTA DE AHORRO */}
                              <section className="space-y-4 p-5 bg-blue-500/5 rounded-[24px] border border-blue-500/10 border-dashed">
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <PiggyBank className="w-4 h-4 text-blue-500" />
                                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">Cuenta de Ahorro</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest">Apartado</span>
                                 </div>
                                 
                                 <div className="space-y-2">
                                    {savingsAccounts.length === 0 ? (
                                       <div className="text-center py-2">
                                          <p className="text-[10px] text-blue-500/40 font-black uppercase tracking-widest">Sin cuentas de ahorro</p>
                                       </div>
                                    ) : (
                                       savingsAccounts.map(acc => (
                                          <div key={acc.id} className="flex justify-between items-center">
                                             <span className="text-xs font-black text-blue-500/80">{acc.alias}</span>
                                             <span className="font-black text-blue-500 text-lg">${Number(acc.saldo_actual).toLocaleString()}</span>
                                          </div>
                                       ))
                                    )}
                                 </div>

                                 <div className="pt-2 space-y-3">
                                    <p className="text-[9px] font-bold text-blue-500/60 uppercase italic tracking-wider leading-relaxed">
                                       "Este dinero está apartado y no cuenta como saldo disponible para gastos del día a día."
                                    </p>
                                    
                                    {!showTransferForm ? (
                                       <button 
                                          onClick={() => setShowTransferForm(true)}
                                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                                       >
                                          <ArrowLeftRight className="w-3 h-3" /> Transferir
                                       </button>
                                    ) : (
                                       <div className="space-y-3 p-4 bg-white/5 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                          <div className="grid grid-cols-2 gap-2">
                                             <div className="space-y-1">
                                                <label className="text-[8px] font-black text-blue-500/60 uppercase">Desde</label>
                                                <select 
                                                   value={transferFrom} 
                                                   onChange={(e) => setTransferFrom(e.target.value)}
                                                   className="w-full bg-[var(--bg-secondary)] text-[10px] font-bold p-2 rounded-lg outline-none"
                                                >
                                                   <option value="">Origen...</option>
                                                   {[...normalAccounts, ...savingsAccounts].map(acc => (
                                                      <option key={acc.id} value={acc.id}>{acc.alias}</option>
                                                   ))}
                                                </select>
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[8px] font-black text-blue-500/60 uppercase">Hacia</label>
                                                <select 
                                                   value={transferTo} 
                                                   onChange={(e) => setTransferTo(e.target.value)}
                                                   className="w-full bg-[var(--bg-secondary)] text-[10px] font-bold p-2 rounded-lg outline-none"
                                                >
                                                   <option value="">Destino...</option>
                                                   {[...normalAccounts, ...savingsAccounts].map(acc => (
                                                      <option key={acc.id} value={acc.id}>{acc.alias}</option>
                                                   ))}
                                                </select>
                                             </div>
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[8px] font-black text-blue-500/60 uppercase">Monto</label>
                                             <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-500 text-[10px] font-bold">$</span>
                                                <input 
                                                   type="text" 
                                                   value={transferAmount}
                                                   onChange={(e) => setTransferAmount(parseMoney(e.target.value))}
                                                   placeholder="0.00"
                                                   className="w-full bg-[var(--bg-secondary)] pl-5 pr-2 py-2 rounded-lg text-xs font-black outline-none"
                                                />
                                             </div>
                                          </div>
                                          <div className="flex gap-2 pt-1">
                                             <button 
                                                onClick={handleTransfer}
                                                disabled={isTransferring || !transferAmount || !transferFrom || !transferTo}
                                                className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                                             >
                                                Confirmar
                                             </button>
                                             <button 
                                                onClick={() => setShowTransferForm(false)}
                                                className="px-3 py-1.5 text-[var(--text-muted)] text-[9px] font-black uppercase hover:text-[var(--text-primary)]"
                                             >
                                                Cancelar
                                             </button>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </section>

                              {/* SECCIÓN 3: TARJETAS DE CRÉDITO (Deuda) */}
                              <section className="space-y-4">
                                 <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/70 italic">Tarjetas de Crédito</h4>
                                    <span className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest">Deuda Actual</span>
                                 </div>
                                 <div className="space-y-2">
                                    {creditCards.filter(c => c.tipo_tarjeta === 'credito').length === 0 ? (
                                       <p className="text-[10px] text-[var(--text-muted)] font-medium px-1">Sin deudas registradas</p>
                                    ) : (
                                       creditCards.filter(c => c.tipo_tarjeta === 'credito').map(card => (
                                          <div key={card.id} className="flex justify-between items-center p-3.5 bg-red-500/5 rounded-2xl border border-red-500/10">
                                             <div className="flex flex-col">
                                                <span className="text-xs font-black text-red-600 dark:text-red-400">{card.nombre_tarjeta}</span>
                                                <span className="text-[9px] font-bold text-red-500/50 uppercase tracking-wider">{card.nombre_banco}</span>
                                             </div>
                                             <span className="font-black text-red-600 dark:text-red-400 text-sm">-${Number(card.saldo_actual).toLocaleString()}</span>
                                          </div>
                                       ))
                                    )}
                                 </div>
                                 <div className="pt-2 flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase text-red-500/60">Deuda Total Tarjetas</span>
                                    <span className="font-black text-red-600 dark:text-red-400 text-xs">${totalCreditDebt.toLocaleString()}</span>
                                 </div>
                              </section>
                           </div>

                           {/* Footer */}
                           <div className="p-8 pt-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                              <div className="flex justify-between items-center">
                                 <div className="space-y-0.5">
                                    <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-[0.1em] italic leading-tight">Saldo Disponible Total</p>
                                    <p className="text-[9px] font-medium text-[var(--text-muted)] tracking-wider">No incluye ahorro ni deudas de tarjetas</p>
                                 </div>
                                 <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter"><CurrencyDisplay amount={freeBalance} /></p>
                              </div>
                           </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                </div>
               </div>

                <div className="flex flex-col items-center md:items-end w-full md:w-auto gap-3">
                   {/* AHORRO PROYECTADO pill */}
                   <div className="flex px-3.5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/10 items-center gap-3 h-fit group transition-all hover:bg-white/20">
                     <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                     </div>
                     <div className="flex flex-col items-start md:items-end">
                       <span className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1 flex items-center gap-1.5">
                          Tendencia de Ahorro
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       </span>
                       <span className="text-xs md:text-[13px] font-black text-white leading-none flex items-center gap-2">
                          <CurrencyDisplay amount={projectedSavings} />
                          <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">Est. {new Date().toLocaleString('es-ES', { month: 'short' }).toUpperCase()}</span>
                       </span>
                     </div>
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* Compact Quick Actions Card */}
        <div className="max-w-7xl mx-auto px-6 relative z-30 mt-[-24px]">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_8px_30px_var(--shadow)] p-4 rounded-[2rem] max-w-3xl mx-auto">
            <div className="flex overflow-x-auto no-scrollbar items-center justify-between sm:justify-center sm:gap-12 flex-nowrap h-[80px] px-2 sm:px-6">
              <NewTransactionModal
                userId={userId}
                trigger={
                <div className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 w-[64px] sm:w-24">
                  <div className="w-[48px] h-[48px] rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic text-center w-full truncate sm:whitespace-normal sm:overflow-visible">Nuevo</span>
                </div>
              } />

              <Link href="/expenses" className="flex flex-col items-center gap-1.5 group shrink-0 w-[64px] sm:w-24">
                <div className="w-[48px] h-[48px] rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center border border-orange-500/20 group-hover:scale-105 transition-transform">
                  <Receipt className="w-6 h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic w-full text-center truncate sm:whitespace-normal sm:overflow-visible">Gastos</span>
              </Link>

              <Link href="/cards" className="flex flex-col items-center gap-1.5 group shrink-0 w-[64px] sm:w-24">
                <div className="w-[48px] h-[48px] rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic w-full text-center truncate sm:whitespace-normal sm:overflow-visible">Cuentas</span>
              </Link>

              <Link href="/goals" className="flex flex-col items-center gap-1.5 group shrink-0 w-[64px] sm:w-24">
                <div className="w-[48px] h-[48px] rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic w-full text-center truncate sm:whitespace-normal sm:overflow-visible">Metas</span>
              </Link>

              <Link href="/reports" className="flex flex-col items-center gap-1.5 group shrink-0 w-[64px] sm:w-24">
                <div className="w-[48px] h-[48px] rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic w-full text-center truncate sm:whitespace-normal sm:overflow-visible">Reportes</span>
              </Link>
            </div>
          </div>
        </div>

        <main className="px-6 max-w-5xl mx-auto pt-0 pb-12 flex flex-col gap-4">
          <PushBanner />
          
          <section className="mt-8">
            <div className="flex flex-col gap-3 -mx-6 sm:mx-0">
              <h3 className="px-6 sm:px-0 text-[14px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Resumen del Período</h3>
              <div className="flex flex-row overflow-x-auto flex-nowrap gap-2 px-6 sm:px-0 no-scrollbar">
                  {(['dia', 'semana', 'mes', 'anual', 'todos'] as const).map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPeriodFilter(p)}
                        className={cn(
                          "h-[32px] px-[14px] rounded-[100px] text-[12px] font-bold whitespace-nowrap shrink-0 transition-colors border",
                          periodFilter === p ? "bg-[#2563EB] text-white border-[#2563EB]" : "bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        )}
                      >
                          {p === 'dia' ? 'DÍA' : p === 'semana' ? 'SEMANA' : p === 'mes' ? 'ESTE MES' : p === 'anual' ? 'ESTE AÑO' : 'HISTÓRICO'}
                      </button>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[12px] mt-6">
               {categoriesUI.map((cat, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "bg-[var(--bg-card)] rounded-[16px] p-4 border border-[var(--border-color)] flex flex-col justify-between min-h-[100px] shadow-[0_2px_8px_var(--shadow)]",
                      categoriesUI.length % 2 !== 0 && i === categoriesUI.length - 1 ? "col-span-2" : "col-span-1"
                    )}
                  >
                      <div className="flex items-start justify-between mb-2">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}>
                            <cat.icon className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                          <p className="text-[11px] font-medium text-[#94A3B8]">{cat.name}</p>
                          <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight"><CurrencyDisplay amount={cat.amount} /></h4>
                          
                          {/* COMPARATIVA */}
                          {i < 2 ? (
                             <div className={cn(
                               "mt-1 flex items-center gap-1 text-[10px] font-bold",
                               (i === 0 ? diffPercent <= 0 : true) ? "text-[#10B981]" : "text-[#EF4444]"
                             )}>
                                {i === 0 ? (
                                  <>
                                    {diffPercent <= 0 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                                    {Math.abs(diffPercent).toFixed(1)}% vs {periodFilter === 'dia' ? 'ayer' : periodFilter === 'semana' ? 'sem. ant.' : periodFilter === 'mes' ? 'mes ant.' : 'año ant.'}
                                  </>
                                ) : (
                                  <span className="opacity-80">Estable</span>
                                )}
                             </div>
                          ) : (
                             <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#10B981]">
                               <span className="opacity-80">Dentro de límite</span>
                             </div>
                          )}
                      </div>
                  </div>
               ))}
            </div>
          </section>

          {/* SECCIÓN 5 — ÚLTIMOS MOVIMIENTOS */}
          <section className="bg-[var(--bg-card)] rounded-[20px] shadow-[0_4px_20px_var(--shadow)] border border-[var(--border-color)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-[var(--text-primary)]">
                Últimos Movimientos
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-secondary)] text-[var(--text-muted)]">{recentMovements.length}</span>
              </h3>
              <Link href="/expenses" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1">VER TODOS <ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="p-2">
               {recentMovements.length === 0 ? (
                 <div className="py-12 text-center">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Sin movimientos en este período</p>
                 </div>
               ) : (
                 <>
                   {visibleMovements.map((mov: any, i: number) => {
                     const isExpense = mov.type !== 'income';
                     const Icon = mov.category?.toLowerCase().includes('comida') ? Coffee :
                                  mov.category?.toLowerCase().includes('transporte') ? Car :
                                  isExpense ? ShoppingBag : TrendingUp;
                     return (
                       <div
                         key={mov.id || i}
                         onClick={() => {
                           if (!isExpense) return;
                           setSelectedMovement(mov);
                           setActiveModal('detalle');
                         }}
                         className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all cursor-pointer group"
                       >
                         <div className="flex items-center gap-4">
                           <div className={cn(
                             "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                             isExpense ? "bg-[var(--bg-secondary)] text-primary" : "bg-emerald-500/10 text-emerald-500"
                           )}>
                             <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                           </div>
                           <div>
                             <p className="font-black text-[var(--text-primary)] leading-none mb-1 uppercase italic text-sm">{mov.concept || mov.category || 'Sin concepto'}</p>
                             <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                               {mov.category} • {mov.date ? formatRelative(new Date(mov.date), now, { locale: es }) : ''}
                             </p>
                           </div>
                         </div>
                         <span className={cn(
                           "text-lg font-black tracking-tighter",
                           isExpense ? "text-red-500" : "text-emerald-500"
                         )}>
                           {isExpense ? `-${mov.amount}` : `+${mov.amount}`}
                         </span>
                       </div>
                     );
                   })}
                   {recentMovements.length > MOVEMENTS_LIMIT && (
                     <button
                       onClick={() => setShowAllMovements(prev => !prev)}
                       className="w-full mt-2 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-primary transition-all flex items-center justify-center gap-2"
                     >
                       {showAllMovements ? 'Ver menos' : `Ver ${recentMovements.length - MOVEMENTS_LIMIT} más`}
                       <ChevronRight className={cn("w-3 h-3 transition-transform", showAllMovements && "rotate-90")} />
                     </button>
                   )}
                 </>
               )}
            </div>
          </section>

          {/* WIDGET 2 — MIS METAS PRÓXIMAS */}
          <section className="bg-[var(--bg-card)] rounded-[16px] shadow-[0_4px_20px_var(--shadow)] border border-[var(--border-color)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-[var(--text-primary)]">Metas próximas</h3>
              <Link href="/goals" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1">Ver todas <ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="p-4 space-y-4">
              {savingsGoals && savingsGoals.filter(g => g.status === 'active').length > 0 ? (
                savingsGoals
                  .filter(g => g.status === 'active')
                  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                  .slice(0, 3)
                  .map((goal: any, i: number) => {
                    const realAmount = calculateRealAmount(goal, goalContributions, expenses);
                    const progressValue = calculateGoalProgress(realAmount, goal.target_amount || 0, goal.type);
                    const days = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                    const isV = goal.goal_type_savings === 'virtual';
                    const dCol = days < 30 ? "bg-red-500/10 text-red-500" : days < 60 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500";
                    
                    return (
                      <Link key={goal.id} href={`/goals/${goal.id}`} className="block group bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-color)] hover:scale-[1.01] transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-xl shadow-sm" style={{ border: `1px solid ${goal.color || '#10b981'}40` }}>
                              {goal.icon || '🎯'}
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <p className="font-black text-sm text-[var(--text-primary)] uppercase italic leading-none">{goal.name}</p>
                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] uppercase tracking-widest">
                                    {isV ? '🧠 Virtual' : '🏦 Vinculada'}
                                  </span>
                               </div>
                               <div className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit italic", dCol)}>
                                 {days <= 0 ? "Vencida" : `Vence en ${days} días`}
                               </div>
                            </div>
                          </div>
                          <div className="text-right">
                             <span className="text-sm font-black italic text-[var(--text-primary)]">{progressValue}%</span>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-[var(--border-color)] rounded-full overflow-hidden relative">
                          <div 
                             className={cn(
                                "h-full rounded-full transition-all duration-1000 relative shadow-[0_0_8px_rgba(6,182,212,0.4)]",
                                progressValue <= 25  ? "bg-gradient-to-r from-[#f87171] to-[#ef4444]" :
                                progressValue <= 50  ? "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]" :
                                progressValue <= 75  ? "bg-gradient-to-r from-[#60a5fa] to-[#2563eb]" :
                                                       "bg-gradient-to-r from-[#34d399] to-[#10b981]"
                             )} 
                             style={{ width: `${progressValue}%` }}
                          >
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                          </div>
                        </div>
                      </Link>
                    );
                  })
              ) : (
                <p className="text-center py-8 text-[var(--text-muted)] font-bold text-xs">No tienes metas activas 🎯</p>
              )}
            </div>
          </section>

          {/* WIDGET 3 — RECORDATORIOS PRÓXIMOS */}
          <section className="bg-[var(--bg-card)] rounded-[16px] shadow-[0_4px_20px_var(--shadow)] border border-[var(--border-color)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-[var(--text-primary)]">Recordatorios</h3>
              <NewReminderModal 
                userId={userId || ''} 
                cards={creditCards} 
                goals={savingsGoals}
                trigger={
                  <button className="h-8 px-3 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all border-none cursor-pointer flex items-center gap-1.5">
                    <Plus className="w-3 h-3" /> Añadir
                  </button>
                }
              />
            </div>
            <div className="p-2">
              {reminders.filter(r => r.status === 'active').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <p className="font-black uppercase italic tracking-tighter text-xl text-[var(--text-primary)] opacity-40 mb-2">¡Todo listo! 🎉</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] mb-4">No tienes recordatorios pendientes</p>
                  <NewReminderModal 
                    userId={userId || ''} 
                    cards={creditCards} 
                    goals={savingsGoals}
                    trigger={
                      <button className="h-10 px-5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-black uppercase tracking-widest border border-[var(--border-color)] hover:opacity-80 transition-all cursor-pointer">
                        Crear recordatorio
                      </button>
                    }
                  />
                </div>
              ) : (
                <>
                  {reminders
                    .filter(r => {
                      if (r.status !== 'active' || paidThisCycle.has(r.id)) return false;
                      const remDate = new Date(r.fecha);
                      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const in7Days = new Date(todayStart);
                      in7Days.setDate(in7Days.getDate() + 7);
                      return remDate <= in7Days; // overdue or due within 7 days
                    })
                    .sort((a, b) => {
                      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const aDate = new Date(a.fecha);
                      const bDate = new Date(b.fecha);
                      const aOver = aDate < todayStart;
                      const bOver = bDate < todayStart;
                      if (aOver && !bOver) return -1;
                      if (!aOver && bOver) return 1;
                      return aDate.getTime() - bDate.getTime();
                    })
                    .slice(0, 5)
                    .map((rem: any) => {
                      const remDate = new Date(rem.fecha);
                      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const isToday = remDate.toDateString() === now.toDateString();
                      const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === remDate.toDateString();
                      const isOverdue = remDate < todayStart;
                      const isPaid = paidThisCycle.has(rem.id);
                      const isPending = pendingConfirm === rem.id;
                      const dateText = isOverdue
                        ? `Vencido ${format(remDate, "dd MMM", { locale: es })}`
                        : isToday ? 'Hoy' : isTomorrow ? 'Mañana' : format(remDate, "dd MMM", { locale: es });

                      return (
                        <div key={rem.id} className="relative group/rem">
                           {/* Confirmation Overlay — Fix for clipping */}
                           {isPending && (
                             <div className="absolute inset-0 z-50 bg-[var(--bg-elevated)]/95 backdrop-blur-sm rounded-2xl flex items-center justify-between px-4 animate-in fade-in zoom-in-95 duration-200">
                               <p className="text-[11px] font-black text-[var(--text-primary)] leading-tight flex-1 italic uppercase tracking-tighter">
                                 ¿Confirmas pago de <span className="text-blue-500">{rem.nombre}</span>?
                               </p>
                               <div className="flex gap-2 shrink-0">
                                 <button
                                   onClick={() => { setPendingConfirm(null); if (pendingConfirmTimer) clearTimeout(pendingConfirmTimer); }}
                                   className="h-8 px-3 rounded-xl bg-[var(--bg-secondary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                                 >No</button>
                                 <button
                                   onClick={() => handleConfirmPaid(rem)}
                                   className="h-8 px-4 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                 >Sí, listo</button>
                               </div>
                             </div>
                           )}

                          <div className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all",
                            isOverdue ? "border-red-500/30 bg-red-500/5" :
                            isToday ? "border-amber-500/20 bg-amber-500/5" :
                            "border-transparent hover:border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                          )}>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {isOverdue && <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />}
                              <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                rem.type === 'card_payment' ? "bg-indigo-500/10 text-indigo-400" :
                                rem.type === 'goal_contribution' ? "bg-emerald-500/10 text-emerald-400" :
                                rem.type === 'subscription' ? "bg-purple-500/10 text-purple-400" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                              )}>
                                {rem.type === 'card_payment' ? <CreditCard className="w-5 h-5" /> :
                                 rem.type === 'goal_contribution' ? <Target className="w-5 h-5" /> :
                                 rem.type === 'subscription' ? <RotateCw className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-[var(--text-primary)] leading-none truncate uppercase italic text-sm pr-1.5">{rem.nombre}</p>
                                  {rem.is_recurring && <span className="text-[7px] font-black bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] px-1.5 py-0.5 rounded-full tracking-widest">RECURRENTE</span>}
                                </div>
                                <p className={cn(
                                  "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-1",
                                  isOverdue ? "text-red-500" : isToday ? "text-amber-500" : "text-[var(--text-muted)]"
                                )}>
                                  {(isOverdue || isToday) && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
                                  {dateText}{rem.monto ? ` • $${rem.monto}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <DropdownMenu onOpenChange={(open) => { if (!open && snoozePickerId === rem.id) setSnoozePickerId(null); }}>
                                <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] border-none cursor-pointer transition-all bg-transparent">
                                  <MoreVertical className="w-4 h-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[var(--bg-elevated)] border-[var(--border-color)] rounded-xl min-w-[170px] p-1 shadow-lg">
                                  <DropdownMenuItem
                                    onClick={() => handleCheckClick(rem)}
                                    className="text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--bg-secondary)] cursor-pointer rounded-lg px-3 py-2 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Marcar como pagado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setSnoozePickerId(snoozePickerId === rem.id ? null : rem.id)}
                                    className="text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--bg-secondary)] cursor-pointer rounded-lg px-3 py-2 flex items-center gap-2"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Posponer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {/* TODO: open edit modal */}}
                                    className="text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--bg-secondary)] cursor-pointer rounded-lg px-3 py-2 flex items-center gap-2"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-[var(--border)] my-1" />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteReminder(rem.id)}
                                    className="text-red-400 text-xs font-bold hover:bg-red-500/10 cursor-pointer rounded-lg px-3 py-2 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              {/* Separate check button for direct action */}
                              <button
                                onClick={() => handleCheckClick(rem)}
                                style={isPaid ? { animation: 'reminderCheckIn 0.2s ease-out' } : undefined}
                                className={cn(
                                  "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer",
                                  isPaid
                                    ? "border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/30"
                                    : "border-[var(--border-color)] bg-transparent hover:border-emerald-500"
                                )}
                              >
                                {isPaid && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in duration-200" />}
                              </button>
                            </div>
                          </div>

                          {/* Snooze picker internal */}
                          {snoozePickerId === rem.id && (
                            <div className="mt-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-2 shadow-2xl mx-1 animate-in fade-in slide-in-from-top-1">
                              <p className="text-[9px] font-black uppercase text-[var(--text-muted)] px-2 py-1 tracking-widest">Posponer para más tarde</p>
                              <div className="grid grid-cols-4 gap-1">
                                {[1, 3, 5, 7].map(days => (
                                  <button
                                    key={days}
                                    onClick={() => handleSnooze(rem, days)}
                                    className="text-center py-2 text-xs font-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-xl border-none cursor-pointer transition"
                                  >
                                    {days}d
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </>
              )}
            </div>
          </section>

          {/* SECCIÓN 6 — FLUJO DE CAJA */}
          <section>
            <div style={{ background: '#111827', border: '1px solid #1F2D45', borderRadius: 20, padding: 20 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white uppercase italic tracking-tighter text-base">
                  Flujo de Caja
                </h3>
                <Link
                  href="/reports"
                  style={{
                    background: '#1A2234',
                    border: '1px solid #1F2D45',
                    color: '#2563EB',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: '6px 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    textDecoration: 'none',
                  }}
                >
                  Ver Reportes <ChevronRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>
              <CashFlowMiniChart />
              <div className="flex items-center justify-center gap-5 mt-3">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ color: '#6B7280', fontSize: 11 }}>Ingresos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ color: '#6B7280', fontSize: 11 }}>Gastos</span>
                </div>
              </div>
            </div>
          </section>

          {/* VER MAS MODAL (CATEGORY BREAKDOWN) */}
          <Dialog open={activeModal === 'ver_mas'} onOpenChange={(o) => setActiveModal(o ? 'ver_mas' : null)}>
            <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden max-w-lg bg-[var(--bg-card)]/95 backdrop-blur-2xl border-none shadow-2xl">
                <div className="p-10 flex flex-col h-[80vh]">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">Gastos por Categoría</h3>
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mt-2 italic">Período: {periodFilter}</p>
                        </div>
                        <button onClick={() => setActiveModal(null)} className="h-10 w-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center border-none cursor-pointer hover:bg-gray-200 text-[var(--text-primary)]"><Plus className="w-6 h-6 rotate-45" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {sortedCategories.map((cat, i) => (
                            <div key={i} className="space-y-3 p-4 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)]">
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-primary shadow-sm">
                                            {cat.name.toLowerCase().includes('comida') ? <Coffee className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                        </div>
                                        <span className="font-black text-[var(--text-primary)] uppercase italic text-sm">{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[var(--text-primary)] leading-none mb-1"><CurrencyDisplay amount={cat.amount} /></p>
                                        <p className="text-[10px] font-bold text-primary">{cat.percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--bg-card)] rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${cat.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 mt-8">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">Total General</span>
                            <span className="text-3xl font-black tracking-tighter italic text-[var(--text-primary)]"><CurrencyDisplay amount={totalSpent} /></span>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => router.push('/expenses')} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs italic tracking-widest border-none cursor-pointer shadow-lg shadow-primary/20">Ver detalle completo</button>
                            <button onClick={() => setActiveModal(null)} className="px-6 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-black uppercase text-xs italic border-none cursor-pointer">Cerrar</button>
                        </div>
                    </div>
                </div>
            </DialogContent>
          </Dialog>

          {/* DETALLE MODAL */}
          <Dialog open={activeModal === 'detalle'} onOpenChange={(o) => setActiveModal(o ? 'detalle' : null)}>
             <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden max-w-md bg-[var(--bg-card)] border-none shadow-2xl">
                {selectedMovement && (
                    <div className="flex flex-col">
                        <div className="p-12 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-center italic uppercase font-black border-b border-[var(--border-color)]">
                            <p className="text-[10px] opacity-60 tracking-widest mb-2">Monto Transacción</p>
                            <h3 className="text-5xl tracking-tighter">
                                <CurrencyDisplay amount={selectedMovement.monto} showPlusMinus={true} type={selectedMovement.type === 'income' ? 'income' : 'expense'} />
                            </h3>
                        </div>
                        <div className="p-10 space-y-8">
                            <div className="border-b border-white/5 pb-6">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mb-1">Concepto</p>
                                <h4 className="text-2xl font-black text-[var(--text-primary)] uppercase italic">{selectedMovement.comercio || selectedMovement.categoria}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div><p className="text-[10px] font-black text-[var(--text-muted)] italic mb-1 uppercase tracking-widest">Fecha</p><span className="font-bold text-[var(--text-primary)]">{new Date(selectedMovement.fecha).toLocaleDateString()}</span></div>
                                <div><p className="text-[10px] font-black text-[var(--text-muted)] italic mb-1 uppercase tracking-widest">Método</p><span className="font-bold uppercase text-[var(--text-primary)]">{selectedMovement.metodo_pago || 'Cash'}</span></div>
                            </div>
                            <button onClick={async () => { await deleteMovement(selectedMovement.id, 'expense'); setActiveModal(null); router.refresh(); }} className="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl font-black uppercase text-xs italic border-none cursor-pointer">Eliminar Movimiento</button>
                        </div>
                    </div>
                )}
             </DialogContent>
          </Dialog>

        </main>
      </div>



      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
