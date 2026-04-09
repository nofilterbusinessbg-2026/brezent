"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Invoice, InvoiceType } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function InvoiceTable({
  invoices,
  canCreate,
}: {
  invoices: Invoice[];
  canCreate: boolean;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<InvoiceType | "all">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return invoices
      .filter((i) => !i.is_deleted)
      .filter((i) => (type === "all" ? true : i.type === type))
      .filter((i) =>
        !qq
          ? true
          : [i.client_name, i.invoice_number ?? "", i.description ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(qq)
      )
      .sort((a, b) => (b.invoice_date ?? "").localeCompare(a.invoice_date ?? ""));
  }, [invoices, q, type]);

  async function softDelete(id: string) {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("invoices").update({ is_deleted: true }).eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Фактурата е изтрита (soft delete).");
      window.location.reload();
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  }

  return (
    <Card className="mt-4 border-white/10 bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Търси..."
            className="h-9 border-white/10 bg-background/40"
          />
          <div className="flex rounded-md border border-white/10 bg-background/30 p-1">
            {[
              { v: "all" as const, l: "Всички" },
              { v: "income" as const, l: "Приход" },
              { v: "expense" as const, l: "Разход" },
            ].map((t) => (
              <button
                key={t.v}
                className={[
                  "rounded px-2 py-1 text-xs transition-colors",
                  type === t.v ? "bg-white/10 text-foreground" : "text-white/60 hover:text-foreground",
                ].join(" ")}
                onClick={() => setType(t.v)}
                type="button"
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {canCreate ? (
          <Link href="/invoices/new">
            <Button className="bg-accent text-background hover:bg-accent/90">
              Нова фактура
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-white/60">
                  Няма резултати.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((i) => (
                <TableRow key={i.id} className="border-white/10">
                  <TableCell className="whitespace-nowrap">
                    {i.invoice_date}
                  </TableCell>
                  <TableCell className="min-w-[220px]">
                    <div className="font-medium text-foreground">{i.client_name}</div>
                    <div className="text-xs text-white/50">
                      {i.invoice_number ? `№ ${i.invoice_number}` : ""}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className={i.type === "income" ? "text-income" : "text-expense"}>
                      {i.type === "income" ? "Приход" : "Разход"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold">
                    {formatCurrency(i.amount_with_vat)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={i.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/invoices/new?edit=${i.id}`}>
                        <Button variant="secondary" size="sm">
                          Редакция
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmId(i.id)}
                      >
                        Изтрий
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => setConfirmId(o ? confirmId : null)}
        title="Потвърди изтриване"
        description="Фактурата ще бъде маркирана като изтрита (soft delete)."
        confirmText="Изтрий"
        loading={deleting}
        onConfirm={() => (confirmId ? softDelete(confirmId) : undefined)}
      />
    </Card>
  );
}

