"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { DashboardMetrics } from "@/types";
import { AlertTriangle } from "lucide-react";

export function VATWidget({ metrics }: { metrics: DashboardMetrics }) {
  const due = metrics.vatDue;

  return (
    <Card className="border-white/10 bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">ДДС</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div>
              <div className="text-xs text-white/50">Събрано</div>
              <div className="text-lg font-semibold text-foreground">
                {formatCurrency(metrics.vatCollected)}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50">Платено</div>
              <div className="text-lg font-semibold text-foreground">
                {formatCurrency(metrics.vatPaid)}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/50">За внасяне</div>
              <div
                className={[
                  "text-lg font-semibold",
                  due > 0 ? "text-expense" : "text-income",
                ].join(" ")}
              >
                {formatCurrency(due)}
              </div>
            </div>
          </div>
        </div>

        {due > 0 ? (
          <div className="flex items-center gap-2 rounded-md bg-expense/15 px-3 py-2 text-sm text-expense">
            <AlertTriangle className="h-4 w-4" />
            <span>Има ДДС за внасяне</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

