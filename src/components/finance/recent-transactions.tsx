import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Expense } from "@/types/finance";

// Mocks for now
const recentTransactions: Partial<Expense>[] = [
  { id: "1", comercio: "McDonald's", monto: 12.50, categoria: "comida", fecha: "Hoy" },
  { id: "2", comercio: "Uber", monto: 8.00, categoria: "transporte", fecha: "Ayer" },
  { id: "3", comercio: "Farmacia Arrocha", monto: 35.00, categoria: "salud", fecha: "15 Mar" },
  { id: "4", comercio: "Netflix", monto: 15.99, categoria: "suscripciones", fecha: "14 Mar" },
  { id: "5", comercio: "Gasolinera Texaco", monto: 45.00, categoria: "transporte", fecha: "13 Mar" },
];

const categoryColors: Record<string, string> = {
  comida: "bg-success/20 text-success border-success/30",
  transporte: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  salud: "bg-red-500/20 text-red-400 border-red-500/30",
  suscripciones: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const categoryEmojis: Record<string, string> = {
  comida: "🍔",
  transporte: "🚗",
  salud: "🏥",
  suscripciones: "📺",
};

export function RecentTransactions() {
  return (
    <Card className="buco-card bg-surface w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
        <CardTitle className="text-lg font-semibold text-white">Últimas transacciones</CardTitle>
        <Link href="/expenses" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 font-medium">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-1">
          {recentTransactions.map((tx) => (
            <div 
              key={tx.id} 
              className="group flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-background border border-border group-hover:border-primary/50 transition-colors text-lg">
                  {categoryEmojis[tx.categoria || "otros"] || "🛍️"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{tx.comercio}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{tx.fecha}</span>
                    <Badge variant="outline" className={`text-[10px] h-4 px-1 ${categoryColors[tx.categoria || ""] || "bg-gray-500/20 text-gray-400"}`}>
                      {tx.categoria}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-white">
                -${tx.monto?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
