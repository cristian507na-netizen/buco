"use client";

import { useMemo } from "react";
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  ShoppingBag, 
  Utensils,
  Car,
  Home,
  Activity,
  Gamepad2,
  Heart,
  Zap,
  Smartphone,
  Plane,
  Gift,
  Coffee,
  CheckCircle2,
  ListFilter,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/currency-display";

interface SummaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense' | 'balance';
  data: {
    expenses: any[];
    incomes: any[];
    range: { start: Date; end: Date };
  };
}

const CATEGORY_ICONS: any = {
  // Gastos
  Comida: Utensils,
  Transporte: Car,
  Ocio: Gamepad2,
  Hogar: Home,
  Shopping: ShoppingBag,
  Salud: Activity,
  Suscripciones: Zap,
  Viajes: Plane,
  Regalos: Gift,
  Café: Coffee,
  Educación: CheckCircle2,
  Seguros: Wallet,
  Tecnología: Smartphone,
  Otros: ListFilter,
  
  // Ingresos
  Salario: Wallet,
  Ventas: ShoppingBag,
  Freelance: Activity,
  Inversiones: TrendingUp,
  Bonos: Heart,
  Transferencia: ArrowUpRight,
};

function getCategoryIcon(category: string) {
  const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS[category?.split(' ')[0]] || ShoppingBag;
  return Icon;
}

export default function SummaryDetailModal({ isOpen, onClose, type, data }: SummaryDetailModalProps) {
  const stats = useMemo(() => {
    if (type === 'income') {
      const items = [...data.incomes].sort((a, b) => Number(b.monto) - Number(a.monto));
      const total = items.reduce((acc, i) => acc + Number(i.monto), 0);
      return { items, total, count: items.length };
    } else if (type === 'expense') {
      const items = [...data.expenses].sort((a, b) => Number(b.monto) - Number(a.monto));
      const total = items.reduce((acc, e) => acc + Number(e.monto), 0);
      return { items, total, count: items.length };
    } else {
      const totalIncomes = data.incomes.reduce((acc, i) => acc + Number(i.monto), 0);
      const totalExpenses = data.expenses.reduce((acc, e) => acc + Number(e.monto), 0);
      return { totalIncomes, totalExpenses, net: totalIncomes - totalExpenses };
    }
  }, [type, data]);

  if (!isOpen) return null;

  const title = type === 'income' ? 'Desglose de Ingresos' : type === 'expense' ? 'Desglose de Gastos' : 'Balance Neto';
  const periodLabel = data.range.start.toLocaleDateString('es', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Panel */}
      <div className={cn(
        "relative w-full max-w-lg h-full bg-[#111827] shadow-2xl flex flex-col border-l border-[#1F2D45] animate-in slide-in-from-right duration-300",
        "md:rounded-l-[2rem] overflow-hidden"
      )}>
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-[#1F2D45] flex justify-between items-start bg-[#111827]/80 backdrop-blur-xl sticky top-0 z-20">
           <div>
              <h3 className="text-2xl font-black text-white leading-none mb-2 uppercase italic tracking-tight">{title}</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none">{periodLabel}</p>
           </div>
           <button 
             onClick={onClose}
             className="h-10 w-10 rounded-full bg-[#1A2234] text-gray-400 flex items-center justify-center hover:text-white transition-all border border-[#1F2D45] cursor-pointer active:scale-95"
           >
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 no-scrollbar">
           
           {/* Summary Section */}
           <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{type === 'balance' ? 'Resultado del período' : `${title.split(' ')[2]} del período`}</p>
              <h2 className={cn(
                "text-5xl font-black tracking-tighter italic leading-none truncate",
                type === 'income' ? "text-emerald-500" : type === 'expense' ? "text-red-500" : ((stats.net ?? 0) >= 0 ? "text-blue-500" : "text-red-500")
              )}>
                <CurrencyDisplay amount={type === 'balance' ? (stats.net ?? 0) : (stats.total ?? 0)} />
              </h2>
           </div>

           {type === 'balance' ? (
              <div className="space-y-6">
                 <BalanceCard label="Ingresos Totales" amount={stats.totalIncomes || 0} icon={ArrowUpRight} color="text-emerald-500" bg="bg-emerald-500/10" />
                 <BalanceCard label="Gastos Totales" amount={stats.totalExpenses || 0} icon={ArrowDownLeft} color="text-red-500" bg="bg-red-500/10" />
                 
                 <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 mt-10">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Activity className="w-6 h-6" />
                       </div>
                       <p className="text-sm font-black text-indigo-100 uppercase italic">Estado de Salud</p>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                       {(stats.net ?? 0) >= 0 
                         ? `Has ahorrado un total de $${(stats.net ?? 0).toLocaleString()} este mes. ¡Excelente gestión de tus recursos! 🚀`
                         : `Tus gastos superaron tus ingresos por $${Math.abs(stats.net ?? 0).toLocaleString()}. Revisa tus categorías de mayor impacto. ⚠️`}
                    </p>
                 </div>
              </div>
           ) : (
              <div className="space-y-8">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#1F2D45] pb-4">Detalle de transacciones</p>
                 <div className="space-y-6">
                    {stats.items?.map((item: any, idx: number) => {
                      const percentage = (Number(item.monto) / (stats.total || 1)) * 100;
                      const Icon = getCategoryIcon(item.categoria || item.category || 'Otros');
                      return (
                        <div key={idx} className="group animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-2xl bg-[#1A2234] border border-[#1F2D45] flex items-center justify-center text-gray-400 shadow-sm transition-transform group-hover:scale-110">
                                    <Icon className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-white italic">{item.descripcion || item.name}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{new Date(item.fecha || item.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className={cn("text-sm font-black italic", type === 'income' ? "text-emerald-500" : "text-red-500")}>
                                    {type === 'income' ? '' : '-'}<CurrencyDisplay amount={Number(item.monto)} />
                                 </p>
                                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{percentage.toFixed(1)}%</p>
                              </div>
                           </div>
                           <div className="h-1.5 w-full bg-[#1A2234] rounded-full overflow-hidden border border-[#1F2D45]/50">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-1000", type === 'income' ? "bg-emerald-500" : "bg-red-500")}
                                style={{ width: `${percentage}%` }}
                              />
                           </div>
                        </div>
                      );
                    })}
                 </div>
              </div>
           )}
        </div>

        {/* Footer */}
        {type !== 'balance' && (
           <div className="p-8 md:p-10 bg-[#1A2234]/50 border-t border-[#1F2D45] grid grid-cols-2 gap-8 items-center">
              <div>
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Transacciones</p>
                 <p className="text-2xl font-black text-white italic">{stats.count}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Promedio Diario</p>
                 <p className="text-2xl font-black text-white italic">
                    <CurrencyDisplay amount={stats.total / 30} />
                 </p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

function BalanceCard({ label, amount, icon: Icon, color, bg }: any) {
   return (
      <div className="p-6 rounded-3xl bg-[#1A2234] border border-[#1F2D45] flex items-center justify-between group hover:border-[#2563EB]/30 transition-all">
         <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bg, color)}>
               <Icon className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1.5">{label}</p>
               <h4 className="text-2xl font-black text-white italic tracking-tighter leading-none"><CurrencyDisplay amount={amount} /></h4>
            </div>
         </div>
      </div>
   );
}
