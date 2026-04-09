"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CashMovement, MovementCategory, PaymentMethod } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES: Array<{ value: MovementCategory; label: string }> = [
  { value: "invoice_payment", label: "Плащане по фактура" },
  { value: "advance", label: "Аванс" },
  { value: "expense_material", label: "Материали" },
  { value: "expense_travel", label: "Пътуване" },
  { value: "expense_salary", label: "Заплати" },
  { value: "expense_other", label: "Друг разход" },
  { value: "income_no_invoice", label: "Приход без фактура" },
  { value: "other", label: "Друго" },
];

export function MovementForm({
  initial,
  mode,
}: {
  mode: "create" | "edit";
  initial?: Partial<CashMovement>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<CashMovement["type"]>(
    (initial?.type as CashMovement["type"]) ?? "income"
  );
  const [amount, setAmount] = useState<number>(initial?.amount ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (initial?.payment_method as PaymentMethod) ?? "cash"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [clientOrSupplier, setClientOrSupplier] = useState(initial?.client_or_supplier ?? "");
  const [movementDate, setMovementDate] = useState(
    initial?.movement_date ?? new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState<MovementCategory | "">(
    (initial?.category as MovementCategory) ?? ""
  );
  const [invoiceId, setInvoiceId] = useState(initial?.invoice_id ?? "");

  const showInvoiceId = useMemo(() => category === "invoice_payment", [category]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Няма активна сесия.");
        router.replace("/login");
        return;
      }

      if (!description.trim()) {
        toast.error("Моля, въведи описание.");
        return;
      }

      const payload = {
        type,
        amount,
        payment_method: paymentMethod,
        description,
        client_or_supplier: clientOrSupplier || null,
        movement_date: movementDate,
        category: category || null,
        invoice_id: showInvoiceId && invoiceId ? invoiceId : null,
        created_by: user.id,
      };

      if (mode === "create") {
        const { error } = await supabase.from("cash_movements").insert(payload);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Движението е записано.");
        router.replace("/cash");
        return;
      }

      if (!initial?.id) {
        toast.error("Липсва ID за редакция.");
        return;
      }

      const { error } = await supabase
        .from("cash_movements")
        .update(payload)
        .eq("id", initial.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Движението е обновено.");
      router.replace("/cash");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="mt-4 border-white/10 bg-surface p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm text-white/70">Тип</div>
            <Select value={type} onValueChange={(v) => setType(v as CashMovement["type"])}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Приход</SelectItem>
                <SelectItem value="expense">Разход</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Сума</div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Метод</div>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Каса</SelectItem>
                <SelectItem value="bank">Банка</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Дата</div>
            <Input
              type="date"
              value={movementDate}
              onChange={(e) => setMovementDate(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-sm text-white/70">Описание</div>
            <Input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Клиент / Доставчик (по избор)</div>
            <Input
              value={clientOrSupplier}
              onChange={(e) => setClientOrSupplier(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Категория (по избор)</div>
            <Select value={category || "none"} onValueChange={(v) => setCategory(v === "none" ? "" : (v as MovementCategory))}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showInvoiceId ? (
            <div className="space-y-2 md:col-span-2">
              <div className="text-sm text-white/70">Invoice ID (по избор)</div>
              <Input
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="border-white/10 bg-background/40"
                placeholder="UUID на фактура"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" className="bg-accent text-background hover:bg-accent/90" disabled={saving}>
            {saving ? "Запис..." : mode === "create" ? "Създай" : "Запази"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

