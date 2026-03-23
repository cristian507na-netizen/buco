"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectTrigger, 
  SelectValue,
  SelectItem
} from "@/components/ui/select";
import { 
  Plus, 
  Loader2, 
  X, 
  Utensils, 
  Car, 
  Popcorn, 
  Home, 
  HeartPulse, 
  ShoppingBag, 
  Tv, 
  BookOpen, 
  Receipt, 
  HelpCircle,
  Briefcase,
  Zap,
  Gift,
  Search,
  Calendar
} from "lucide-react";
import { createExpense, createIncome } from "@/app/expenses/actions";
import { cn } from "@/lib/utils";
import { parseMoney } from "@/lib/format";
import { createClient } from "@/utils/supabase/client";

const CATEGORIES = {
  gasto: [
    { value: "comida", label: "Comida", icon: Utensils },
    { value: "transporte", label: "Transporte", icon: Car },
    { value: "salud", label: "Salud", icon: HeartPulse },
    { value: "ocio", label: "Ocio", icon: Popcorn },
    { value: "compras", label: "Compras", icon: ShoppingBag },
    { value: "hogar", label: "Hogar", icon: Home },
    { value: "suscripciones", label: "Suscripción", icon: Tv },
    { value: "educacion", label: "Educación", icon: BookOpen },
    { value: "deuda", label: "Deuda", icon: Receipt },
    { value: "otros", label: "Otros", icon: HelpCircle },
  ],
  ingreso: [
    { value: "sueldo", label: "Sueldo", icon: Briefcase },
    { value: "ventas", label: "Ventas", icon: Zap },
    { value: "regalo", label: "Regalo", icon: Gift },
    { value: "otros", label: "Otros", icon: HelpCircle },
  ]
};

interface NewTransactionModalProps {
  trigger?: React.ReactElement;
  userId: string;
}

export function NewTransactionModal({ trigger, userId }: NewTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'gasto' | 'ingreso'>('gasto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [monto, setMonto] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  
  // Account data states
  const [cashBalance, setCashBalance] = useState(0);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open]);

  const fetchAccounts = async () => {
    const [
      { data: profile },
      { data: cards },
      { data: banks }
    ] = await Promise.all([
      supabase.from('profiles').select('cash_balance').eq('id', userId).single(),
      supabase.from('credit_cards').select('*').eq('user_id', userId),
      supabase.from('bank_accounts').select('*').eq('user_id', userId)
    ]);

    if (profile) setCashBalance(profile.cash_balance || 0);
    if (cards) setCreditCards(cards);
    if (banks) setBankAccounts(banks);
  };

  const currentCategories = CATEGORIES[type];

  useEffect(() => {
    setSelectedCategory("");
  }, [type]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append('categoria', selectedCategory);
    formData.append('source_type', selectedAccountType);
    formData.append('source_id', selectedAccountId === 'cash' ? '' : selectedAccountId);
    
    // Inferencia de método de pago según cuenta seleccionada
    let metodo_pago = 'efectivo';
    if (selectedAccountType === 'bank_account') metodo_pago = 'transferencia';
    if (selectedAccountType === 'card') {
      const card = creditCards.find(c => c.id === selectedAccountId);
      metodo_pago = card?.tipo_tarjeta === 'credito' ? 'tarjeta_credito' : 'tarjeta_debito';
    }
    formData.append('metodo_pago', metodo_pago);

    const result = type === 'gasto' 
      ? await createExpense(formData) 
      : await createIncome(formData);

    if (result && result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      setOpen(false);
      setMonto("");
      setSelectedCategory("");
      setSelectedAccountId("");
      setSelectedAccountType("");
    }
  }

  const allAccounts = [
    ...bankAccounts.map(a => ({ id: a.id, name: `🏦 ${a.alias || a.nombre_banco}`, type: 'bank_account', balance: a.saldo_actual })),
    ...creditCards.map(c => ({ 
      id: c.id, 
      name: `💳 ${c.nombre_tarjeta} (..${c.ultimos_4})`, 
      type: 'card', 
      balance: c.saldo_actual,
      isCredit: c.tipo_tarjeta === 'credito' 
    }))
  ];

  const filteredAccounts = allAccounts.filter(acc => acc.name.toLowerCase().includes(accountSearch.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger || (
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 cursor-pointer">
              <Plus className="w-5 h-5 mr-1" /> Nuevo
            </Button>
          )
        }
      />
      
      <DialogContent className="rounded-[2rem] md:rounded-[3rem] sm:max-w-md p-0 overflow-hidden border border-[var(--border-color)] md:border-none shadow-3xl bg-[var(--bg-card)] max-h-[90vh] flex flex-col focus:outline-none" showCloseButton={false}>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* HEADER SECTION - TOGGLE */}
          <div className="p-8 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] pb-6 relative shrink-0">
             <button 
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 h-8 w-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border-none cursor-pointer z-10"
             >
                <X className="w-4 h-4" />
             </button>
             
             <DialogTitle className="text-2xl font-black tracking-tight italic uppercase text-[var(--text-primary)] mb-6">
                Nueva Transacción
             </DialogTitle>

             <div className="flex bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] w-full relative">
                <button
                  type="button"
                  onClick={() => setType('gasto')}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                    type === 'gasto' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  )}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType('ingreso')}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                    type === 'ingreso' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  )}
                >
                  Ingreso
                </button>
             </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-2xl text-[11px] font-bold">
                {error}
              </div>
            )}

            {/* AMOUNT FIELD */}
            <div className="space-y-2 text-center">
              <Label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">Monto de la operación</Label>
              <div className="relative group">
                <span className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black transition-colors pointer-events-none",
                  type === 'gasto' ? "text-red-500/40" : "text-emerald-500/40"
                )}>$</span>
                <Input
                  name="monto"
                  type="text"
                  required
                  placeholder="0.00"
                  autoFocus
                  value={monto}
                  onChange={(e) => setMonto(parseMoney(e.target.value))}
                  className="bg-[var(--bg-secondary)] border-2 border-transparent focus:border-primary/20 text-[var(--text-primary)] font-black text-[42px] h-[80px] rounded-2xl shadow-none text-center tracking-tighter w-full outline-none transition-all placeholder:text-[var(--text-muted)]/20"
                />
              </div>
            </div>

            {/* CATEGORIES GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", type === 'gasto' ? "bg-red-500" : "bg-emerald-500")} />
                  Categoría
                </Label>
                {selectedCategory && (
                   <span className="text-[9px] font-black text-primary uppercase italic tracking-tighter">
                     Seleccionado: {currentCategories.find(c => c.value === selectedCategory)?.label}
                   </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {currentCategories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl transition-all border-2 h-[84px] w-full gap-2 group",
                      selectedCategory === cat.value 
                        ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5" 
                        : "bg-[var(--bg-secondary)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:border-[var(--border-color)]"
                    )}
                  >
                    <cat.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", selectedCategory === cat.value ? "text-primary" : "text-[var(--text-primary)]/60")} />
                    <span className={cn("text-[8px] font-black uppercase tracking-tighter leading-none text-center", selectedCategory === cat.value ? "text-primary" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]")}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ADDITIONAL FIELDS */}
            <div className="space-y-6 pt-2">
              {/* DESCRIPTION & ACCOUNT */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic px-1">Descripción / Comercio</Label>
                  <Input 
                    name="descripcion" 
                    placeholder="Ej: Starbucks, Walmart, etc." 
                    className="h-14 bg-[var(--bg-secondary)] border-none rounded-2xl px-5 font-bold text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:ring-2 ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic px-1">Cuenta utilizada</Label>
                  <Select 
                    value={selectedAccountId} 
                    onValueChange={(val: any) => {
                      setSelectedAccountId(val);
                      const acc = allAccounts.find(a => a.id === val);
                      if (acc) setSelectedAccountType(acc.type);
                    }}
                  >
                    <SelectTrigger className="h-14 bg-[var(--bg-secondary)] border-none rounded-2xl px-5 font-black text-xs text-[var(--text-primary)] flex items-center justify-between outline-none">
                      <SelectValue placeholder="Selecciona cuenta" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-3xl">
                      {filteredAccounts.map(acc => (
                         <SelectItem key={acc.id} value={acc.id} className="rounded-xl p-3 font-bold text-xs hover:bg-[var(--bg-secondary)] cursor-pointer">
                            <div className="flex justify-between items-center w-full gap-8">
                               <span>{acc.name}</span>
                               <span className="text-[10px] opacity-40 font-black">${acc.balance.toLocaleString()}</span>
                            </div>
                         </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic px-1">Fecha</Label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <Input 
                      name="fecha" 
                      type="date" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="h-14 bg-[var(--bg-secondary)] border-none rounded-2xl pl-12 pr-5 font-bold text-xs text-[var(--text-primary)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="p-8 border-t border-[var(--border-color)]/50 bg-[var(--bg-card)] shrink-0">
             <Button 
               type="submit" 
               disabled={loading || !selectedCategory || !selectedAccountId}
               className={cn(
                 "w-full h-16 rounded-[20px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-[0.98] border-none text-white",
                 type === 'gasto' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
               )}
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Guardar ${type === 'gasto' ? 'Gasto' : 'Ingreso'}`}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
