"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Star,
  TrendingDown,
  Wallet,
  X,
  Building2,
  PiggyBank,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/currency-display";

export default function SummaryCards({ expenses, incomes, prevStats, bankAccounts, creditCards, onCardClick }: any) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const stats = useMemo(() => {
    const incAmount = (i: any) => Number(i.monto ?? i.amount ?? 0);
    const incName = (i: any) => i.nombre || i.concept || i.descripcion || 'Ingreso';

    const totalIncomes = incomes.reduce((acc: number, i: any) => acc + incAmount(i), 0);
    const totalExpenses = expenses.reduce((acc: number, e: any) => acc + Number(e.monto || e.amount || 0), 0);
    const netBalance = totalIncomes - totalExpenses;
    const savingsRate = totalIncomes > 0 ? (netBalance / totalIncomes) * 100 : 0;

    // Previous totals
    const prevIncomes = prevStats?.incomes || 0;
    const prevExpenses = prevStats?.expenses || 0;
    const prevBalance = prevIncomes - prevExpenses;
    const prevSavingsRate = prevIncomes > 0 ? (prevBalance / prevIncomes) * 100 : 0;

    // Calculate variations
    const calcVar = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const diff = ((curr - prev) / prev) * 100;
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const incomeVar = calcVar(totalIncomes, prevIncomes);
    const expenseVar = calcVar(totalExpenses, prevExpenses);
    
    // Net balance comparison is better as absolute amount if it's monetary
    const balanceDiff = netBalance - prevBalance;
    const balanceVar = `${balanceDiff >= 0 ? '+$' : '-$'}${Math.abs(balanceDiff).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const savingsRateDiff = savingsRate - prevSavingsRate;
    const savingsVar = `${savingsRateDiff >= 0 ? '+' : ''}${savingsRateDiff.toFixed(1)}%`;

    const getSavingsLabel = (rate: number) => {
      if (rate > 20) return { label: "Excelente 🏆", color: "text-emerald-400", bg: "bg-emerald-500/10" };
      if (rate >= 10) return { label: "Saludable 👍", color: "text-blue-400", bg: "bg-blue-500/10" };
      if (rate > 0) return { label: "Ajustado ⚠️", color: "text-amber-400", bg: "bg-amber-500/10" };
      return { label: "Déficit 🔴", color: "text-red-400", bg: "bg-red-500/10" };
    };

    // Income sources for the period
    const incomeSources = incomes.map((i: any) => ({
      id: i.id,
      name: incName(i),
      amount: incAmount(i),
      frecuencia: i.frecuencia,
    }));

    // Debit + savings accounts only (bank_accounts are never credit — all included)
    const debitSavingsAccounts = (bankAccounts || []).map((a: any) => ({
      id: a.id,
      name: a.alias || a.nombre_banco,
      type: a.tipo_cuenta,
      balance: Number(a.saldo_actual || 0),
    }));

    // Also include debit credit_cards (tipo_tarjeta === 'debito')
    const debitCards = (creditCards || [])
      .filter((c: any) => c.tipo_tarjeta === 'debito')
      .map((c: any) => ({
        id: c.id,
        name: c.alias || c.nombre_tarjeta || c.nombre_banco,
        type: 'debito',
        balance: Number(c.saldo_actual || 0),
      }));

    const allDebitAccounts = [...debitSavingsAccounts, ...debitCards];

    // Expense breakdown by expense categories for the period
    const expenseByCategory = expenses.reduce((acc: any, e: any) => {
      const cat = e.categoria || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + Number(e.monto);
      return acc;
    }, {} as Record<string, number>);
    const expenseByCategoryArr = Object.entries(expenseByCategory)
      .map(([name, amount]) => ({ name, amount: amount as number }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    return {
      totalIncomes,
      totalExpenses,
      netBalance,
      savingsRate,
      savingsInfo: getSavingsLabel(savingsRate),
      incomeSources,
      allDebitAccounts,
      expenseByCategoryArr,
      incomeVar,
      expenseVar,
      balanceVar,
      savingsVar,
      balanceDiff,
      savingsRateDiff
    };
  }, [expenses, incomes, prevStats, bankAccounts, creditCards]);

  const cards = [
    {
      type: 'income',
      title: "Ingresos Totales",
      value: stats.totalIncomes,
      icon: ArrowUpRight,
      iconColor: "#10B981",
      iconBg: "rgba(16,185,129,0.1)",
      comparison: `${stats.incomeVar} vs anterior`,
      positive: !stats.incomeVar.startsWith('-'),
      clickable: true,
    },
    {
      type: 'expense',
      title: "Gastos Totales",
      value: stats.totalExpenses,
      icon: ArrowDownLeft,
      iconColor: "#EF4444",
      iconBg: "rgba(239,68,68,0.1)",
      comparison: `${stats.expenseVar} vs anterior`,
      positive: stats.expenseVar.startsWith('-'), // Decreasing expenses is positive
      clickable: true,
    },
    {
      type: 'balance',
      title: "Balance Neto",
      value: stats.netBalance,
      icon: Wallet,
      iconColor: stats.netBalance >= 0 ? "#3B82F6" : "#EF4444",
      iconBg: stats.netBalance >= 0 ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)",
      comparison: `${stats.balanceVar} vs anterior`,
      positive: stats.balanceDiff >= 0,
      clickable: true,
    },
    {
      type: 'savings',
      title: "Tasa de Ahorro",
      value: `${stats.savingsRate.toFixed(1)}%`,
      icon: Star,
      iconColor: "#F59E0B",
      iconBg: "rgba(245,158,11,0.1)",
      status: stats.savingsInfo,
      comparison: `${stats.savingsVar} vs anterior`,
      positive: stats.savingsRateDiff >= 0,
      clickable: false,
    },
  ];

  const accountIcon = (type: string) => {
    if (type === 'ahorro') return PiggyBank;
    if (type === 'debito') return CreditCard;
    return Building2;
  };

  const accountColor = (type: string) => {
    if (type === 'ahorro') return { color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
    if (type === 'debito') return { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' };
    return { color: '#818CF8', bg: 'rgba(129,140,248,0.12)' };
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const isExpanded = expandedCard === card.type;

          return (
            <div key={idx} className="flex flex-col gap-2">
              <div
                onClick={() => {
                  if (!card.clickable) return;
                  if (card.type === 'income') {
                    setShowIncomeModal(true);
                    return;
                  }
                  setExpandedCard(isExpanded ? null : card.type);
                  onCardClick?.(card.type);
                }}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px'
                }}
                className={cn(
                  "p-6 transition-all group animate-in fade-in slide-in-from-bottom-5 duration-700 relative overflow-hidden h-fit",
                  card.clickable && "cursor-pointer hover:border-[var(--text-muted)]/30 active:scale-[0.98]",
                  isExpanded && "border-blue-500/50 shadow-lg shadow-blue-500/5"
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: card.iconBg }}
                  >
                    <card.icon style={{ color: card.iconColor, width: 22, height: 22 }} />
                  </div>
                  {card.status && (
                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", card.status.bg, card.status.color)}>
                      {card.status.label}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-[var(--text-muted)] opacity-60">
                    {card.title}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter text-[var(--text-primary)] leading-none italic">
                    {typeof card.value === 'number' ? <CurrencyDisplay amount={card.value} /> : card.value}
                  </h3>
                </div>

                <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest",
                    card.positive ? "text-emerald-500" : "text-red-500"
                  )}>
                    {card.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {card.comparison}
                  </div>
                  {card.clickable && (
                    <ArrowUpRight className={cn("w-3.5 h-3.5 text-[var(--text-muted)] transition-all", isExpanded ? "rotate-45 opacity-100 text-blue-500" : "opacity-0 group-hover:opacity-40")} />
                  )}
                </div>
              </div>

              {/* Inline Breakdown Panel — expenses / balance */}
              {isExpanded && card.type !== 'income' && stats.expenseByCategoryArr.length > 0 && (
                <div
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-4 animate-in slide-in-from-top-4 fade-in duration-250 shadow-xl overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Desglose por Categoría</span>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Monto</span>
                    </div>
                    <div className="space-y-1.5">
                      {stats.expenseByCategoryArr.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[11px] font-bold text-[var(--text-primary)] capitalize">{item.name}</span>
                          <span className="text-[11px] font-black text-[var(--text-primary)]"><CurrencyDisplay amount={item.amount} /></span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-[var(--text-primary)] uppercase">TOTAL</span>
                      <span className="text-sm font-black text-blue-500"><CurrencyDisplay amount={stats.totalExpenses} /></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Income Breakdown Modal ── */}
      {showIncomeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowIncomeModal(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

          {/* Modal */}
          <div
            className="relative w-full md:max-w-md rounded-t-[28px] md:rounded-[28px] overflow-hidden animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-4 fade-in duration-300"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--border-color)]">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-0.5">INGRESOS</p>
                <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Ver Desglose</h2>
              </div>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Income Sources */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60 mb-3">
                  Fuentes de Ingreso del Período
                </p>
                {stats.incomeSources.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">Sin ingresos en este período</p>
                ) : (
                  <div className="space-y-2">
                    {stats.incomeSources.map((src: any) => (
                      <div
                        key={src.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl"
                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-[var(--text-primary)]">{src.name}</p>
                            {src.frecuencia && (
                              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{src.frecuencia}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[13px] font-black text-emerald-400">
                          +<CurrencyDisplay amount={src.amount} />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border-color)]" />

              {/* Account Balances */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60 mb-1">
                  Distribución de Fondos
                </p>
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-3">Saldo Real</p>
                {stats.allDebitAccounts.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">Sin cuentas configuradas</p>
                ) : (
                  <div className="space-y-2">
                    {stats.allDebitAccounts.map((acc: any) => {
                      const Icon = accountIcon(acc.type);
                      const { color, bg } = accountColor(acc.type);
                      return (
                        <div
                          key={acc.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl"
                          style={{ background: 'var(--bg-input, rgba(255,255,255,0.04))', border: '1px solid var(--border-color)' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                              <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-[var(--text-primary)]">{acc.name}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{acc.type}</p>
                            </div>
                          </div>
                          <span className="text-[13px] font-black text-[var(--text-primary)]">
                            <CurrencyDisplay amount={acc.balance} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Divider + Total */}
              <div className="border-t border-[var(--border-color)] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Ingresos Totales del Período</p>
                    <p className="text-[9px] text-[var(--text-muted)] opacity-50 mt-0.5">Suma de todas las fuentes</p>
                  </div>
                  <span className="text-xl font-black text-emerald-400">
                    +<CurrencyDisplay amount={stats.totalIncomes} />
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
