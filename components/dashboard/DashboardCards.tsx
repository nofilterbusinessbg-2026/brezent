"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/calculations";
import type { DashboardMetrics } from "@/types";
import { Banknote, Landmark, Wallet, TrendingUp, TrendingDown, Clock } from "lucide-react";

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "income" | "expense" | "default";
}) {
  const toneClass =
    tone === "income"
      ? "text-income"
      : tone === "expense"
        ? "text-expense"
        : "text-foreground";

  return (
    <Card className="border-white/10 bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">{label}</div>
        <div className="text-white/60">{icon}</div>
      </div>
      <div className={["mt-2 text-2xl font-semibold", toneClass].join(" ")}>
        {value}
      </div>
    </Card>
  );
}

export function DashboardCards({
  metrics,
  loading,
}: {
  metrics?: DashboardMetrics;
  loading?: boolean;
}) {
  if (loading || !metrics) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-white/10 bg-surface p-4">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="mt-3 h-8 w-40 bg-white/10" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Каса"
          value={formatCurrency(metrics.cashBalance)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricCard
          label="Банка"
          value={formatCurrency(metrics.bankBalance)}
          icon={<Landmark className="h-5 w-5" />}
        />
        <MetricCard
          label="Общо"
          value={formatCurrency(metrics.totalBalance)}
          icon={<Banknote className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard
          label="Приходи (месец)"
          value={formatCurrency(metrics.monthlyIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="income"
        />
        <MetricCard
          label="Разходи (месец)"
          value={formatCurrency(metrics.monthlyExpenses)}
          icon={<TrendingDown className="h-5 w-5" />}
          tone="expense"
        />
        <MetricCard
          label="Печалба"
          value={formatCurrency(metrics.profit)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone={metrics.profit >= 0 ? "income" : "expense"}
        />
        <MetricCard
          label="Очаквани"
          value={formatCurrency(metrics.pendingIncome)}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}

