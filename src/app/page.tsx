import { MainBalanceCard } from "@/components/finance/main-balance-card";
import { FinancialScoreCard } from "@/components/finance/financial-score-card";
import { SummaryGrid } from "@/components/finance/summary-grid";
import { RecentTransactions } from "@/components/finance/recent-transactions";

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Hola, Carlos 👋
        </h1>
        <p className="text-gray-400 text-sm capitalize">{currentDate}</p>
      </div>

      {/* Top row: Balance + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MainBalanceCard 
          saldoDisponible={1320.00}
          sueldo={3500.00}
          gastado={2180.00}
          ahorroAcumulado={450.00}
          porcentajeGastado={62}
        />
        <FinancialScoreCard score={68} />
      </div>

      {/* Middle row: Mini Summary Cards */}
      <SummaryGrid />

      {/* Bottom row: Transactions + (Later Budget Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="col-span-1">
          {/* Placeholder for Budget Summary Card */}
          <div className="buco-card bg-surface h-full flex items-center justify-center text-center p-6 border-dashed border-2">
            <div>
              <p className="text-warning mb-2">⚠️ 3 categorías en alerta</p>
              <p className="text-sm text-gray-500">Resumen de presupuesto en construcción</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
