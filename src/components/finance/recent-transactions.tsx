import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Receipt } from "lucide-react";
import Link from "next/link";
import { Expense } from "@/types/finance";

const categoryColors: Record<string, string> = {
  comida: "bg-success/20 text-success border-success/30",
  transporte: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  salud: "bg-red-500/20 text-red-400 border-red-500/30",
  suscripciones: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  hogar: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ocio: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  otros: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const categoryEmojis: Record<string, string> = {
  comida: "🍔",
  transporte: "🚗",
  salud: "🏥",
  suscripciones: "📺",
  hogar: "🏠",
  ocio: "🎉",
  otros: "🛍️",
};

interface RecentTransactionsProps {
  items: Partial<Expense>[];
}

export function RecentTransactions({ items }: RecentTransactionsProps) {
  return (
    <Card className="buco-card bg-surface w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
        <CardTitle className="text-lg font-semibold text-white">Últimas transacciones</CardTitle>
        <Link href="/expenses" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 font-medium">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="px-6 pb-6 mt-2">
        <div className="space-y-1">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-surface-dark flex items-center justify-center mb-3">
                <Receipt className="h-6 w-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">No hay transacciones este mes</p>
            </div>
          ) : (
            items.map((tx) => (
              <div 
                key={tx.id} 
                className="group flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-surface-dark border border-border group-hover:border-primary/50 transition-colors text-lg shadow-inner">
                    {categoryEmojis[tx.categoria || "otros"] || "🛍️"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{tx.comercio || tx.descripcion || 'Gasto sin nombre'}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {tx.fecha ? new Date(tx.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '---'}
                      </span>
                      <Badge variant="outline" className={`text-[10px] h-4 px-1 border uppercase tracking-wider font-bold ${categoryColors[tx.categoria || "otros"]}`}>
                        {tx.categoria}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-white">
                  -${Number(tx.monto).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

