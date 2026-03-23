"use client";

import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

const categoryMeta: Record<string, { color: string; label: string }> = {
  comida: { color: "#10B981", label: "Comida" },
  transporte: { color: "#3B82F6", label: "Transporte" },
  salud: { color: "#EF4444", label: "Salud" },
  ocio: { color: "#F59E0B", label: "Ocio" },
  hogar: { color: "#8B5CF6", label: "Hogar" },
  suscripciones: { color: "#EC4899", label: "Suscripciones" },
  otros: { color: "#6B7280", label: "Otros" },
};

interface ExpenseChartProps {
  items: any[];
}

export function ExpenseChart({ items }: ExpenseChartProps) {
  // Aggregate data by category
  const aggregatedData = items.reduce((acc: any[], curr: any) => {
    const category = curr.categoria || "otros";
    const existing = acc.find((item) => item.name === category);
    if (existing) {
      existing.value += Number(curr.monto);
    } else {
      acc.push({
        name: category,
        value: Number(curr.monto),
        color: categoryMeta[category]?.color || categoryMeta.otros.color,
        label: categoryMeta[category]?.label || categoryMeta.otros.label
      });
    }
    return acc;
  }, []);

  const total = aggregatedData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="buco-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Desglose por categoría</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[250px] w-full mt-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center mb-2">
                 <PieChartIcon className="h-5 w-5 text-gray-600" />
              </div>
              <p className="text-xs text-gray-500">Registra gastos para ver el análisis visual</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {aggregatedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Gasto']}
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  content={(props) => {
                    const { payload } = props;
                    return (
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-[10px] px-6">
                        {payload?.map((entry: any, index: number) => {
                          const percent = entry.payload ? ((entry.payload.value / total) * 100).toFixed(0) : '0';
                          return (
                            <li key={`item-${index}`} className="flex items-center text-gray-400">
                              <span
                                className="w-2.5 h-2.5 rounded-full mr-2 shrink-0 shadow-sm"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="truncate">{entry.payload?.label}</span>
                              <span className="ml-auto font-bold text-white pl-2">{percent}%</span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }}
                />
              </RechartsChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

