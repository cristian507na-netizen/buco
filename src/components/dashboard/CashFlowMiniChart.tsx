"use client";

import { memo } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useFlowData } from "@/hooks/useFlowData";

export const CashFlowMiniChart = memo(function CashFlowMiniChart() {
  const { chartData } = useFlowData("month");

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Tooltip
          contentStyle={{
            background: "#1A2234",
            border: "1px solid #1F2D45",
            borderRadius: 10,
            color: "#fff",
            fontSize: 11,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
          formatter={(value: number, name: string) => [
            `$${Number(value).toLocaleString()}`,
            name === "ingresos" ? "Ingresos" : "Gastos",
          ]}
          labelFormatter={() => ""}
          isAnimationActive={false}
          animationDuration={0}
          animationEasing="linear"
          wrapperStyle={{ pointerEvents: "none" }}
        />
        <Line
          type="monotone"
          dataKey="ingresos"
          stroke="#10B981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: "#10B981", stroke: "#111827", strokeWidth: 2 }}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="gastos"
          stroke="#EF4444"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: "#EF4444", stroke: "#111827", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
