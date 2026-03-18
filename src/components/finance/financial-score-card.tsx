import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinancialScoreProps {
  score: number;
}

export function FinancialScoreCard({ score }: FinancialScoreProps) {
  // Determine status and colors based on score
  let status = "Crítico";
  let colorClass = "text-alert";
  let bgClass = "bg-alert/10";
  let strokeColor = "#EF4444";

  if (score >= 80) {
    status = "Excelente";
    colorClass = "text-success";
    bgClass = "bg-success/10";
    strokeColor = "#10B981";
  } else if (score >= 60) {
    status = "Regular";
    colorClass = "text-warning";
    bgClass = "bg-warning/10";
    strokeColor = "#F59E0B";
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="buco-card col-span-1 border-border/80 flex flex-col items-center justify-center p-6 bg-surface relative overflow-hidden">
      <h3 className="text-sm font-medium text-gray-400 absolute top-4 left-4">
        Salud Financiera
      </h3>

      <div className="relative flex items-center justify-center mt-6">
        {/* SVG Circle for progress */}
        <svg className="h-32 w-32 -rotate-90 transform">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-border"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="transition-all duration-1000 ease-out"
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", colorClass, bgClass)}>
          {status}
        </span>
      </div>

      {/* Mini factors breakdown */}
      <div className="flex gap-2 w-full justify-between mt-6 pt-4 border-t border-border/50 text-[10px] uppercase font-semibold">
        <div className="flex items-center gap-1 text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success"></span> Gastos
        </div>
        <div className="flex items-center gap-1 text-warning">
          <span className="h-1.5 w-1.5 rounded-full bg-warning"></span> Deudas
        </div>
        <div className="flex items-center gap-1 text-alert">
          <span className="h-1.5 w-1.5 rounded-full bg-alert"></span> Ppto
        </div>
      </div>
    </Card>
  );
}
