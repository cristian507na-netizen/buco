"use client";

import { useState, useMemo, memo, useCallback, useRef } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  ChevronRight, 
  ArrowUpRight, 
  TrendingDown, 
  Calendar,
  Smartphone,
  Utensils,
  Heart,
  Sparkles,
  Play,
  GraduationCap,
  MoreHorizontal,
  Car,
  ShoppingBag,
  Home,
  Receipt,
  MoreVertical,
  CreditCard,
  CheckCircle2,
  Tv,
  BookOpen,
  Shirt,
  Smartphone as PhoneIcon,
  X,
  ArrowDownRight,
  Bell,
  AlertCircle,
  Target,
  Edit2,
  Trash2,
  Wallet,
  PiggyBank
} from "lucide-react";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { createExpense, createIncome } from "@/app/expenses/actions";
import { deleteMovement } from "@/app/dashboard/actions";
import { updateWhatsAppNumber } from "@/app/profile/actions";
import { useRouter } from "next/navigation";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";

import { useEffect } from "react";
import { useRealtime } from "@/hooks/useRealtime";

interface Movement {
  id: string;
  monto: number;
  categoria: string;
  comercio?: string;
  descripcion: string;
  fecha: string;
  metodo_pago: string;
  origen: string;
  type: 'expense' | 'income';
  factura_url?: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
}

interface ExpensesClientProps {
  initialExpenses: Movement[];
  initialIncomes: Movement[];
  accounts: Account[];
  userId: string;
  profile?: { whatsapp_numero?: string | null; whatsapp_connected?: boolean | null };
}

const CATEGORIES = [
  { id: 'todos', name: 'Todos', icon: Filter },
  { id: 'comida', name: 'Comida', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'transporte', name: 'Transporte', icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'salud', name: 'Salud', icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'ocio', name: 'Ocio', icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'compras', name: 'Compras', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'hogar', name: 'Hogar', icon: Home, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'suscripciones', name: 'Suscripción', icon: Play, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'educacion', name: 'Educación', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'ahorro', name: 'Ahorro', icon: PiggyBank, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  { id: 'otros', name: 'Otros', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-500/10' },
];

const METHODS = ['Todos', 'Efectivo', 'Débito', 'Crédito', 'Transferencia'];
const ORIGINS = ['Todos', 'Manual', 'WhatsApp', 'Telegram', 'PDF Import'];

interface MovementItemProps {
  move: Movement;
  onSelect: (move: Movement) => void;
  onDelete: (move: Movement) => void;
}

const SWIPE_REVEAL = 80;

const MovementItem = memo(function MovementItem({ move, onSelect, onDelete }: MovementItemProps) {
  const cat = CATEGORIES.find(c => c.id === move.categoria) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = move.type === 'income' ? ArrowUpRight : cat.icon;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef(false);
  const [offsetX, setOffsetX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!isDragging.current && Math.abs(dy) > Math.abs(dx)) return;
    isDragging.current = true;
    if (dx < 0) {
      setOffsetX(Math.max(dx, -SWIPE_REVEAL));
    } else {
      setOffsetX(Math.min(0, offsetX + dx));
    }
  };

  const handleTouchEnd = () => {
    if (offsetX < -(SWIPE_REVEAL / 2)) {
      setOffsetX(-SWIPE_REVEAL);
    } else {
      setOffsetX(0);
    }
  };

  const handleClick = () => {
    if (offsetX !== 0) {
      setOffsetX(0);
    } else {
      onSelect(move);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem]">
      {/* Swipe-reveal delete button */}
      <div
        className="absolute right-0 top-0 h-full flex items-center justify-center bg-red-500 rounded-[2rem]"
        style={{ width: SWIPE_REVEAL }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(move); }}
          className="flex flex-col items-center justify-center gap-0.5 text-white h-full w-full"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[9px] font-bold">Eliminar</span>
        </button>
      </div>

      {/* Main card */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s ease',
        }}
        className="group bg-[var(--bg-card)] rounded-[2rem] p-6 flex items-center gap-5 hover:shadow-xl hover:shadow-[var(--shadow)] transition-shadow cursor-pointer border border-[var(--border-color)]"
      >
        <div className={cn(
          "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 shadow-sm",
          move.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : (cat.bg || "bg-gray-500/10") + " " + (cat.color || "text-gray-500")
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-bold text-[var(--text-primary)] truncate">
              {move.comercio || move.descripcion}
            </h4>
            {move.origen !== 'manual' && (
              <span className="px-2 py-0.5 bg-blue-50 text-[8px] font-black text-blue-500 uppercase rounded-full">Auto</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
            <span>{cat.name}</span>
            <span>•</span>
            <span>{new Date(move.fecha).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="text-right shrink-0 px-2">
          <div className={cn(
            "text-lg font-black tracking-tighter",
            move.type === 'income' ? "text-emerald-500" : "text-[var(--text-primary)]"
          )}>
            {move.type === 'income' ? '+' : '-'}${move.monto.toLocaleString()}
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] capitalize">{(move.metodo_pago ?? '').replace('_', ' ')}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(move); }}
            className="hidden group-hover:flex h-8 w-8 rounded-full items-center justify-center text-red-400 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-gray-200 group-hover:text-gray-400 group-hover:bg-gray-50 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default function ExpensesClient({ initialExpenses, initialIncomes, accounts, userId, profile }: ExpensesClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedMethod, setSelectedMethod] = useState("Todos");
  const [selectedOrigin, setSelectedOrigin] = useState("Todos");
  const [timeRange, setTimeRange] = useState<'hoy' | 'semana' | 'mes' | 'anual' | 'todos'>('mes');
  
  const [activeModal, setActiveModal] = useState<'detail' | 'pdf' | 'automation' | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Movement | null>(null);
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState(profile?.whatsapp_numero || '');
  const [whatsappConnected, setWhatsappConnected] = useState(profile?.whatsapp_connected || false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappError, setWhatsappError] = useState('');
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);

  const MOVEMENTS_LIMIT = 5;

  // Realtime State
  const [expenses, setExpenses] = useState<Movement[]>(initialExpenses);
  const [incomes, setIncomes] = useState<Movement[]>(initialIncomes);

  // Realtime Subscriptions
  useRealtime({
    table: 'expenses',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setExpenses(prev => [{ ...newVal, type: 'expense' }, ...prev]),
    onUpdate: (updated) => setExpenses(prev => prev.map(e => e.id === updated.id ? { ...updated, type: 'expense' } : e)),
    onDelete: (deleted) => setExpenses(prev => prev.filter(e => e.id !== deleted.id))
  });

  useRealtime({
    table: 'incomes',
    filter: `user_id=eq.${userId}`,
    onInsert: (newVal) => setIncomes(prev => [{ ...newVal, type: 'income' }, ...prev]),
    onUpdate: (updated) => setIncomes(prev => prev.map(i => i.id === updated.id ? { ...updated, type: 'income' } : i)),
    onDelete: (deleted) => setIncomes(prev => prev.filter(i => i.id !== deleted.id))
  });

  // Unified Movements
  const allMovements = useMemo(() => {
    const combined = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const })),
      ...incomes.map(i => ({ ...i, type: 'income' as const }))
    ];
    return combined.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [expenses, incomes]);

  // Filtered Logic
  // Stats Movements (Follow Time Range, Category, Method, and Origin filters)
  const statsMovements = useMemo(() => {
    let filtered = [...allMovements];

    if (selectedCategory !== "todos") {
      filtered = filtered.filter(m => m.categoria === selectedCategory);
    }

    if (selectedMethod !== "Todos") {
      const methodKey = selectedMethod === 'Débito' ? 'tarjeta_debito' : selectedMethod === 'Crédito' ? 'tarjeta_credito' : selectedMethod.toLowerCase();
      filtered = filtered.filter(m => m.metodo_pago.toLowerCase().includes(methodKey));
    }

    if (selectedOrigin !== "Todos") {
      const srcKey = selectedOrigin.toLowerCase().replace(' ', '_');
      filtered = filtered.filter(m => m.origen.toLowerCase().includes(srcKey));
    }

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const parseAsLocal = (dStr: string) => {
      if (!dStr) return new Date();
      const parts = dStr.split('T')[0].split('-');
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    };

    if (timeRange === 'hoy') {
      filtered = filtered.filter(m => m.fecha.split('T')[0] === todayStr);
    } else if (timeRange === 'semana') {
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      weekStart.setDate(weekStart.getDate() - 7);
      filtered = filtered.filter(m => parseAsLocal(m.fecha) >= weekStart);
    } else if (timeRange === 'mes') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(m => parseAsLocal(m.fecha) >= monthStart);
    } else if (timeRange === 'anual') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter(m => parseAsLocal(m.fecha) >= yearStart);
    }

    return filtered;
  }, [allMovements, selectedCategory, selectedMethod, selectedOrigin, timeRange]);

  // List Movements (Search across statsMovements filters)
  const filteredMovements = useMemo(() => {
    if (searchTerm.trim()) {
      const lowSearch = searchTerm.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const numericSearch = searchTerm.replace(/[^\d]/g, '');

      return statsMovements.filter(m => {
        const amountStr = m.monto.toString();
        const comercioStr = (m.comercio?.toLowerCase() || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const descStr = (m.descripcion?.toLowerCase() || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const catStr = (m.categoria?.toLowerCase() || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const methodStr = (m.metodo_pago?.toLowerCase() || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return comercioStr.includes(lowSearch) || 
               descStr.includes(lowSearch) ||
               catStr.includes(lowSearch) ||
               methodStr.includes(lowSearch) ||
               (numericSearch && amountStr.includes(numericSearch)) ||
               amountStr.includes(lowSearch);
      });
    }
    return statsMovements;
  }, [searchTerm, statsMovements]);

  // Total sums helper
  const getMovementsSum = (movements: Movement[], type: 'expense' | 'income') => {
    return movements.filter(m => m.type === type).reduce((acc, m) => acc + m.monto, 0);
  };

  // Stats Logic (ALWAYS uses statsMovements, NEVER filteredMovements)
  const stats = useMemo(() => {
    const currentTotalExp = getMovementsSum(statsMovements, 'expense');
    const currentTotalInc = getMovementsSum(statsMovements, 'income');
    const count = statsMovements.filter(m => m.type === 'expense').length;
    const avg = count ? (currentTotalExp / count) : 0;
    
    // Comparison to previous period logic...
    const now = new Date();
    let prevMovements = [...allMovements];
    if (timeRange === 'hoy') {
      const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
      prevMovements = prevMovements.filter(m => new Date(m.fecha).toDateString() === yesterday.toDateString());
    } else if (timeRange === 'semana') {
      const prevWeekStart = new Date(now); prevWeekStart.setDate(now.getDate() - 14);
      const prevWeekEnd = new Date(now); prevWeekEnd.setDate(now.getDate() - 7);
      prevMovements = prevMovements.filter(m => {
        const d = new Date(m.fecha);
        return d >= prevWeekStart && d < prevWeekEnd;
      });
    } else if (timeRange === 'mes') {
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      prevMovements = prevMovements.filter(m => {
        const d = new Date(m.fecha);
        return d >= prevMonthStart && d <= prevMonthEnd;
      });
    } else if (timeRange === 'anual') {
       const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
       const prevYearEnd = new Date(now.getFullYear() - 1, 11, 31);
       prevMovements = prevMovements.filter(m => {
         const d = new Date(m.fecha);
         return d >= prevYearStart && d <= prevYearEnd;
       });
    }

    const prevTotalExp = getMovementsSum(prevMovements, 'expense');
    const diffExp = prevTotalExp ? ((currentTotalExp - prevTotalExp) / prevTotalExp) * 100 : 0;
    const prevTotalInc = getMovementsSum(prevMovements, 'income');
    const diffInc = prevTotalInc ? ((currentTotalInc - prevTotalInc) / prevTotalInc) * 100 : 0;

    // Top Category
    const catCounts: Record<string, number> = {};
    statsMovements.filter(m => m.type === 'expense').forEach(m => {
      catCounts[m.categoria] = (catCounts[m.categoria] || 0) + m.monto;
    });
    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const topCatId = sortedCats[0]?.[0] || 'otros';
    const topCatObj = CATEGORIES.find(c => c.id === topCatId) || CATEGORIES[CATEGORIES.length - 1];
    
    // Top Method
    const methodCounts: Record<string, number> = {};
    statsMovements
      .filter(m => m.type === 'expense' && m.metodo_pago && m.metodo_pago !== 'null')
      .forEach(m => {
        methodCounts[m.metodo_pago] = (methodCounts[m.metodo_pago] || 0) + 1;
      });
    const topMethodId = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'S/E';

    return { 
      totalExp: currentTotalExp, 
      totalInc: currentTotalInc, 
      avg, 
      topCat: topCatObj, 
      topMethodId, 
      diffExp, 
      diffInc,
      prevTotalExp,
      prevTotalInc
    };
  }, [statsMovements, allMovements, timeRange]);

  // Category Distribution for Doughnut placeholders
  const categoryChartData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredMovements.filter(m => m.type === 'expense').forEach(m => {
      data[m.categoria] = (data[m.categoria] || 0) + m.monto;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredMovements]);


  const handleSelectMovement = useCallback((move: Movement) => {
    setSelectedMovement(move);
    setActiveModal('detail');
  }, []);

  const handleRequestDelete = useCallback((move: Movement) => {
    setDeleteTarget(move);
  }, []);

  const handleDeleteMovement = async (id: string, type: 'expense' | 'income') => {
    try {
      await deleteMovement(id, type);
      if (type === 'expense') {
        setExpenses(prev => prev.filter(e => e.id !== id));
      } else {
        setIncomes(prev => prev.filter(i => i.id !== id));
      }
      setActiveModal(null);
      setSelectedMovement(null);
      setDeleteTarget(null);
    } catch (err) {
      console.error('[deleteMovement] error:', err);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const item = CATEGORIES.find(c => c.id === cat.toLowerCase());
    return item?.icon || MoreVertical;
  };

  const getOriginIcon = (origin: string) => {
     if (origin === 'whatsapp') return PhoneIcon;
     if (origin === 'telegram') return Tv; 
     if (origin === 'pdf_import') return FileText;
     return Wallet;
  };

  return (
    <div className="flex-1 min-h-screen bg-[var(--bg-secondary)] pb-24 lg:pb-12 text-[var(--text-primary)] page-transition">
      {/* 🚀 PREMIUM HEADER */}
      <div className="section-hero min-h-[180px] md:h-[160px] h-auto py-8 px-6 relative" style={{ borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto w-full relative z-10 px-6 md:px-8 py-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                    <div className="flex items-center gap-2">
                       <div className="h-4 w-1 bg-white/30 rounded-full" />
                       <span className="text-[11px] font-bold text-white/70 uppercase tracking-[1.5px] whitespace-nowrap">Movimientos</span>
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
                 <h1 className="text-[26px] font-bold tracking-tight text-white leading-none mb-1.5 truncate">Gastos e Ingresos</h1>
                 <p className="text-white/80 font-medium text-[13px] opacity-80 line-clamp-1">Controla cada detalle de tu flujo de efectivo diario.</p>
              </div>

              <div className="flex items-center gap-3">
                <NewTransactionModal 
                  userId={userId}
                  trigger={
                    <button className="h-10 px-5 rounded-xl bg-white text-[#1450A0] font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-[0.98] w-full sm:w-auto">
                      <Plus className="w-4 h-4" />
                      <span>Nuevo</span>
                    </button>
                  }
                />

                {/* Desktop Bell */}
                <div className="hidden md:block">
                   <NotificationsModal 
                     userId={userId} 
                     trigger={
                       <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer relative hover:bg-white/20">
                         <Bell className="w-5 h-5" />
                       </div>
                     } 
                   />
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto flex flex-col gap-6 mt-6">
        {/* EXECUTIVE SUMMARY */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 shadow-sm border border-[var(--border-color)] group hover:translate-y-[-4px] transition-transform">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <TrendingDown className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Gastado</p>
              <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter"><CurrencyDisplay amount={stats.totalExp} /></h3>
              <div className={cn("flex items-center gap-1 text-[10px] font-bold mt-2", stats.diffExp > 0 ? "text-red-500" : "text-emerald-500")}>
                 {stats.diffExp > 0 ? '↑' : '↓'} {Math.abs(stats.diffExp).toFixed(1)}% vs previo
              </div>
           </div>
           
           <div className="bg-[var(--bg-card)] rounded-[2rem] p-6 shadow-sm border border-[var(--border-color)] group hover:translate-y-[-4px] transition-transform">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <ArrowUpRight className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Ingresos</p>
              <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter"><CurrencyDisplay amount={stats.totalInc} /></h3>
              <div className={cn("flex items-center gap-1 text-[10px] font-bold mt-2", stats.diffInc > 0 ? "text-emerald-500" : "text-[var(--text-muted)]")}>
                 {stats.diffInc > 0 ? '↑' : '↓'} {Math.abs(stats.diffInc).toFixed(1)}% vs previo
              </div>
           </div>

           <div className="bg-[var(--bg-card)] rounded-[20px] p-5 shadow-[0_4px_20px_var(--shadow)] border border-[var(--border-color)] group hover:translate-y-[-4px] transition-transform">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <stats.topCat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Top Categoría</p>
              <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter capitalize truncate">{stats.topCat.name}</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold mt-2 flex items-center gap-1">
                 Principal foco de gasto
              </p>
           </div>

           <div className="bg-[var(--bg-card)] rounded-[20px] p-5 shadow-[0_4px_20px_var(--shadow)] border border-[var(--border-color)] group hover:translate-y-[-4px] transition-transform">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <CreditCard className="w-5 h-5" />
              </div>
               <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 italic">Uso de efectivo/tarjetas</p>
               <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter capitalize truncate">
                 {stats.topMethodId === 'S/E' ? 'Pendiente' : stats.topMethodId.replace('_', ' ')}
               </h3>
               <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 border-l-2 border-primary pl-2 italic">Tu método más frecuente</p>
           </div>
        </section>

        {/* 🤖 AUTOMATION BANNER */}
        {!whatsappConnected && (
          <section className="rounded-[2rem] bg-primary p-1 overflow-hidden relative group cursor-pointer" onClick={() => setActiveModal('automation')}>
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <PhoneIcon className="w-32 h-32 text-white -rotate-12" />
             </div>
             <div className="bg-white/10 backdrop-blur-md rounded-[1.8rem] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 border border-white/20">
                <div className="space-y-2 text-center lg:text-left">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                      <CheckCircle2 className="w-3 h-3" />
                      Nuevo: Automatización IA
                   </div>
                   <h2 className="text-2xl font-bold text-white tracking-tight">Conecta WhatsApp o Telegram</h2>
                   <p className="text-white/70 text-sm font-medium max-w-md">Envía "Almuerzo 25k" por chat y nuestra IA lo categorizará y guardará automáticamente en tiempo real.</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-3">
                      <div className="h-12 w-12 rounded-full border-2 border-primary bg-emerald-500 flex items-center justify-center text-white text-xl">
                         <Smartphone className="w-6 h-6" />
                      </div>
                      <div className="h-12 w-12 rounded-full border-2 border-primary bg-blue-500 flex items-center justify-center text-white text-xl">
                         <Tv className="w-6 h-6" />
                      </div>
                   </div>
                   <button className="h-14 px-8 bg-white text-primary font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-sm">
                      Configurar Ahora
                   </button>
                </div>
             </div>
          </section>
        )}

        {/* MODERN FILTER BAR */}
        <section className="space-y-4">
           <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-[2.5rem] p-4 shadow-xl flex flex-col xl:flex-row items-center gap-6">
              <div className="relative flex-1 w-full xl:w-auto">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                 {searchTerm && (
                    <div className="absolute top-[-1.5rem] right-4 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce">
                       Buscando en todo el historial
                    </div>
                 )}
                 <input 
                    type="text" 
                    placeholder="Buscar por comercio, monto, categoría o método..." 
                    className="w-full h-16 bg-[var(--bg-card)] rounded-2xl pl-16 pr-14 font-semibold text-[var(--text-primary)] border-2 border-[var(--border-color)] focus:border-primary/50 placeholder:text-[var(--text-muted)] outline-none shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 {searchTerm && (
                    <button 
                       onClick={() => setSearchTerm('')}
                       className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all border-none cursor-pointer"
                    >
                       <X className="w-4 h-4" />
                    </button>
                 )}
              </div>
              <div className="flex flex-row items-center gap-3 w-full xl:w-auto px-2 overflow-x-auto no-scrollbar flex-nowrap shrink-0">
                 <div className="flex flex-row flex-nowrap gap-2 bg-[var(--bg-secondary)] p-1 rounded-2xl w-fit border border-[var(--border-color)] shrink-0">
                    {(['hoy', 'semana', 'mes', 'anual', 'todos'] as const).map(p => (
                        <button 
                          key={p} 
                          onClick={() => setTimeRange(p)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none outline-none whitespace-nowrap shrink-0",
                            timeRange === p ? "bg-[#1450A0] shadow-lg text-white" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                          )}
                        >
                            {p === 'hoy' ? 'Día' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mes' : p === 'anual' ? 'Año' : 'Todo'}
                        </button>
                    ))}
                 </div>
                 <div className="h-8 w-px bg-[var(--border-color)] hidden sm:block mx-2" />
                 
                 <DropdownMenu>
                    <DropdownMenuTrigger className="h-12 px-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 hover:bg-[var(--border-color)] outline-none">
                       {selectedMethod === 'Todos' ? 'Método' : selectedMethod}
                       <ChevronRight className="w-3 h-3 rotate-90" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-2xl border-[var(--border-color)] bg-[var(--bg-card)] p-2 w-48 shadow-2xl">
                       <DropdownMenuGroup>
                          {METHODS.map(m => (
                             <DropdownMenuItem key={m} onClick={() => setSelectedMethod(m)} className="rounded-xl p-3 font-semibold text-xs cursor-pointer hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors">
                                {m}
                             </DropdownMenuItem>
                          ))}
                       </DropdownMenuGroup>
                    </DropdownMenuContent>
                 </DropdownMenu>

                  <DropdownMenu>
                     <DropdownMenuTrigger className="h-12 px-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 hover:bg-[var(--border-color)] outline-none">
                        {selectedOrigin === 'Todos' ? 'Origen' : selectedOrigin}
                        <ChevronRight className="w-3 h-3 rotate-90" />
                     </DropdownMenuTrigger>
                     <DropdownMenuContent className="rounded-2xl border-[var(--border-color)] bg-[var(--bg-card)] p-2 w-48 shadow-2xl">
                        <DropdownMenuGroup>
                           {ORIGINS.map(o => (
                              <DropdownMenuItem key={o} onClick={() => setSelectedOrigin(o)} className="rounded-xl p-3 font-semibold text-xs cursor-pointer hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors">
                                 {o}
                              </DropdownMenuItem>
                           ))}
                        </DropdownMenuGroup>
                     </DropdownMenuContent>
                  </DropdownMenu>
              </div>
           </div>

           {/* CATEGORY SCROLL */}
           <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
              {CATEGORIES.map(cat => (
                 <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                     "flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all border",
                     selectedCategory === cat.id 
                        ? "bg-[var(--bg-card)] border-primary text-primary shadow-sm" 
                        : "bg-[var(--bg-card)]/40 border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                  )}
                 >
                    <cat.icon className={cn("w-4 h-4", selectedCategory === cat.id ? "text-primary" : "text-[var(--text-muted)]")} />
                    {cat.name}
                 </button>
              ))}
           </div>
        </section>

        {/* ANALYSIS PANELS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-[var(--bg-card)] rounded-[2rem] p-8 shadow-sm border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">Gasto por Categoría</h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide">Distribución de egresos</p>
                 </div>
                 <Receipt className="w-6 h-6 text-primary/30" />
              </div>
              <div className="space-y-6">
                 {categoryChartData.length > 0 ? categoryChartData.slice(0, 5).map(({ name, value }) => {
                    const catInfo = CATEGORIES.find(c => c.id === name) || CATEGORIES[CATEGORIES.length - 1];
                    const percentage = stats.totalExp > 0 ? (value / stats.totalExp) * 100 : 0;
                    return (
                       <div key={name} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                             <span className="flex items-center gap-2">
                                <div className={cn("h-1.5 w-1.5 rounded-full", catInfo.color?.replace('text-', 'bg-') || 'bg-primary')} />
                                {catInfo.name}
                             </span>
                             <span className="text-[var(--text-primary)]">${value.toLocaleString()} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                             <div className={cn("h-full transition-all duration-1000", catInfo.color?.replace('text-', 'bg-') || 'bg-primary')} style={{ width: `${percentage}%` }} />
                          </div>
                       </div>
                    );
                 }) : (
                    <div className="h-40 flex flex-col items-center justify-center text-[var(--text-muted)] gap-2 border-2 border-dashed border-[var(--border-color)] rounded-3xl">
                       <Receipt className="w-8 h-8 opacity-20" />
                       <p className="text-xs font-bold uppercase tracking-widest">Sin datos suficientes</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-[var(--bg-card)] rounded-[20px] p-8 shadow-[0_4px_20px_var(--shadow)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">Balance del Periodo</h3>
                    <p className="text-xs text-[var(--text-muted)] font-medium tracking-wide">Evolución Ingresos vs Gastos</p>
                 </div>
                 <TrendingDown className="w-6 h-6 text-emerald-500/30" />
              </div>
              
              <div className="space-y-4">
                 <div className="p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Ingresos Totales</p>
                       <h4 className="text-2xl font-black text-[var(--text-primary)]"><CurrencyDisplay amount={stats.totalInc} /></h4>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-emerald-500 opacity-20" />
                 </div>
                 <div className="p-5 rounded-[2rem] bg-red-500/10 border border-red-500/10 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Gastos Totales</p>
                       <h4 className="text-2xl font-black text-[var(--text-primary)]"><CurrencyDisplay amount={stats.totalExp} /></h4>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500 opacity-20" />
                 </div>
                 <div className="pt-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between px-2">
                       <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Balance Neto</span>
                       <span className={cn("text-xl font-black", (stats.totalInc - stats.totalExp) >= 0 ? "text-emerald-500" : "text-red-500")}>
                          <CurrencyDisplay amount={stats.totalInc - stats.totalExp} />
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* MOVEMENT LIST */}
        <section className="space-y-4 pb-12">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3 italic uppercase">
                 {searchTerm ? `Resultados: "${searchTerm}"` : 'Movimientos Recientes'}
                 <span className="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black text-primary border border-primary/20 shadow-sm">
                   {filteredMovements.length}
                 </span>
              </h3>
           </div>

           <div className="space-y-3">
              {filteredMovements.length > 0 ? (
                <>
                  {(showAllMovements || searchTerm ? filteredMovements : filteredMovements.slice(0, MOVEMENTS_LIMIT)).map((move) => (
                    <MovementItem key={move.id} move={move} onSelect={handleSelectMovement} onDelete={handleRequestDelete} />
                  ))}
                  {filteredMovements.length > MOVEMENTS_LIMIT && (
                    <button
                      onClick={() => setShowAllMovements(prev => !prev)}
                      className="w-full h-12 rounded-2xl border border-[var(--border-color)] text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all"
                    >
                      {showAllMovements ? 'Ver menos' : `Ver ${filteredMovements.length - MOVEMENTS_LIMIT} más`}
                    </button>
                  )}
                </>
              ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-[var(--bg-card)] rounded-[2rem] border border-dashed border-[var(--border-color)]">
                     <div className="h-20 w-20 rounded-full bg-[var(--bg-secondary)] shadow-sm flex items-center justify-center text-[var(--text-muted)]">
                        <Receipt className="w-10 h-10" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-xl font-black text-[var(--text-primary)]">No hay movimientos</h3>
                        <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">Ajusta los filtros o crea tu primer movimiento para empezar el análisis.</p>
                     </div>
                  </div>
               )}
           </div>
        </section>
      </div>

      {/* MODALS */}
      {/* Detail Modal */}
      <Dialog open={activeModal === 'detail'} onOpenChange={(o) => !o && setActiveModal(null)}>
         <DialogContent className="rounded-[2.5rem] sm:max-w-md p-0 overflow-hidden border-none shadow-3xl bg-[var(--bg-card)]">
            {selectedMovement && (
               <div className="relative">
                  <div className={cn(
                     "h-32 w-full flex items-end justify-center pb-6 relative",
                     selectedMovement?.type === 'income' ? "bg-emerald-500" : "bg-red-500"
                   )}>
                      <div className="h-20 w-20 rounded-3xl bg-[var(--bg-card)] shadow-2xl flex items-center justify-center text-[var(--text-primary)] -mb-10 relative z-10 transition-transform hover:rotate-6">
                          {(() => {
                             if (!selectedMovement) return null;
                             const cat = CATEGORIES.find(c => c.id === selectedMovement.categoria) || CATEGORIES[CATEGORIES.length - 1];
                             const Icon = selectedMovement.type === 'income' ? ArrowUpRight : cat.icon;
                             return <Icon className="w-10 h-10" />;
                          })()}
                       </div>
                    </div>
                    
                    <div className="pt-14 pb-8 px-8 space-y-8 text-center bg-[var(--bg-card)]">
                       <div>
                          <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none mb-2 italic uppercase">
                             {selectedMovement?.comercio || selectedMovement?.descripcion}
                          </h2>
                          <div className="flex items-center justify-center gap-2">
                             <span className="px-3 py-1 bg-[var(--bg-secondary)] rounded-full text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">
                                {CATEGORIES.find(c => c.id === selectedMovement?.categoria)?.name}
                             </span>
                             {selectedMovement?.origen !== 'manual' && (
                                <span className="px-3 py-1 bg-blue-500/10 rounded-full text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">
                                   Automático
                                </span>
                             )}
                          </div>
                       </div>
 
                      <div className="space-y-1">
                          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Monto del Movimiento</p>
                          <h3 className={cn(
                             "text-5xl font-black tracking-tighter",
                             selectedMovement?.type === 'income' ? "text-emerald-500" : "text-[var(--text-primary)]"
                          )}>
                             {selectedMovement?.type === 'income' ? '+' : '-'}${selectedMovement?.monto.toLocaleString()}
                          </h3>
                       </div>
 
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] text-left space-y-1 border border-[var(--border-color)]">
                             <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Fecha</p>
                             <p className="font-bold text-[var(--text-primary)] text-sm">{selectedMovement ? new Date(selectedMovement.fecha).toLocaleDateString() : ''}</p>
                          </div>
                          <div className="p-5 rounded-3xl bg-[var(--bg-secondary)] text-left space-y-1 border border-[var(--border-color)]">
                             <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Método</p>
                             <p className="font-bold text-[var(--text-primary)] text-sm capitalize">{selectedMovement?.metodo_pago.replace('_', ' ')}</p>
                          </div>
                       </div>
 
                      <div className="flex gap-4">
                          <button className="flex-1 h-14 bg-[var(--bg-secondary)] rounded-2xl font-bold text-[var(--text-secondary)] flex items-center justify-center gap-2 hover:bg-[var(--bg-secondary)]/80 transition-all border border-[var(--border-color)] cursor-pointer">
                             <Edit2 className="w-4 h-4" />
                             Editar
                          </button>
                          <button
                             onClick={() => selectedMovement && handleRequestDelete(selectedMovement)}
                             className="flex-1 h-14 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/10 cursor-pointer"
                          >
                             <Trash2 className="w-4 h-4" />
                             Eliminar
                          </button>
                       </div>
                   </div>
               </div>
            )}
         </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[var(--bg-card)] rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-[var(--border-color)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4 text-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">¿Eliminar movimiento?</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">
                  {deleteTarget.comercio || deleteTarget.descripcion} · ${deleteTarget.monto.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-12 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold text-sm border border-[var(--border-color)] hover:opacity-80 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteMovement(deleteTarget.id, deleteTarget.type)}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automation Config Modal */}
      <Dialog open={activeModal === 'automation'} onOpenChange={(o) => { if (!o) { setActiveModal(null); setWhatsappError(''); setWhatsappSuccess(false); } }}>
         <DialogContent className="rounded-[2rem] sm:max-w-sm max-w-[90vw] p-0 overflow-hidden border-none shadow-2xl bg-[var(--bg-card)]">
            {/* Green gradient header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#25D366] via-[#128C7E] to-[#075E54] px-6 py-6 text-white text-center">
               <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
               <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />
               <div className="relative h-14 w-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                     <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.852L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.371l-.36-.213-3.761.98 1.006-3.671-.234-.376A9.818 9.818 0 1112 21.818z"/>
                  </svg>
               </div>
               <h2 className="text-xl font-black tracking-tight leading-none uppercase mb-1">WhatsApp IA</h2>
               <p className="text-white/70 text-xs font-medium">Registra gastos enviando un mensaje simple.</p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 bg-[var(--bg-card)]">
               {/* Steps */}
               <div className="space-y-2">
                  <div className="flex gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                     <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-black shrink-0">1</div>
                     <div>
                        <p className="font-black text-[var(--text-primary)] text-xs leading-none mb-1">Conecta tu número</p>
                        <p className="text-[11px] text-emerald-500 font-medium">Con código de país. Ej: 5219991234567</p>
                     </div>
                  </div>
                  <div className="flex gap-3 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                     <div className="h-8 w-8 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xs font-black shrink-0">2</div>
                     <div>
                        <p className="font-black text-[var(--text-primary)] text-xs leading-none mb-1">Envía mensajes naturales</p>
                        <p className="text-[11px] text-blue-400 font-medium">"gasto 150 comida" · "ingreso 2000 salario"</p>
                     </div>
                  </div>
               </div>

               {/* Phone Input */}
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tu número de WhatsApp</label>
                  <input
                     type="tel"
                     value={whatsappPhone}
                     onChange={(e) => { setWhatsappPhone(e.target.value); setWhatsappError(''); setWhatsappSuccess(false); }}
                     placeholder="5219991234567"
                     className="w-full h-11 px-4 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm focus:border-[#25D366] focus:outline-none transition-colors placeholder:text-[var(--text-muted)]/40"
                  />
                  {whatsappError && (
                     <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                        <AlertCircle className="w-3 h-3 shrink-0" />{whatsappError}
                     </div>
                  )}
                  {whatsappSuccess && (
                     <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />Número vinculado correctamente
                     </div>
                  )}
               </div>

               {/* Status */}
               <div className="px-4 py-3 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-between border border-[var(--border-color)]">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Estado de Conexión</p>
                  {whatsappConnected ? (
                     <div className="flex items-center gap-1.5 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#22c55e]" />Conectado
                     </div>
                  ) : (
                     <div className="flex items-center gap-1.5 text-red-500 font-black uppercase text-[10px] tracking-widest">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />Desconectado
                     </div>
                  )}
               </div>

               {/* Button */}
               <button
                  disabled={whatsappLoading || !whatsappPhone.trim()}
                  onClick={async () => {
                     setWhatsappLoading(true);
                     setWhatsappError('');
                     setWhatsappSuccess(false);
                     const result = await updateWhatsAppNumber(whatsappPhone.trim());
                     setWhatsappLoading(false);
                     if (result?.error) {
                        setWhatsappError(result.error);
                     } else {
                        setWhatsappConnected(true);
                        setWhatsappSuccess(true);
                     }
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: whatsappPhone.trim() ? '0 6px 20px rgba(37,211,102,0.3)' : 'none' }}
               >
                  {whatsappLoading ? (
                     <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Guardando...
                     </span>
                  ) : whatsappConnected ? 'Actualizar número' : 'Vincular WhatsApp'}
               </button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
