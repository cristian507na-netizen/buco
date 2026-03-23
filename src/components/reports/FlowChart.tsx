"use client";

import { memo, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFlowData, type FlowPeriod, buildChartData } from "@/hooks/useFlowData";

const PERIODS: { id: FlowPeriod; label: string }[] = [
  { id: "day",   label: "Día" },
  { id: "week",  label: "Semana" },
  { id: "month", label: "Mes" },
  { id: "year",  label: "Año" },
];

function formatY(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

// Defined OUTSIDE the component and memoized to prevent Recharts from
// treating it as a new component on every render (main cause of parpadeo).
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "24px",
      padding: "12px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color: "#6B7280", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { key: "ingresos", color: "#10B981", label: "Ingresos" },
          { key: "gastos",   color: "#EF4444", label: "Gastos"   },
        ].map((item, idx) => (
          <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
              <span style={{ color: "#9CA3AF", fontSize: 11, fontWeight: 600 }}>{item.label}</span>
            </div>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
              ${(payload[idx]?.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
CustomTooltip.displayName = "FlowChartTooltip";

interface FlowChartProps {
  externalPeriod?: string;
  expenses?: any[];
  incomes?: any[];
}

const FlowChart = memo(function FlowChart({ externalPeriod, expenses: extExpenses, incomes: extIncomes }: FlowChartProps) {
  const [internalPeriod, setInternalPeriod] = useState<FlowPeriod>("month");
  
  // Sync external period to internal
  const period = useMemo(() => {
    if (!externalPeriod) return internalPeriod;
    switch (externalPeriod) {
      case 'today': return 'day';
      case 'week': return 'week';
      case 'month': return 'month';
      case 'last_month': return 'month';
      case '3months':
      case '6months':
      case 'year': return 'year';
      default: return 'month';
    }
  }, [externalPeriod, internalPeriod]);

  // Use internal hook only if no external data provided
  const { chartData: hookData, hasData: hookHasData } = useFlowData(period);
  
  // If external data is provided, build chart data locally
  const chartData = useMemo(() => {
    if (extExpenses && extIncomes) {
      return buildChartData(period, extExpenses, extIncomes);
    }
    return hookData;
  }, [period, extExpenses, extIncomes, hookData]);

  const hasData = useMemo(() => {
    if (extExpenses && extIncomes) {
      return chartData.some((d: any) => d.ingresos > 0 || d.gastos > 0);
    }
    return hookHasData;
  }, [extExpenses, extIncomes, chartData, hookHasData]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-10 shadow-sm flex flex-col h-full group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4 relative z-10">
        <div>
          <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase italic leading-none mb-1.5">Flujo</h3>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-80">
            Ingresos vs Gastos
          </p>
        </div>

        {/* Period selector - Only show if no external period is controlling it */}
        {!externalPeriod && (
          <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border-color)]">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setInternalPeriod(p.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 border-none outline-none cursor-pointer whitespace-nowrap",
                  period === p.id
                    ? "bg-[#2563EB] shadow-lg text-white scale-105"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 w-full relative z-10" style={{ minHeight: 320 }}>
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest text-center italic opacity-40">
            Agrega movimientos para<br />visualizar tu flujo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              style={{ cursor: "crosshair" }}
            >
              <defs>
                <linearGradient id="flowInGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flowExGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
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
                tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 700 }}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }}
                tickFormatter={formatY}
                width={52}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "var(--border-color)", strokeWidth: 1 }}
                isAnimationActive={false}
                animationDuration={0}
                animationEasing="linear"
                wrapperStyle={{ pointerEvents: "none" }}
              />

              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#10B981"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 3 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="gastos"
                stroke="#EF4444"
                strokeWidth={4}
                dot={false}
                activeDot={{ r: 6, fill: "#EF4444", stroke: "#fff", strokeWidth: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-10 mt-8 pt-6 border-t border-[var(--border-color)]">
        {[
          { color: "bg-emerald-500", label: "Ingresos" },
          { color: "bg-red-500",     label: "Gastos"   },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 group/leg cursor-default">
            <div className={cn("w-2.5 h-2.5 rounded-full transition-transform group-hover/leg:scale-125", item.color)} />
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-80 group-hover/leg:opacity-100 transition-opacity">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

FlowChart.displayName = "FlowChart";
export default FlowChart;
