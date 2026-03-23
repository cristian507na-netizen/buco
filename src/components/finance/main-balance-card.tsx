import { Card, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";

interface DashboardSummaryProps {
  saldoDisponible: number;
  sueldo: number;
  gastado: number;
  ahorroAcumulado: number;
  porcentajeGastado: number;
}

export function MainBalanceCard({
  saldoDisponible,
  sueldo,
  gastado,
  ahorroAcumulado,
  porcentajeGastado,
}: DashboardSummaryProps) {
  return (
    <Card className="buco-card col-span-1 lg:col-span-2 bg-gradient-to-br from-surface to-surface/50 overflow-hidden relative">
      {/* Decorative bg element */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
      
      <CardContent className="p-6">
        <div className="flex flex-col h-full gap-6">
          <div className="space-y-1 z-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Saldo Disponible
            </h2>
            <div className="text-4xl lg:text-5xl font-bold tracking-tight text-success">
              <CurrencyDisplay amount={saldoDisponible} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 z-10">
            <div className="space-y-1 w-full relative">
              <span className="text-xs text-gray-500">Sueldo / Gastos</span>
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-white">${sueldo.toLocaleString()}</span>
                <span className="text-sm font-medium text-white">${gastado.toLocaleString()}</span>
              </div>
              <div className="w-full bg-surface border border-border rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", porcentajeGastado < 60 ? "bg-success" : porcentajeGastado < 85 ? "bg-warning" : "bg-alert")} 
                  style={{ width: `${porcentajeGastado}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1 pl-4 border-l border-border/50 text-right">
              <span className="text-xs text-gray-500 block">Ahorro Acumulado</span>
              <span className="text-xl font-bold text-white">
                <CurrencyDisplay amount={ahorroAcumulado} />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
