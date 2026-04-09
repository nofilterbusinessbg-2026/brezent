"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { CashMovement } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function CashBook({ movements }: { movements: CashMovement[] }) {
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return [...movements]
      .filter((m) =>
        !qq
          ? true
          : [m.description, m.client_or_supplier ?? "", m.payment_method, m.type]
              .join(" ")
              .toLowerCase()
              .includes(qq)
      )
      .sort((a, b) => (b.movement_date ?? "").localeCompare(a.movement_date ?? ""));
  }, [movements, q]);

  const balances = useMemo(() => {
    const cash = movements
      .filter((m) => m.payment_method === "cash")
      .reduce((s, m) => s + (m.type === "income" ? m.amount : -m.amount), 0);
    const bank = movements
      .filter((m) => m.payment_method === "bank")
      .reduce((s, m) => s + (m.type === "income" ? m.amount : -m.amount), 0);
    return { cash, bank, total: cash + bank };
  }, [movements]);

  async function remove(id: string) {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("cash_movements").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Движението е изтрито.");
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
        </div>
        <Link href="/cash/new">
          <Button className="bg-accent text-background hover:bg-accent/90">
            Ново движение
          </Button>
        </Link>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-background/30 p-3">
          <div className="text-xs text-white/50">Каса</div>
          <div className="text-lg font-semibold text-foreground">{formatCurrency(balances.cash)}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-background/30 p-3">
          <div className="text-xs text-white/50">Банка</div>
          <div className="text-lg font-semibold text-foreground">{formatCurrency(balances.bank)}</div>
        </div>
        <div className="rounded-md border border-white/10 bg-background/30 p-3">
          <div className="text-xs text-white/50">Общо</div>
          <div className="text-lg font-semibold text-foreground">{formatCurrency(balances.total)}</div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Метод</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-white/60">
                  Няма движения.
                </TableCell>
              </TableRow>
            ) : (
              list.map((m) => (
                <TableRow key={m.id} className="border-white/10">
                  <TableCell className="whitespace-nowrap">{m.movement_date}</TableCell>
                  <TableCell className="min-w-[260px]">
                    <div className="font-medium text-foreground">{m.description}</div>
                    <div className="text-xs text-white/50">
                      {m.client_or_supplier ?? ""}
                      {m.category ? ` • ${m.category}` : ""}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {m.payment_method === "cash" ? "Каса" : "Банка"}
                  </TableCell>
                  <TableCell className={m.type === "income" ? "text-income" : "text-expense"}>
                    {m.type === "income" ? "Приход" : "Разход"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold">
                    {formatCurrency(m.amount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/cash/new?edit=${m.id}`}>
                        <Button variant="secondary" size="sm">
                          Редакция
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => setConfirmId(m.id)}>
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
        description="Движението ще бъде изтрито."
        confirmText="Изтрий"
        loading={deleting}
        onConfirm={() => (confirmId ? remove(confirmId) : undefined)}
      />
    </Card>
  );
}

