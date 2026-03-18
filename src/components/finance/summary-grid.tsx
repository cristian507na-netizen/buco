import { Card, CardContent } from "@/components/ui/card";
import { Receipt, CreditCard, Target, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function SummaryGrid() {
  const summaries = [
    {
      title: "Gastos Fijos",
      value: "$850.00",
      description: "Mensual",
      icon: Receipt,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "up",
    },
    {
      title: "Tarjetas activas",
      value: "2",
      description: "$1,200 deuda",
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: "none",
    },
    {
      title: "Deudas",
      value: "$4,500",
      description: "1 activa",
      icon: Target,
      color: "text-warning",
      bg: "bg-warning/10",
      trend: "down",
    },
    {
      title: "Presupuesto",
      value: "3",
      description: "Alertas activas",
      icon: PieChart,
      color: "text-alert",
      bg: "bg-alert/10",
      trend: "up",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {summaries.map((item, i) => (
        <Card key={i} className="buco-card bg-surface hover:bg-surface/80 transition-colors cursor-pointer group p-5">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            {item.trend === "up" && <ArrowUpRight className="w-4 h-4 text-alert" />}
            {item.trend === "down" && <ArrowDownRight className="w-4 h-4 text-success" />}
          </div>
          
          <div className="mt-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{item.title}</p>
            <h4 className="text-2xl font-bold text-white mt-1 group-hover:text-primary transition-colors">
              {item.value}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
