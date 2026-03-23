"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from "recharts";
import { format, eachMonthOfInterval, startOfMonth, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (val: number) => {
  if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(1)}k`;
  return `$${val.toFixed(0)}`;
};

export default function WealthChart({ bankAccounts, creditCards, expenses, incomes }: any) {
  const chartData = useMemo(() => {
    const currentBankTotal = bankAccounts.reduce((acc: number, a: any) => acc + Number(a.saldo_actual), 0);
    const currentCreditTotal = creditCards.reduce((acc: number, c: any) => acc + Number(c.saldo_actual), 0);
    let runningBalance = currentBankTotal - currentCreditTotal;

    // Find the earliest real date from any user data
    const allDates: Date[] = [
      ...bankAccounts.map((a: any) => new Date(a.created_at)),
      ...creditCards.map((c: any) => new Date(c.created_at)),
      ...expenses.map((e: any) => new Date(e.fecha || e.created_at)),
      ...incomes.map((i: any) => new Date(i.fecha || i.created_at)),
    ].filter((d: Date) => !isNaN(d.getTime()));

    if (allDates.length === 0) return [];

    const earliestDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const months = eachMonthOfInterval({
      start: startOfMonth(earliestDate),
      end: startOfMonth(new Date()),
    });

    if (months.length === 0) return [];

    // Reconstruct balance going backwards from current state
    const monthsReversed = [...months].reverse();

    const result = monthsReversed.map((month) => {
      const mIncomes = incomes
        .filter((i: any) => isSameMonth(new Date(i.fecha || i.created_at), month))
        .reduce((acc: number, i: any) => acc + Number(i.monto), 0);
      const mExpenses = expenses
        .filter((e: any) => isSameMonth(new Date(e.fecha || e.created_at), month))
        .reduce((acc: number, e: any) => acc + Number(e.monto), 0);

      const netFlow = mIncomes - mExpenses;
      const data = {
        name: format(month, 'MMM yyyy', { locale: es }),
        balance: Math.round(runningBalance * 100) / 100,
        isInflection: Math.abs(netFlow) > 100,
        inflectionLabel: netFlow > 0 ? "💰 Ingreso mayor" : "💸 Gasto mayor",
      };
      runningBalance -= netFlow;
      return data;
    });

    return result.reverse();
  }, [bankAccounts, creditCards, expenses, incomes]);

  const hasEnoughData = chartData.length > 1;
  const latestBalance = chartData[chartData.length - 1]?.balance ?? 0;
  const previousBalance = chartData[chartData.length - 2]?.balance ?? latestBalance;
  const isGrowing = latestBalance >= previousBalance;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px'
      }}
      className="flex flex-col shadow-sm p-6 md:p-8 relative overflow-hidden group transition-all duration-300"
    >

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <BarChart2 className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-2xl font-black leading-none uppercase italic text-[var(--text-primary)]">Patrimonio</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1.5 opacity-80">Evolución de activos y pasivos</p>
             </div>
          </div>
        </div>

        {hasEnoughData && (
          <div
            className={cn(
              "flex items-center gap-4 px-6 py-4 rounded-[2rem] border transition-all shadow-xl",
              isGrowing 
                ? "bg-emerald-500/5 border-emerald-500/20" 
                : "bg-amber-500/5 border-amber-500/20"
            )}
          >
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                isGrowing ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20"
              )}
            >
              {isGrowing ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <p
                className={cn(
                   "text-[9px] font-black uppercase tracking-[0.15em] mb-0.5",
                   isGrowing ? "text-emerald-500" : "text-amber-500"
                )}
              >
                Estado Financiero
              </p>
              <p className="text-[12px] font-black text-[var(--text-primary)] opacity-90 italic">
                {isGrowing
                  ? 'Tu patrimonio está creciendo 🚀'
                  : 'Registramos una caída ligera ⚠️'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart or Empty State */}
      {!hasEnoughData ? (
        <div className="h-[300px] flex flex-col items-center justify-center bg-[var(--bg-secondary)]/50 rounded-[2rem] border-2 border-[var(--border-color)] border-dashed">
          <BarChart2
            className="text-[var(--text-muted)] opacity-20 mb-6"
            size={48}
          />
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic max-w-xs text-center leading-relaxed">
            {chartData.length === 1
              ? `Patrimonio actual: ${formatCurrency(latestBalance)} — Agrega más datos para ver la evolución`
              : 'Agrega cuentas y transacciones para visualizar tu crecimiento patrimonial'}
          </p>
        </div>
      ) : (
        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-color)"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 900 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                width={70}
                tickFormatter={formatCurrency}
                domain={[
                  (dataMin: number) => {
                    const pad = Math.abs(dataMin) * 0.15 || 2;
                    return Math.floor(dataMin - pad);
                  },
                  (dataMax: number) => {
                    const pad = Math.abs(dataMax) * 0.2 || 5;
                    return Math.ceil(dataMax + pad);
                  },
                ]}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const val = payload[0].value;
                    return (
                      <div
                        className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-5 shadow-2xl backdrop-blur-xl"
                      >
                        <p
                          className="text-[10px] font-black uppercase tracking-widest mb-2 text-[var(--text-muted)] opacity-70"
                        >
                          {label}
                        </p>
                        <p className="text-[22px] font-black text-[var(--text-primary)] italic tracking-tighter">
                          {val < 0 ? '-' : ''}$
                          {Math.abs(val).toLocaleString('es', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        {payload[0].payload.isInflection && (
                          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                             <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{payload[0].payload.inflectionLabel}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#2563EB"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#wealthGradient)"
                animationDuration={2000}
                dot={false}
                activeDot={{ r: 6, fill: '#2563EB', stroke: '#ffffff', strokeWidth: 3 }}
              />
              {chartData.map((d, i) =>
                d.isInflection ? (
                  <ReferenceDot
                    key={i}
                    x={d.name}
                    y={d.balance}
                    r={5}
                    fill="var(--bg-card)"
                    stroke="#2563EB"
                    strokeWidth={3}
                  />
                ) : null
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
