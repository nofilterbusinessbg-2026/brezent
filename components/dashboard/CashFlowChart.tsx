"use client";

import type { ChartDataPoint } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/calculations";

export function CashFlowChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card className="border-white/10 bg-surface p-4">
      <div className="mb-3 text-sm text-white/60">Паричен поток (6 месеца)</div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(248,250,252,0.08)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(248,250,252,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(248,250,252,0.15)" }}
              tickLine={{ stroke: "rgba(248,250,252,0.15)" }}
            />
            <YAxis
              tick={{ fill: "rgba(248,250,252,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(248,250,252,0.15)" }}
              tickLine={{ stroke: "rgba(248,250,252,0.15)" }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(248,250,252,0.06)" }}
              contentStyle={{
                background: "#0F1117",
                border: "1px solid rgba(248,250,252,0.12)",
                color: "#F8FAFC",
                borderRadius: 12,
              }}
              formatter={(value: unknown, name) => {
                const n = typeof value === "number" ? value : Number(value);
                return [formatCurrency(Number.isFinite(n) ? n : 0), String(name ?? "")];
              }}
            />
            <Legend
              wrapperStyle={{ color: "rgba(248,250,252,0.7)" }}
              iconType="circle"
            />
            <Bar dataKey="income" name="Приходи" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" name="Разходи" fill="#EF4444" radius={[8, 8, 0, 0]} />
            <Line
              type="monotone"
              dataKey="profit"
              name="Печалба"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

