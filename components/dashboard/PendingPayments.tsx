"use client";

import { useMemo, useState } from "react";
import { differenceInDays } from "date-fns";
import type { Invoice, PaymentMethod } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function PendingPayments({ invoices }: { invoices: Invoice[] }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => {
    const today = new Date();
    return [...invoices]
      .filter((i) => i.status === "unpaid" || i.status === "overdue")
      .sort((a, b) => (a.due_date ?? a.invoice_date).localeCompare(b.due_date ?? b.invoice_date))
      .map((i) => {
        const baseDate = i.due_date ? new Date(i.due_date) : new Date(i.invoice_date);
        const days = differenceInDays(today, baseDate);
        return { ...i, overdueDays: Math.max(0, days) };
      });
  }, [invoices]);

  async function markPaid() {
    if (!activeId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const newStatus = method === "cash" ? "paid_cash" : "paid_bank";
      const { error } = await supabase
        .from("invoices")
        .update({
          status: newStatus,
          payment_method: method,
          payment_date: new Date().toISOString().slice(0, 10),
        })
        .eq("id", activeId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Маркирана като платена.");
      setOpen(false);
      setActiveId(null);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-white/10 bg-surface p-4">
      <div className="mb-3 text-sm text-white/60">Неплатени фактури</div>
      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-background/30 p-3 text-sm text-white/60">
            Няма неплатени фактури.
          </div>
        ) : (
          list.map((i) => {
            const overdue = i.overdueDays > 0;
            return (
              <div
                key={i.id}
                className={[
                  "flex items-center justify-between gap-3 rounded-md border p-3",
                  overdue
                    ? "border-expense/30 bg-expense/10"
                    : "border-white/10 bg-background/30",
                ].join(" ")}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {i.client_name}
                  </div>
                  <div className="mt-0.5 text-xs text-white/60">
                    {i.invoice_date}
                    {overdue ? ` • ${i.overdueDays} дни просрочие` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="whitespace-nowrap text-sm font-semibold text-foreground">
                    {formatCurrency(i.amount_with_vat)}
                  </div>
                  <Button
                    size="sm"
                    className="bg-accent text-background hover:bg-accent/90"
                    onClick={() => {
                      setActiveId(i.id);
                      setOpen(true);
                    }}
                  >
                    Маркирай като платена
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-surface">
          <DialogHeader>
            <DialogTitle>Плащане</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-white/60">Метод</div>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue placeholder="Избери" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Каса</SelectItem>
                <SelectItem value="bank">Банка</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-accent text-background hover:bg-accent/90"
              disabled={saving}
              onClick={() => void markPaid()}
            >
              {saving ? "Запис..." : "Потвърди"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

