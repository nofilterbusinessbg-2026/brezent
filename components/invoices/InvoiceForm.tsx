"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Invoice, InvoiceStatus, InvoiceType, PaymentMethod } from "@/types";
import { computeInvoiceTotals, normalizeInvoiceStatusForType } from "@/lib/invoices";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES: Array<{ value: InvoiceStatus; label: string }> = [
  { value: "unpaid", label: "Неплатена" },
  { value: "paid_cash", label: "Платена (брой)" },
  { value: "paid_bank", label: "Платена (банка)" },
  { value: "overdue", label: "Просрочена" },
  { value: "no_invoice", label: "Без фактура" },
];

export function InvoiceForm({
  initial,
  mode,
}: {
  mode: "create" | "edit";
  initial?: Partial<Invoice>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<InvoiceType>((initial?.type as InvoiceType) ?? "income");
  const [clientName, setClientName] = useState(initial?.client_name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoice_number ?? "");
  const [amountNoVat, setAmountNoVat] = useState<number>(initial?.amount_no_vat ?? 0);
  const [hasVat, setHasVat] = useState<boolean>(initial?.has_vat ?? true);
  const [invoiceDate, setInvoiceDate] = useState<string>(
    initial?.invoice_date ?? new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState<string>(initial?.due_date ?? "");
  const [status, setStatus] = useState<InvoiceStatus>((initial?.status as InvoiceStatus) ?? "unpaid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(
    (initial?.payment_method as PaymentMethod) ?? ""
  );
  const [paymentDate, setPaymentDate] = useState<string>(initial?.payment_date ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const totals = useMemo(
    () => computeInvoiceTotals({ amountNoVat, hasVat }),
    [amountNoVat, hasVat]
  );

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

      const normalizedStatus = normalizeInvoiceStatusForType(type, status);

      const payload = {
        invoice_number: invoiceNumber || null,
        type,
        client_name: clientName,
        description: description || null,
        amount_no_vat: amountNoVat,
        vat_amount: totals.vatAmount,
        amount_with_vat: totals.amountWithVat,
        has_vat: hasVat,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        status: normalizedStatus,
        payment_method: paymentMethod || null,
        payment_date: paymentDate || null,
        notes: notes || null,
        created_by: user.id,
      };

      if (!clientName.trim()) {
        toast.error("Моля, въведи клиент/контрагент.");
        return;
      }

      if (mode === "create") {
        const { error } = await supabase.from("invoices").insert(payload);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Фактурата е създадена.");
        router.replace("/invoices");
        return;
      }

      if (!initial?.id) {
        toast.error("Липсва ID за редакция.");
        return;
      }

      const { error } = await supabase.from("invoices").update(payload).eq("id", initial.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Фактурата е обновена.");
      router.replace("/invoices");
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
            <Select value={type} onValueChange={(v) => setType(v as InvoiceType)}>
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
            <div className="text-sm text-white/70">Номер фактура (по избор)</div>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-sm text-white/70">Клиент / Контрагент</div>
            <Input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-sm text-white/70">Описание</div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Сума без ДДС</div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amountNoVat}
              onChange={(e) => setAmountNoVat(Number(e.target.value))}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">ДДС</div>
            <Select value={hasVat ? "yes" : "no"} onValueChange={(v) => setHasVat(v === "yes")}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Има ДДС (20%)</SelectItem>
                <SelectItem value="no">Без ДДС</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-white/50">
              ДДС: <span className="text-white/70">{totals.vatAmount.toFixed(2)}</span> • Общо:{" "}
              <span className="text-white/70">{totals.amountWithVat.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Дата</div>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Падеж (по избор)</div>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Статус</div>
            <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus)}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Метод плащане (по избор)</div>
            <Select
              value={paymentMethod || "none"}
              onValueChange={(v) => setPaymentMethod(v === "none" ? "" : (v as PaymentMethod))}
            >
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                <SelectItem value="cash">Каса</SelectItem>
                <SelectItem value="bank">Банка</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Дата плащане (по избор)</div>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-sm text-white/70">Бележки</div>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button type="submit" className="bg-accent text-background hover:bg-accent/90" disabled={saving}>
            {saving ? "Запис..." : mode === "create" ? "Създай" : "Запази"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

