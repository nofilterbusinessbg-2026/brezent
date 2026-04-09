"use client";

import type { InvoiceStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

const MAP: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  paid_cash: { label: "Платена (брой)", className: "bg-income text-background" },
  paid_bank: { label: "Платена (банка)", className: "bg-bank text-background" },
  unpaid: { label: "Неплатена", className: "bg-accent text-background" },
  overdue: { label: "Просрочена", className: "bg-expense text-background" },
  no_invoice: { label: "Без фактура", className: "bg-white/10 text-foreground" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const m = MAP[status];
  return (
    <Badge variant="secondary" className={["border-0", m.className].join(" ")}>
      {m.label}
    </Badge>
  );
}

