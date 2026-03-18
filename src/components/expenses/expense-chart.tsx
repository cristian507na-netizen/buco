"use client";

import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Mocks
const data = [
  { name: "Comida", value: 763, color: "#10B981" },
  { name: "Transporte", value: 480, color: "#3B82F6" },
  { name: "Salud", value: 392, color: "#EF4444" },
  { name: "Ocio", value: 261, color: "#F59E0B" },
  { name: "Hogar", value: 174, color: "#8B5CF6" },
  { name: "Otros", value: 110, color: "#6B7280" },
];

const total = data.reduce((acc, curr) => acc + curr.value, 0);

export function ExpenseChart() {
  return (
    <Card className="buco-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">Desglose por categoría</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value}`, 'Gasto']}
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
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs">
                      {payload?.map((entry, index) => {
                        const percent = ((entry.payload.value / total) * 100).toFixed(0);
                        return (
                          <li key={`item-${index}`} className="flex items-center text-gray-400">
                            <span 
                              className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="truncate">{entry.value}</span>
                            <span className="ml-auto font-medium text-white">{percent}%</span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }}
              />
            </RechartsChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
