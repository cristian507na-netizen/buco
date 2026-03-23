"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  CreditCard, 
  Wallet, 
  TrendingDown, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  PieChart,
  DollarSign,
  ArrowUpRight,
  MoreVertical,
  Coffee,
  Car,
  ShoppingBag,
  Receipt,
  Eye,
  EyeOff,
  Bell,
  Home,
  Stethoscope,
  Tv,
  BookOpen,
  ArrowLeftRight,
  PiggyBank,
  X,
  Info,
  ArrowDownRight,
  Edit2,
  Pencil,
  Trash2,
  Banknote,
  ArrowUp,
  Wifi
} from 'lucide-react';
import { NotificationsModal } from '@/components/modals/NotificationsModal';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  addCard,
  addBankAccount,
  updateBudget,
  deleteMovement,
  transferBetweenAccounts,
  deleteCard,
  deleteBankAccount,
  updateCard,
  updateBankAccount
} from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

import { useRealtime } from "@/hooks/useRealtime";
import { formatCurrencySimple, parseMoney, isValidDay } from "@/lib/format";

interface Card {
  id: string;
  nombre_banco: string;
  nombre_tarjeta: string;
  tipo_tarjeta: 'credito' | 'debito';
  limite: number;
  saldo_actual: number;
  fecha_corte: number;
  fecha_pago: number;
  ultimos_4: string;
  color: string;
}

interface Account {
  id: string;
  nombre_banco: string;
  alias: string;
  tipo_cuenta: string;
  saldo_actual: number;
  moneda: string;
  identificador_corto: string;
  is_default?: boolean;
  is_deletable?: boolean;
}

interface Budget {
  categoria: string;
  limite_mensual: number;
}

interface Transaction {
  id: string;
  comercio: string;
  monto: number;
  fecha: string;
  categoria: string;
  metodo_pago: string;
}

interface AccountsClientProps {
  cards: Card[];
  accounts: Account[];
  budgets: Budget[];
  expensesByCategory: Record<string, number>;
  recentTransactions: Transaction[];
  userId: string;
}

const CATEGORIES = [
  { id: 'comida', name: 'Comida', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'transporte', name: 'Transporte', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'ocio', name: 'Ocio', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'hogar', name: 'Hogar', icon: Home, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'salud', name: 'Salud', icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'suscripciones', name: 'Suscripciones', icon: Tv, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'educacion', name: 'Educación', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'otros', name: 'Otros', icon: MoreVertical, color: 'text-gray-500', bg: 'bg-gray-50' },
];

export default function AccountsClient({ 
  cards: initialCards, 
  accounts: initialAccounts, 
  budgets: initialBudgets, 
  expensesByCategory: initialExpensesByCategory, 
  recentTransactions: initialTransactions,
  userId 
}: AccountsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tarjetas' | 'cuentas'>('tarjetas');
  const [activeModal, setActiveModal] = useState<'newCard' | 'newAccount' | 'editBudget' | 'transfer' | 'editCard' | 'editAccount' | 'deleteCard' | 'deleteAccount' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newAccountType, setNewAccountType] = useState<string>('ahorro');
  const [savingsInfoVisible, setSavingsInfoVisible] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Transfer State
  const [transferFrom, setTransferFrom] = useState<string>('');
  const [transferTo, setTransferTo] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferNote, setTransferNote] = useState<string>('');

  // Form Val / UI Logic
  const [cardType, setCardType] = useState<'credito' | 'debito'>('credito');
  const [dayErrors, setDayErrors] = useState<Record<string, string>>({});
  const [moneyFields, setMoneyFields] = useState<Record<string, string>>({});

  // Load savings info visibility from localStorage
  useEffect(() => {
    const hidden = localStorage.getItem('hideSavingsInfo');
    if (hidden === 'true') setSavingsInfoVisible(false);
  }, []);

  // Realtime State
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(initialTransactions);

  // Realtime Subscriptions
  useRealtime({
    table: 'credit_cards',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setCards(prev => [newVal, ...prev]),
    onUpdate: (updated) => setCards(prev => prev.map(c => c.id === updated.id ? updated : c)),
    onDelete: (deleted) => setCards(prev => prev.filter(c => c.id !== deleted.id))
  });

  useRealtime({
    table: 'bank_accounts',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setAccounts(prev => [newVal, ...prev]),
    onUpdate: (updated) => setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a)),
    onDelete: (deleted) => setAccounts(prev => prev.filter(a => a.id !== deleted.id))
  });

  useRealtime({
    table: 'expenses',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setRecentTransactions(prev => [newVal, ...prev]),
    onUpdate: (updated) => setRecentTransactions(prev => prev.map(t => t.id === updated.id ? updated : t)),
    onDelete: (deleted) => setRecentTransactions(prev => prev.filter(t => t.id !== deleted.id))
  });

  useRealtime({
    table: 'budgets',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setBudgets(prev => {
      const exists = prev.find(b => b.categoria === newVal.categoria);
      if (exists) return prev.map(b => b.categoria === newVal.categoria ? newVal : b);
      return [...prev, newVal];
    }),
    onUpdate: (updated) => setBudgets(prev => prev.map(b => b.categoria === updated.categoria ? updated : b)),
    onDelete: (deleted) => setBudgets(prev => prev.filter(b => b.categoria !== deleted.categoria))
  });

  // Sync Props to State (Single Source of Truth)
  useEffect(() => {
    setCards(initialCards);
    setAccounts(initialAccounts);
    setBudgets(initialBudgets);
    setRecentTransactions(initialTransactions);
  }, [initialCards, initialAccounts, initialBudgets, initialTransactions]);

  // Re-calculate expensesByCategory from recentTransactions
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    recentTransactions.forEach(tx => {
      map[tx.categoria] = (map[tx.categoria] || 0) + Number(tx.monto);
    });
    return map;
  }, [recentTransactions]);

  // Derived Stats
  const totalCreditLimit = useMemo(() => cards.filter(c => c.tipo_tarjeta === 'credito').reduce((acc, c) => acc + Number(c.limite), 0), [cards]);
  const totalCreditUsed = useMemo(() => cards.filter(c => c.tipo_tarjeta === 'credito').reduce((acc, c) => acc + Number(c.saldo_actual), 0), [cards]);
  const creditUsagePercentage = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

  const urgentCard = useMemo(() => {
    return cards
      .filter(c => c.tipo_tarjeta === 'credito')
      .sort((a, b) => a.fecha_pago - b.fecha_pago)[0];
  }, [cards]);

  const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Validar días si es crédito
    if (cardType === 'credito') {
      const corte = formData.get('fecha_corte') as string;
      const pago = formData.get('fecha_pago') as string;
      if (!isValidDay(corte) || !isValidDay(pago)) {
        setDayErrors({
          corte: !isValidDay(corte) ? 'Día inválido (1-31)' : '',
          pago: !isValidDay(pago) ? 'Día inválido (1-31)' : ''
        });
        return;
      }
    }

    const res = await addCard(formData);
    if (res.success) {
      setActiveModal(null);
      setDayErrors({});
      setMoneyFields({});
      router.refresh();
    }
  };

  const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await addBankAccount(formData);
    if (res.success) {
      setActiveModal(null);
      setMoneyFields({});
      router.refresh();
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const category = formData.get('categoria') as string;
    const limit = Number(formData.get('limite_mensual'));
    
    // ACTUALIZACIÓN OPTIMISTA
    setBudgets(prev => {
      const exists = prev.find(b => b.categoria === category);
      if (exists) {
        return prev.map(b => b.categoria === category ? { ...b, limite_mensual: limit } : b);
      }
      return [...prev, { categoria: category, limite_mensual: limit }];
    });

    const res = await updateBudget(formData);
    if (res.success) {
      setActiveModal(null);
      // No necesitamos router.refresh() para esto porque ya actualizamos el estado local
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24 lg:pb-12 text-[var(--text-primary)] page-transition">
      {/* 🚀 PREMIUM HEADER (HERO) */}
      <div className="section-hero h-auto min-h-[180px] md:min-h-[140px] md:h-[140px] pb-6 md:pb-0" style={{ borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', overflow: 'hidden' }}>
        {/* 🌑 DARK OVERLAY FOR LEGIBILITY */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 px-6 md:px-8 py-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                   <div className="flex items-center gap-2">
                      <div className="h-4 w-1 bg-white/30 rounded-full" />
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-[1.5px]">Patrimonio & Cuentas</span>
                   </div>
                   
                   {/* Mobile Bell */}
                   <div className="md:hidden">
                      <NotificationsModal 
                        userId={userId} 
                        trigger={
                          <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer relative">
                            <Bell className="w-4 h-4" />
                          </div>
                        } 
                      />
                   </div>
                </div>
                <h1 className="text-[26px] font-bold tracking-tight text-white leading-none mb-1.5">Cuentas</h1>
                <p className="text-white/80 font-medium text-[13px] opacity-80 line-clamp-1">Gestiona tus tarjetas y cuentas en un solo lugar.</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/5 h-fit">
                    <button 
                     onClick={() => setActiveTab('tarjetas')}
                     className={cn(
                       "px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                       activeTab === 'tarjetas' ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"
                     )}
                    >
                       Tarjetas
                    </button>
                    <button 
                     onClick={() => setActiveTab('cuentas')}
                     className={cn(
                       "px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                       activeTab === 'cuentas' ? "bg-white text-slate-900 shadow-sm" : "text-white/60 hover:text-white"
                     )}
                    >
                       Cuentas
                    </button>
                 </div>

                 {/* Desktop Bell */}
                 <div className="hidden md:block">
                    <NotificationsModal 
                      userId={userId} 
                      trigger={
                        <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer relative hover:bg-white/20">
                          <Bell className="w-5 h-5" />
                        </div>
                      } 
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-[24px] relative z-10 space-y-12 bg-transparent">
        {/* CARDS / ACCOUNTS LIST (Carousel Style) */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">
                    {activeTab === 'tarjetas' ? 'Mis Tarjetas' : 'Mis Cuentas'}
                 </h2>
                 <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">
                    {activeTab === 'tarjetas' ? 'Crédito y Débito' : 'Ahorro y Corriente'}
                 </p>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setActiveModal('transfer')}
                   className="h-10 px-4 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all flex items-center gap-2"
                 >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Transferir
                 </button>
                 <button 
                   onClick={() => setActiveModal(activeTab === 'tarjetas' ? 'newCard' : 'newAccount')}
                   className="h-10 px-5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                 >
                    <Plus className="w-4 h-4" />
                    {activeTab === 'tarjetas' ? 'Añadir Tarjeta' : 'Añadir Cuenta'}
                 </button>
              </div>
           </div>

           <div className="flex overflow-x-auto gap-6 snap-x no-scrollbar pb-6 px-1">
              {activeTab === 'tarjetas' ? (
                 cards.length > 0 ? cards.map(card => {
                     const usage = card.tipo_tarjeta === 'credito' && Number(card.limite) > 0
                       ? (Number(card.saldo_actual) / Number(card.limite)) * 100 : 0;
                     const usageColor = usage > 85 ? '#EF4444' : usage > 60 ? '#F59E0B' : '#10B981';
                     const isExpanded = expandedCardId === card.id;
                     const fmtAmt = (n: number) => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                     const minPago = Number(card.saldo_actual) * 0.1;
                     return (
                       <div key={card.id} className="flex-shrink-0 snap-center flex flex-col gap-3" style={{ width: 320 }}>
                         {/* Card physical */}
                         <div
                           onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                           className={cn(
                             "relative overflow-hidden cursor-pointer transition-transform duration-200",
                             isExpanded ? "-translate-y-1" : "hover:-translate-y-1"
                           )}
                           style={{
                             width: '100%', height: 220, borderRadius: 24,
                             background: card.tipo_tarjeta === 'credito'
                               ? 'linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 40%, #2563EB 100%)'
                               : 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
                             boxShadow: card.tipo_tarjeta === 'credito'
                               ? '0 16px 28px -8px rgba(37, 99, 235, 0.45)'
                               : '0 16px 28px -8px rgba(0, 0, 0, 0.55)',
                           }}
                         >
                           <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', zIndex: 1 }} />
                           <div className="absolute pointer-events-none" style={{ bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 1 }} />
                           <div className="relative flex flex-col justify-between h-full" style={{ padding: 24, zIndex: 2 }}>
                             {/* Top row */}
                             <div className="flex items-start justify-between">
                               <div className="flex flex-col gap-1.5">
                                 <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                   {card.nombre_banco}
                                 </span>
                                 <span style={{
                                   fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, width: 'fit-content',
                                   ...(card.tipo_tarjeta === 'credito'
                                     ? { background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(37,99,235,0.5)', color: '#93C5FD' }
                                     : { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#6EE7B7' })
                                 }}>
                                   {card.tipo_tarjeta === 'credito' ? 'CRÉDITO' : 'DÉBITO'}
                                 </span>
                               </div>
                               <DropdownMenu>
                                 <DropdownMenuTrigger
                                   onClick={(e) => e.stopPropagation()}
                                   className="flex items-center justify-center outline-none"
                                   style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', flexShrink: 0 }}
                                 >
                                   <MoreVertical className="w-4 h-4 text-white" />
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent
                                   align="end"
                                   className="w-48 text-white bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl shadow-2xl z-50 overflow-hidden font-bold"
                                 >
                                   <DropdownMenuItem
                                     onClick={(e) => { e.stopPropagation(); setSelectedItem(card); setActiveModal('editCard'); }}
                                     className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer"
                                   >
                                     <Edit2 className="w-4 h-4" />Editar tarjeta
                                   </DropdownMenuItem>
                                   <DropdownMenuItem
                                     onClick={(e) => { e.stopPropagation(); router.push('/expenses'); }}
                                     className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer"
                                   >
                                     <Receipt className="w-4 h-4" />Ver movimientos
                                   </DropdownMenuItem>
                                   <DropdownMenuItem
                                     onClick={(e) => { e.stopPropagation(); setSelectedItem({ ...card, type: 'card' }); setShowDeleteConfirm(true); }}
                                     className="gap-2 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer"
                                   >
                                     <Trash2 className="w-4 h-4" />Eliminar
                                   </DropdownMenuItem>
                                 </DropdownMenuContent>
                               </DropdownMenu>
                             </div>
                             {/* Middle row: chip + contactless */}
                             <div className="flex items-center gap-3">
                               <div style={{ width: 36, height: 28, borderRadius: 6, flexShrink: 0, background: 'linear-gradient(135deg, #D4A843, #F5C842, #B8902A)', position: 'relative', overflow: 'hidden' }}>
                                 <div style={{ position: 'absolute', inset: 3, border: '1px solid rgba(0,0,0,0.25)', borderRadius: 3 }} />
                                 <div style={{ position: 'absolute', left: '50%', top: '15%', bottom: '15%', width: 1, background: 'rgba(0,0,0,0.2)' }} />
                                 <div style={{ position: 'absolute', top: '50%', left: '15%', right: '15%', height: 1, background: 'rgba(0,0,0,0.2)' }} />
                               </div>
                               <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, fontStyle: 'italic', letterSpacing: -2 }}>((</span>
                             </div>
                             {/* Bottom row */}
                             <div className="flex items-end justify-between">
                               <div className="flex flex-col">
                                 <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>SALDO</span>
                                 <span style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1 }}>{fmtAmt(Number(card.saldo_actual))}</span>
                                 <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                                   {card.tipo_tarjeta === 'credito' ? `de ${fmtAmt(Number(card.limite))} límite` : card.nombre_banco}
                                 </span>
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                 {card.ultimos_4 && (
                                   <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>•••• {card.ultimos_4}</span>
                                 )}
                                 {card.tipo_tarjeta === 'debito' ? (
                                   <span style={{ fontSize: 12, color: 'white', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>DÉBITO</span>
                                 ) : (
                                   <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: 'white' }}>VISA</span>
                                 )}
                               </div>
                             </div>
                           </div>
                         </div>
                         {/* Usage bar — credit only */}
                         {card.tipo_tarjeta === 'credito' && (
                           <div className="px-1">
                             <div className="flex justify-between items-center mb-1.5">
                               <span style={{ fontSize: 11, color: '#6B7280' }}>Uso del crédito</span>
                               <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700 }}>{usage.toFixed(0)}%</span>
                             </div>
                             <div style={{ height: 4, background: '#1F2D45', borderRadius: 100, overflow: 'hidden' }}>
                               <div style={{ height: '100%', borderRadius: 100, background: usageColor, width: `${Math.min(usage, 100)}%`, transition: 'width 700ms ease' }} />
                             </div>
                           </div>
                         )}
                         {/* Expanded detail panel */}
                         {isExpanded && (
                           <div style={{ background: '#111827', border: '1px solid #1F2D45', borderRadius: 20, padding: 20 }}>
                             {card.tipo_tarjeta === 'credito' ? (
                               <>
                                 <div className="grid grid-cols-2 gap-4 mb-4">
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>SALDO ACTUAL</p>
                                     <p style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{fmtAmt(Number(card.saldo_actual))}</p>
                                   </div>
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>PAGO MÍNIMO</p>
                                     <p style={{ color: '#F59E0B', fontWeight: 700, fontSize: 18 }}>{fmtAmt(minPago)}</p>
                                   </div>
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>LÍMITE TOTAL</p>
                                     <p style={{ color: '#E5E7EB', fontWeight: 700, fontSize: 14 }}>{fmtAmt(Number(card.limite))}</p>
                                   </div>
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>DISPONIBLE</p>
                                     <p style={{ color: '#10B981', fontWeight: 700, fontSize: 14 }}>{fmtAmt(Math.max(0, Number(card.limite) - Number(card.saldo_actual)))}</p>
                                   </div>
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>CORTE</p>
                                     <p style={{ color: '#E5E7EB', fontWeight: 600, fontSize: 14 }}>Día {card.fecha_corte}</p>
                                   </div>
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>PAGO</p>
                                     <p style={{ color: '#E5E7EB', fontWeight: 600, fontSize: 14 }}>Día {card.fecha_pago}</p>
                                   </div>
                                 </div>
                                 <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }} className="flex gap-2 items-start">
                                   <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FCA5A5' }} />
                                   <p style={{ fontSize: 12, color: '#FCA5A5', lineHeight: 1.5, margin: 0 }}>Si solo pagas el mínimo tu deuda crecerá por intereses. Se recomienda pagar el total o más del mínimo cada mes.</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                   <button onClick={() => router.push('/expenses')} style={{ background: '#1A2234', border: '1px solid #1F2D45', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>Ver Movimientos</button>
                                   <button style={{ background: '#2563EB', border: 'none', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>Registrar Pago</button>
                                 </div>
                               </>
                             ) : (
                               <>
                                 <div className="grid grid-cols-2 gap-4 mb-4">
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>SALDO ACTUAL</p>
                                     <p style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{fmtAmt(Number(card.saldo_actual))}</p>
                                   </div>
                                   <div>
                                     <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>ÚLTIMOS 4</p>
                                     <p style={{ color: 'white', fontWeight: 700, fontSize: 18, fontFamily: 'monospace', letterSpacing: 2 }}>•••• {card.ultimos_4 || '----'}</p>
                                   </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                   <button onClick={() => router.push('/expenses')} style={{ background: '#1A2234', border: '1px solid #1F2D45', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>Ver Movimientos</button>
                                   <button onClick={() => setActiveModal('transfer')} style={{ background: '#2563EB', border: 'none', borderRadius: 12, padding: 12, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>Transferir</button>
                                 </div>
                               </>
                             )}
                           </div>
                         )}
                       </div>
                     );
                   }) : (
                   <div className="w-full py-16 flex flex-col items-center justify-center bg-[var(--bg-card)] border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                         <CreditCard className="w-10 h-10" />
                      </div>
                      <div>
                         <p className="text-[var(--text-primary)] font-bold">No tienes tarjetas registradas</p>
                         <p className="text-xs text-[var(--text-muted)]">Registra tus tarjetas de crédito y débito para controlarlas.</p>
                      </div>
                   </div>
                )
               ) : (
                [...accounts].sort((a, b) => {
                  if (a.is_default) return -1;
                  if (b.is_default) return 1;
                  return 0;
                }).length > 0 ? [...accounts].sort((a,b) => {
                  if (a.is_default) return -1;
                  if (b.is_default) return 1;
                  return 0;
                }).map(acc => (
                   <div 
                    key={acc.id}
                    className="flex-shrink-0 w-[300px] md:w-[340px] snap-center rounded-[2.5rem] p-8 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-primary/5 transition-all cursor-pointer group relative overflow-hidden"
                   >
                       
                       <div className="relative z-10 flex justify-between items-start mb-10">
                         <div className="h-12 w-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            {acc.tipo_cuenta === 'ahorro' ? <PiggyBank className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                         </div>
                         <div className="flex items-start gap-2">
                            <div className="text-right">
                               <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">{acc.nombre_banco}</p>
                               <p className="text-xs font-black text-[var(--text-primary)]">{acc.alias}</p>
                            </div>
                            
                            <DropdownMenu>
                               <DropdownMenuTrigger className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors cursor-pointer outline-none">
                                  <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-48 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] p-1.5 shadow-xl">
                                  <DropdownMenuItem 
                                     onClick={() => {
                                        setSelectedItem(acc);
                                        setNewAccountType(acc.tipo_cuenta);
                                        setActiveModal('editAccount');
                                     }}
                                     className="gap-2 cursor-pointer focus:bg-[#2563EB] focus:text-white"
                                  >
                                     <Pencil className="w-4 h-4" />
                                     <span>Editar cuenta</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                     onClick={() => {
                                        setTransferFrom(acc.id);
                                        setActiveModal('transfer');
                                     }}
                                     className="gap-2 cursor-pointer focus:bg-[#2563EB] focus:text-white"
                                  >
                                     <ArrowLeftRight className="w-4 h-4" />
                                     <span>Transferir</span>
                                  </DropdownMenuItem>
                                  {acc.is_deletable !== false && (
                                     <DropdownMenuItem 
                                        onClick={() => {
                                           setSelectedItem({ ...acc, type: 'account' });
                                           setShowDeleteConfirm(true);
                                        }}
                                        className="gap-2 cursor-pointer focus:bg-red-500/10 text-red-500 focus:text-red-500"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Eliminar cuenta</span>
                                     </DropdownMenuItem>
                                  )}
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Saldo Actual</p>
                            <div className="flex items-baseline gap-1">
                               <span className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">${parseFloat(acc.saldo_actual.toString()).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                               <span className="text-xs font-bold text-[var(--text-muted)]">{acc.moneda}</span>
                            </div>
                         </div>
                         <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="px-3 py-1 bg-primary/5 text-primary text-[8px] font-bold uppercase tracking-widest rounded-full">{acc.tipo_cuenta}</span>
                             {acc.identificador_corto && (
                                <span className="text-[11px] font-bold text-white/20 tracking-widest uppercase">ID: {acc.identificador_corto}</span>
                             )}
                         </div>
                      </div>
                   </div>
                )) : (
                   <div className="w-full py-16 flex flex-col items-center justify-center bg-[var(--bg-card)] border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                      <div className="h-20 w-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                         <Wallet className="w-10 h-10" />
                      </div>
                      <div>
                         <p className="text-[var(--text-primary)] font-bold">Sin cuentas bancarias</p>
                         <p className="text-xs text-[var(--text-muted)]">Añade tus cuentas de ahorro, corriente o nómina.</p>
                      </div>
                   </div>
                )
              )}
           </div>
        </section>

        {/* INSIGHTS & BLOCKS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Block A: Upcoming Payments */}
           <div className="bg-[var(--bg-card)] rounded-[24px] p-8 shadow-[0_4px_20px_var(--shadow)] border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight italic">Próximos Pagos</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Control de fechas</p>
                 </div>
                 <Calendar className="w-5 h-5 text-primary/30" />
              </div>
                          {urgentCard ? (
                    <div className="bg-red-500/10 p-6 rounded-[2rem] border border-red-500/10 mb-6">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="h-12 w-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                             <AlertCircle className="w-6 h-6" />
                          </div>
                          <div className="overflow-hidden">
                             <p className="text-[13px] font-black text-red-600 uppercase italic tracking-tighter truncate pr-2">{urgentCard.nombre_tarjeta}</p>
                             <p className="text-[9px] text-red-500/60 uppercase tracking-[0.15em] font-black truncate">{urgentCard.nombre_banco}</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4 items-end">
                          <div className="overflow-hidden">
                             <p className="text-[9px] font-black text-red-500/50 uppercase tracking-widest mb-1">Pago Estimado</p>
                             <p className="text-2xl font-black text-red-600 tracking-tighter tabular-nums truncate">${Number(urgentCard.saldo_actual).toLocaleString()}</p>
                          </div>
                          <div className="text-right shrink-0">
                             <p className="text-[9px] font-black text-red-500/50 uppercase tracking-widest mb-1">Día Límite</p>
                             <div className="bg-red-500 text-white px-3 py-1.5 rounded-xl inline-block shadow-md">
                                <p className="text-sm font-black uppercase italic tracking-tighter">Día {urgentCard.fecha_pago}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="h-32 flex items-center justify-center text-[var(--text-muted)] italic text-xs">Sin pagos urgentes detectados</div>
                 )}
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-[var(--text-muted)] uppercase tracking-widest">Otras fechas de corte</span>
                       <span className="text-[var(--text-primary)]">{cards.length - (urgentCard ? 1 : 0)} Pendientes</span>
                    </div>
                    {cards.filter(c => c.id !== urgentCard?.id).slice(0, 2).map(c => (
                       <div key={c.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-[var(--text-secondary)] truncate w-32">{c.nombre_tarjeta}</span>
                          <span className="text-[10px] font-black text-[var(--text-muted)]">Día {c.fecha_corte}</span>
                       </div>
                    ))}
                 </div>
           </div>

           {/* Block B: Credit Usage */}
           <div className="bg-[var(--bg-card)] rounded-[24px] p-8 shadow-[0_4px_20px_var(--shadow)] border border-white/5">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight italic">Utilización Total</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Salud en Crédito</p>
                 </div>
                 <PieChart className="w-5 h-5 text-primary/30" />
              </div>
              
              <div className="flex flex-col items-center justify-center py-4">
                 <div className="relative h-40 w-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 overflow-visible">
                       <defs>
                          <linearGradient id="usageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor={creditUsagePercentage > 70 ? "#ef4444" : "#6366f1"} />
                             <stop offset="100%" stopColor={creditUsagePercentage > 70 ? "#f87171" : "#8b5cf6"} />
                          </linearGradient>
                       </defs>
                       <circle className="text-[var(--bg-secondary)]" strokeWidth="12" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                       <circle 
                        className={cn("transition-all duration-1000", creditUsagePercentage > 70 ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]")} 
                        strokeWidth="12" 
                        strokeDasharray={440} 
                        strokeDashoffset={440 - (440 * Math.min(creditUsagePercentage, 100)) / 100} 
                        strokeLinecap="round" 
                        stroke="url(#usageGradient)" 
                        fill="transparent" 
                        r="70" 
                        cx="80" 
                        cy="80" 
                       />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                       <span className="text-3xl font-black text-[var(--text-primary)] leading-none">{creditUsagePercentage.toFixed(1)}%</span>
                       <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">En uso</span>
                    </div>
                 </div>
                 
                 <div className="w-full mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-center border border-white/5">
                       <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Capacidad Total</p>
                       <p className="text-sm font-black text-[var(--text-primary)]">${totalCreditLimit.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl text-center border border-white/5">
                       <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Deuda Acumulada</p>
                       <p className="text-sm font-black text-[var(--text-primary)]">${totalCreditUsed.toLocaleString()}</p>
                    </div>
                 </div>
                 
                 <div className="mt-6 flex items-center gap-3 w-full p-4 bg-emerald-500/10 rounded-2xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">Tu uso de crédito está dentro del rango seguro (ideal { '<' } 40%).</p>
                 </div>
              </div>
           </div>

           {/* Block C & D: Latest Consume + Insight */}
           <div className="bg-[var(--bg-card)] rounded-[24px] p-8 shadow-[0_4px_20px_var(--shadow)] border border-white/5 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight italic">Insights y Consumos</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Actividad Reciente</p>
                 </div>
                 <ArrowUpRight className="w-5 h-5 text-primary/30" />
              </div>
              
              <div className="flex-1 space-y-4">
                 {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl hover:bg-[var(--bg-secondary)]/80 transition-all cursor-pointer group border border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-lg border border-white/5 group-hover:scale-110 transition-transform">
                             {CATEGORIES.find(c => c.id === tx.categoria.toLowerCase())?.id === 'comida' ? '🍔' : '🛍️'}
                          </div>
                          <div>
                             <p className="text-xs font-black text-[var(--text-primary)] leading-none mb-1">{tx.comercio || tx.categoria}</p>
                             <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{new Date(tx.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                          </div>
                       </div>
                       <p className="text-sm font-black text-[var(--text-primary)]">-${Number(tx.monto).toLocaleString()}</p>
                    </div>
                 )) : (
                    <div className="h-40 flex items-center justify-center text-[var(--text-muted)] italic text-xs">Sin movimientos recientes</div>
                 )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5">
                 <div className="p-4 bg-indigo-500/10 border border-indigo-500/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                       <TrendingDown className="w-5 h-5 text-indigo-500" />
                       <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Recomendación IA</span>
                    </div>
                    <p className="text-[11px] font-medium text-indigo-400 leading-relaxed">
                       {accounts.length && Number(accounts[0].saldo_actual) > 5000 
                         ? "Tu cuenta de ahorro creció un 12.5% respecto al mes pasado. ¡Buen trabajo!"
                         : "Considera configurar recordatorios para tu tarjeta con corte el día 15."}
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* 4. LÍMITES POR CATEGORÍA (PREMIUM SUBSECTION) */}
        <section className="space-y-8">
           <div className="flex items-center justify-between px-4">
              <div>
                 <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Límites por Categoría</h2>
                 <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">Presupuesto Mensual Basado en Gastos Reales</p>
              </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sincronización Activa</span>
               </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {CATEGORIES.map(cat => {
                 const spent = expensesByCategory[cat.id] || 0;
                 const budgetItem = budgets.find(b => b.categoria === cat.id);
                 const limit = budgetItem?.limite_mensual || 0;
                 const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                 const isExceeded = percentage >= 100;
                 const isWarning = percentage >= 70 && percentage < 100;

                 return (
                      <div 
                        key={cat.id} 
                        onClick={() => { setSelectedCategory(cat.id); setActiveModal('editBudget'); }}
                        className="bg-white dark:bg-[#1e293b] rounded-[16px] p-[16px] shadow-sm border border-white/5 dark:border-[#334155] hover:shadow-xl transition-all cursor-pointer hover:border-primary/20 group"
                      >
                        <div className="flex justify-between items-start mb-6">
                           <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", 
                              cat.bg,
                              "dark:bg-white/10 dark:rounded-[12px]"
                           )}>
                              <cat.icon className={cn("w-6 h-6", cat.color, "dark:text-white")} />
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase">Gastado</p>
                              <p className="text-[18px] font-bold text-[#0f172a] dark:text-[#f1f5f9]">${spent.toLocaleString()}</p>
                           </div>
                        </div>
                        
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <p className="text-[13px] font-bold text-[#0f172a] dark:text-[#f1f5f9] uppercase tracking-tight">{cat.name}</p>
                              <p className={cn(
                                 "text-[11px] font-medium",
                                 limit > 0 ? "text-[var(--text-muted)]" : "text-[#64748b] dark:text-[#94a3b8]"
                              )}>
                                 {limit > 0 ? `Límite: $${limit.toLocaleString()}` : "Pulsa para definir límite"}
                              </p>
                           </div>
                           
                           <div className="h-3 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-white/5 dark:border-[#334155]">
                              {limit > 0 && (
                                 <div 
                                    className={cn(
                                       "h-full transition-all duration-1000",
                                       isExceeded ? "bg-red-500" : isWarning ? "bg-orange-400" : "bg-primary"
                                    )} 
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                 />
                              )}
                           </div>
                           
                           <div className="flex items-center justify-between">
                              <span className={cn(
                                 "text-[11px] font-black uppercase tracking-widest",
                                 isExceeded ? "text-red-500" : isWarning ? "text-orange-500" : percentage > 0 ? "text-primary" : "text-[#94a3b8] dark:text-[#64748b] italic"
                              )}>
                                 {isExceeded ? "Superado" : isWarning ? "Cerca del Límite" : limit > 0 ? "Bajo control" : "Sin definir"}
                              </span>
                              {percentage > 0 && (
                                 <span className="text-[10px] font-black text-[var(--text-primary)]">{percentage.toFixed(0)}%</span>
                              )}
                           </div>
                        </div>
                     </div>
                 );
              })}
           </div>
        </section>
      </div>

      {/* MODALS */}
      {/* 1. New Card Modal */}
      <Dialog open={activeModal === 'newCard'} onOpenChange={(o) => setActiveModal(o ? 'newCard' : null)}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md bg-[var(--bg-card)] border-none">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">Añadir Tarjeta</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleAddCard} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Banco</label>
                    <input name="nombre_banco" placeholder="Ej: Bancolombia" className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none" required />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Nombre/Alias</label>
                    <input name="nombre_tarjeta" placeholder="Visa Black" className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none" required />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Tipo</label>
                    <select 
                        name="tipo_tarjeta" 
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value as 'credito' | 'debito')}
                        className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none cursor-pointer"
                     >
                       <option value="credito">Crédito</option>
                       <option value="debito">Débito</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Últimos 4</label>
                    <input name="ultimos_4" maxLength={4} placeholder="4242" className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none" required />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Límite (si es crédito)</label>
                    <input 
                        name="limite" 
                        type="text" 
                        placeholder="5000" 
                        value={moneyFields['cardLimit'] || ''}
                        onChange={(e) => setMoneyFields(prev => ({ ...prev, cardLimit: parseMoney(e.target.value) }))}
                        className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none" 
                        required={cardType === 'credito'}
                     />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Saldo/Uso Inicial</label>
                    <input 
                        name="saldo_actual" 
                        type="text" 
                        placeholder="0.00" 
                        value={moneyFields['cardBalance'] || ''}
                        onChange={(e) => setMoneyFields(prev => ({ ...prev, cardBalance: parseMoney(e.target.value) }))}
                        className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none" 
                        required 
                     />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Día Corte</label>
                    <input 
                        name="fecha_corte" 
                        type="text" 
                        placeholder="15" 
                        className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none" 
                        required={cardType === 'credito'}
                        onChange={() => setDayErrors(prev => ({ ...prev, corte: '' }))}
                     />
                     {dayErrors.corte && <p className="text-[9px] text-red-500 font-bold px-2 uppercase tracking-tighter">{dayErrors.corte}</p>}
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Día Pago</label>
                    <input 
                        name="fecha_pago" 
                        type="text" 
                        placeholder="05" 
                        className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none" 
                        required={cardType === 'credito'}
                        onChange={() => setDayErrors(prev => ({ ...prev, pago: '' }))}
                     />
                     {dayErrors.pago && <p className="text-[9px] text-red-500 font-bold px-2 uppercase tracking-tighter">{dayErrors.pago}</p>}
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 italic">Color Tarjeta</label>
                  <select name="color" className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border-none font-bold text-[var(--text-primary)] outline-none cursor-pointer">
                     <option value="#4F46E5">Indigo Premium</option>
                     <option value="#000000">Carbon Black</option>
                     <option value="#DC2626">Ruby Red</option>
                     <option value="#059669">Emerald Green</option>
                     <option value="#7C3AED">Amethyst Purple</option>
                     <option value="#EA580C">Blazing Orange</option>
                     <option value="#D97706">Amber Gold</option>
                     <option value="#0284C7">Ocean Blue</option>
                  </select>
              </div>
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all mt-4">Registrar Tarjeta</button>
           </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeModal === 'newAccount'} onOpenChange={(o) => setActiveModal(o ? 'newAccount' : null)}>
        <DialogContent className="rounded-[20px] max-w-[400px] w-full bg-[var(--bg-card)] border-none p-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
           <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)]">Añadir Cuenta</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nombre / Alias</label>
                 <input 
                    name="alias" 
                    placeholder="Ej: Ahorro Principal" 
                    className="w-full h-10 px-4 rounded-[10px] bg-[var(--bg-secondary)] border-none font-medium text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary/30 transition-all" 
                    required 
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Banco</label>
                 <input 
                    name="nombre_banco" 
                    placeholder="Nombre del banco" 
                    className="w-full h-10 px-4 rounded-[10px] bg-[var(--bg-secondary)] border-none font-medium text-sm text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary/30 transition-all" 
                    required 
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center block mb-1">Tipo de Cuenta</label>
                 <div className="flex gap-2 justify-center">
                    {['corriente', 'ahorro', 'nomina'].map(type => (
                       <button
                          key={type}
                          type="button"
                          onClick={() => setNewAccountType(type)}
                          className={cn(
                             "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                             newAccountType === type 
                                ? "bg-primary text-white border-primary" 
                                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-white/5"
                          )}
                       >
                          {type}
                       </button>
                    ))}
                    <input type="hidden" name="tipo_cuenta" value={newAccountType} />
                 </div>
              </div>

              {/* 💡 Educational Message for Savings Account */}
              {newAccountType === 'ahorro' && savingsInfoVisible && (
                 <div className="relative p-5 rounded-[20px] bg-blue-500/10 border border-blue-500/20 mt-4 overflow-hidden group">
                    <button 
                       type="button"
                       onClick={() => {
                          setSavingsInfoVisible(false);
                          localStorage.setItem('hideSavingsInfo', 'true');
                       }}
                       className="absolute top-2 right-2 p-1 text-blue-500/50 hover:text-blue-500 transition-colors"
                    >
                       <X className="w-4 h-4" />
                    </button>
                    <div className="flex gap-3">
                       <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                          <Info className="w-4 h-4 shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                       </div>
                       <div className="space-y-2">
                          <p className="text-xs font-bold text-blue-500 leading-tight">¿Para qué sirve una cuenta de ahorro?</p>
                          <p className="text-[10px] text-blue-600/80 dark:text-blue-300 leading-relaxed font-medium">
                             En la vida real, tener una cuenta de ahorro separada protege tu dinero de gastos impulsivos.
                             <br/><br/>
                             En Buco, tu cuenta de ahorro es el puente entre tu dinero libre y tus metas financieras.
                          </p>
                          <div className="pt-2 flex flex-col gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest">
                             <span>1. Cuenta principal</span>
                             <span>2. → Cuenta ahorro</span>
                             <span>3. → Abono a meta</span>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Saldo Inicial</label>
                    <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-bold">$</span>
                       <input
                           name="saldo_actual"
                           type="text"
                           placeholder="0.00"
                           value={moneyFields['accountBalance'] || ''}
                           onChange={(e) => setMoneyFields(prev => ({ ...prev, accountBalance: parseMoney(e.target.value) }))}
                           className="w-full h-10 pl-7 pr-4 rounded-[10px] bg-[var(--bg-secondary)] border-none font-bold text-sm text-[var(--text-primary)] outline-none"
                           required
                        />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Moneda</label>
                    <input 
                       name="moneda" 
                       defaultValue="USD" 
                       className="w-full h-10 px-4 rounded-[10px] bg-[var(--bg-secondary)] border-none font-bold text-sm text-[var(--text-primary)] outline-none" 
                       required 
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Últimos 4 dígitos (Opcional)</label>
                 <input 
                    name="identificador_corto" 
                    maxLength={4} 
                    placeholder="Ej: 8821" 
                    className="w-full h-10 px-4 rounded-[10px] bg-[var(--bg-secondary)] border-none font-medium text-sm text-[var(--text-primary)] outline-none" 
                 />
              </div>

              <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all mt-6 active:scale-[0.98]">
                 Guardar Cuenta
              </button>
           </form>
        </DialogContent>
      </Dialog>

      {/* 3. Edit Budget Modal */}
      <Dialog open={activeModal === 'editBudget'} onOpenChange={(o) => { setActiveModal(o ? 'editBudget' : null); if(!o) setSelectedCategory(null); }}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md bg-[var(--bg-card)] border-none">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black capitalize text-[var(--text-primary)] italic">Límite de {selectedCategory}</DialogTitle>
           </DialogHeader>
           <form onSubmit={handleUpdateBudget} className="space-y-6 py-6">
              <input type="hidden" name="categoria" value={selectedCategory || ""} />
              <div className="space-y-2 text-center">
                 <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] italic">Establecer Límite Mensual</label>
                 <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[var(--border)] text-3xl">$</span>
                    <input 
                      name="limite_mensual" 
                      type="text" 
                      autoFocus
                      value={moneyFields['editBudgetLimit'] || ''}
                      onChange={(e) => setMoneyFields(prev => ({ ...prev, editBudgetLimit: parseMoney(e.target.value) }))}
                      className="w-full py-8 px-12 rounded-3xl bg-[var(--bg-secondary)] border-none text-center font-black text-5xl text-[var(--text-primary)] focus:ring-0 outline-none" 
                      placeholder="0"
                    />
                 </div>
              </div>
              
              <div className="bg-blue-500/10 p-6 rounded-3xl space-y-3">
                 <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Información de Gasto</span>
                 </div>
                 <p className="text-sm font-medium text-blue-600 dark:text-blue-400 leading-relaxed">
                    Este mes has gastado <span className="font-black text-blue-500">${(expensesByCategory[selectedCategory || ""] || 0).toLocaleString()}</span> en esta categoría.
                 </p>
              </div>

              <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                 Actualizar Presupuesto
              </button>
           </form>
        </DialogContent>
      </Dialog>
      {/* 4. Transfer Between Accounts Modal */}
      <Dialog open={activeModal === 'transfer'} onOpenChange={(o) => setActiveModal(o ? 'transfer' : null)}>
        <DialogContent className="rounded-[20px] max-w-[400px] w-full bg-[var(--bg-card)] border-none p-5">
           <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-[var(--text-primary)]">Transferir entre cuentas</DialogTitle>
           </DialogHeader>
           
           <div className="space-y-5">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">De:</label>
                 <DropdownMenu>
                    <DropdownMenuTrigger className="w-full h-14 px-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left cursor-pointer flex items-center justify-between gap-3 outline-none">
                       {transferFrom ? (() => {
                          const acc = accounts.find(a => a.id === transferFrom);
                          return acc ? (
                             <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                   <Wallet className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] truncate">{acc.alias || acc.nombre_banco}</p>
                                   <p className="text-[10px] text-[var(--text-muted)] font-medium">{acc.nombre_banco} · <span className="text-emerald-400 font-black">${Number(acc.saldo_actual).toLocaleString()}</span></p>
                                </div>
                             </div>
                          ) : null;
                       })() : (
                          <span className="text-[var(--text-muted)] text-sm font-medium">Seleccionar cuenta origen</span>
                       )}
                       <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[320px] bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-2 shadow-xl z-50">
                       {accounts.map(acc => (
                          <DropdownMenuItem
                             key={acc.id}
                             onClick={() => setTransferFrom(acc.id)}
                             className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-secondary)] focus:bg-[var(--bg-secondary)] outline-none"
                          >
                             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Wallet className="w-4 h-4 text-primary" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] leading-none">{acc.alias || acc.nombre_banco}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">{acc.nombre_banco}</p>
                             </div>
                             <span className="text-sm font-black text-emerald-400">${Number(acc.saldo_actual).toLocaleString()}</span>
                             {transferFrom === acc.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                          </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                 <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-4 border-[var(--bg-card)]">
                    <ArrowLeftRight className="w-3 h-3 rotate-90" />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">A:</label>
                 <DropdownMenu>
                    <DropdownMenuTrigger className="w-full h-14 px-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-left cursor-pointer flex items-center justify-between gap-3 outline-none">
                       {transferTo ? (() => {
                          const acc = accounts.find(a => a.id === transferTo);
                          return acc ? (
                             <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                   <PiggyBank className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] truncate">{acc.alias || acc.nombre_banco}</p>
                                   <p className="text-[10px] text-[var(--text-muted)] font-medium">{acc.nombre_banco} · <span className="text-emerald-400 font-black">${Number(acc.saldo_actual).toLocaleString()}</span></p>
                                </div>
                             </div>
                          ) : null;
                       })() : (
                          <span className="text-[var(--text-muted)] text-sm font-medium">Seleccionar cuenta destino</span>
                       )}
                       <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[320px] bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl p-2 shadow-xl z-50">
                       {accounts.filter(acc => acc.id !== transferFrom).map(acc => (
                          <DropdownMenuItem
                             key={acc.id}
                             onClick={() => setTransferTo(acc.id)}
                             className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-secondary)] focus:bg-[var(--bg-secondary)] outline-none"
                          >
                             <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                <PiggyBank className="w-4 h-4 text-blue-400" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-primary)] leading-none">{acc.alias || acc.nombre_banco}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">{acc.nombre_banco}</p>
                             </div>
                             <span className="text-sm font-black text-emerald-400">${Number(acc.saldo_actual).toLocaleString()}</span>
                             {transferTo === acc.id && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                          </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Monto</label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">$</span>
                    <input 
                       type="text"
                       value={transferAmount}
                       onChange={(e) => setTransferAmount(parseMoney(e.target.value))}
                       placeholder="0.00"
                       className="w-full h-14 pl-10 pr-4 rounded-xl bg-[var(--bg-secondary)] border-none font-black text-2xl text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nota (Opcional)</label>
                 <input 
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="Ej: Para mi meta de Viaje"
                    className="w-full h-11 px-4 rounded-xl bg-[var(--bg-secondary)] border-none font-medium text-sm text-[var(--text-primary)] outline-none"
                 />
              </div>

              <button 
                onClick={async () => {
                   if (!transferFrom || !transferTo || !transferAmount) return;
                   try {
                      const res = await transferBetweenAccounts(transferFrom, transferTo, parseFloat(transferAmount), transferNote);
                      if (res.success) {
                         setActiveModal(null);
                         setTransferAmount('');
                         setTransferNote('');
                         setTransferFrom('');
                         setTransferTo('');
                         router.refresh();
                      }
                   } catch (err: any) {
                      alert(err.message);
                   }
                }}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:opacity-90 shadow-lg shadow-primary/20 transition-all mt-4 active:scale-[0.98]"
              >
                 Confirmar transferencia
              </button>
           </div>
        </DialogContent>
      </Dialog>
      {/* MODALES DE EDICIÓN Y ELIMINACIÓN */}
      
      {/* Edit Card Modal */}
      <Dialog open={activeModal === 'editCard'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md bg-[var(--bg-card)] border-white/5 text-white p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">Editar Tarjeta</DialogTitle>
            <DialogDescription className="text-white/40 font-medium">Actualiza los detalles de tu tarjeta de crédito o débito.</DialogDescription>
          </DialogHeader>
          <form action={async (formData) => {
            if (!selectedItem) return;
            await updateCard(selectedItem.id, formData);
            setActiveModal(null);
            setSelectedItem(null);
          }} className="p-8 pt-4 space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Nombre de la Tarjeta</label>
                  <input 
                    name="nombre_tarjeta"
                    defaultValue={selectedItem?.nombre_tarjeta || ''}
                    className="w-full bg-[var(--bg-elevated)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Ej. Visa Platinum"
                    required
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Banco</label>
                    <input 
                      name="nombre_banco"
                      defaultValue={selectedItem?.nombre_banco || ''}
                      className="w-full bg-[var(--bg-elevated)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="Ej. Banco General"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Últimos 4 Dígitos</label>
                    <input 
                      name="ultimos_4"
                      defaultValue={selectedItem?.ultimos_4 || ''}
                      className="w-full bg-[var(--bg-elevated)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="0000"
                      maxLength={4}
                    />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Saldo / Deuda Actual</label>
                  <input
                    name="saldo_actual"
                    type="text"
                    value={moneyFields['editCardBalance'] || (selectedItem?.saldo_actual?.toString() || '')}
                    onChange={(e) => setMoneyFields(prev => ({ ...prev, editCardBalance: parseMoney(e.target.value) }))}
                    className="w-full bg-[var(--bg-elevated)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="0.00"
                    required
                  />
               </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Color Tarjeta</label>
                   <select 
                     name="color" 
                     defaultValue={selectedItem?.color || '#4F46E5'}
                     className="w-full bg-[var(--bg-elevated)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                   >
                     <option value="#4F46E5">Indigo Premium</option>
                     <option value="#000000">Carbon Black</option>
                     <option value="#DC2626">Ruby Red</option>
                     <option value="#059669">Emerald Green</option>
                     <option value="#7C3AED">Amethyst Purple</option>
                     <option value="#EA580C">Blazing Orange</option>
                     <option value="#D97706">Amber Gold</option>
                     <option value="#0284C7">Ocean Blue</option>
                   </select>
                </div>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
               <button 
                 type="button"
                 onClick={() => setActiveModal(null)}
                 className="flex-1 h-12 rounded-2xl border border-white/5 text-sm font-bold hover:bg-white/5 transition-all"
               >
                 Cancelar
               </button>
               <button 
                 type="submit"
                 className="flex-1 h-12 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 Guardar Cambios
               </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={activeModal === 'editAccount'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md bg-[var(--bg-card)] border-white/5 text-[var(--text-primary)] p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="p-8 pb-4 text-left">
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">Editar Cuenta</DialogTitle>
            <DialogDescription className="text-[var(--text-muted)] font-medium">Modifica los datos de tu cuenta bancaria.</DialogDescription>
          </DialogHeader>
          <form action={async (formData) => {
            if (!selectedItem) return;
            await updateBankAccount(selectedItem.id, formData);
            setActiveModal(null);
            setSelectedItem(null);
          }} className="p-8 pt-4 space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">Alias de la Cuenta</label>
                  <input 
                    name="alias"
                    defaultValue={selectedItem?.alias || ''}
                    className="w-full bg-[var(--bg-secondary)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Ej. Mi Ahorro"
                    required
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">Banco</label>
                  <input 
                    name="nombre_banco"
                    defaultValue={selectedItem?.nombre_banco || ''}
                    className="w-full bg-[var(--bg-secondary)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Ej. BAC Credomatic"
                    required
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block">Saldo Actual</label>
                  <input
                    name="saldo_actual"
                    type="text"
                    value={moneyFields['editAccountBalance'] || (selectedItem?.saldo_actual?.toString() || '')}
                    onChange={(e) => setMoneyFields(prev => ({ ...prev, editAccountBalance: parseMoney(e.target.value) }))}
                    className="w-full bg-[var(--bg-secondary)] border border-white/5 rounded-2xl px-5 py-4 text-sm font-black text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="0.00"
                    required
                  />
               </div>
            </div>
            <DialogFooter className="pt-4 flex gap-3">
               <button 
                 type="button"
                 onClick={() => setActiveModal(null)}
                 className="flex-1 h-12 rounded-2xl border border-white/5 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
               >
                 Cancelar
               </button>
               <button 
                 type="submit"
                 className="flex-1 h-12 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 Actualizar
               </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm bg-[var(--bg-card)] border-white/5 text-white p-8 rounded-[2rem]">
          <DialogHeader className="mb-6">
            <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4 mx-auto">
               <Trash2 className="w-7 h-7" />
            </div>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-center">¿Eliminar {selectedItem?.type === 'card' ? 'tarjeta' : 'cuenta'}?</DialogTitle>
            <DialogDescription className="text-white/40 font-medium text-center mt-2">
              Esta acción no se puede deshacer. Los datos asociados se perderán permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <button 
              onClick={async () => {
                if (!selectedItem) return;
                console.log('[delete] id:', selectedItem.id, 'type:', selectedItem.type);
                setIsDeleting(true);
                try {
                  if (selectedItem.type === 'card') {
                    await deleteCard(selectedItem.id);
                    setCards(prev => prev.filter(c => c.id !== selectedItem.id));
                  } else {
                    await deleteBankAccount(selectedItem.id);
                    setAccounts(prev => prev.filter(a => a.id !== selectedItem.id));
                  }
                  setShowDeleteConfirm(false);
                  setSelectedItem(null);
                } catch (err) {
                  console.error('[delete] error:', err);
                  // No reverting needed — we only remove from state AFTER success
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              className="w-full h-14 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full h-14 rounded-2xl border border-white/5 text-sm font-bold hover:bg-white/5 transition-all text-white/70"
            >
              Cancelar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

