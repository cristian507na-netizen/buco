import { Card } from "@/components/ui/card";
import { Receipt, CreditCard, Target, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryGridProps {
  data: {
    fixedExpenses: number;
    cardsCount: number;
    cardDebt: number;
    debtsCount: number;
    totalDebt: number;
    budgetsCount: number;
    budgetAlerts: number;
  };
}

export function SummaryGrid({ data }: SummaryGridProps) {
  const summaries = [
    {
      title: "Gastos Fijos",
      value: `$${data.fixedExpenses.toFixed(2)}`,
      description: "Hogar y Suscripciones",
      icon: Receipt,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "none",
    },
    {
      title: "Tarjetas",
      value: `${data.cardsCount}`,
      description: `$${data.cardDebt.toFixed(2)} deuda`,
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: data.cardDebt > 0 ? "up" : "none",
    },
    {
      title: "Deudas",
      value: `${data.debtsCount}`,
      description: `$${data.totalDebt.toFixed(2)} pendiente`,
      icon: Target,
      color: "text-warning",
      bg: "bg-warning/10",
      trend: "none",
    },
    {
      title: "Presupuestos",
      value: `${data.budgetsCount}`,
      description: `${data.budgetAlerts} alertas activas`,
      icon: PieChart,
      color: "text-alert",
      bg: "bg-alert/10",
      trend: data.budgetAlerts > 0 ? "up" : "none",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {summaries.map((item, i) => (
        <Card key={i} className="buco-card bg-surface hover:bg-surface/80 transition-all cursor-pointer group p-5 border-none shadow-lg">
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-xl ${item.bg} shadow-inner`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            {item.trend === "up" && <ArrowUpRight className="w-4 h-4 text-alert animate-pulse" />}
            {item.trend === "down" && <ArrowDownRight className="w-4 h-4 text-success animate-pulse" />}
          </div>
          
          <div className="mt-5">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.1em]">{item.title}</p>
            <h4 className="text-2xl font-bold text-white mt-1 group-hover:text-primary transition-colors tracking-tight">
              {item.value}
            </h4>
            <p className="text-[11px] text-gray-500 mt-1.5 font-medium">{item.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

