"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { FixedCost } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/calculations";

export function FixedCostTable({
  costs,
}: {
  costs: FixedCost[];
}) {
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return [...costs]
      .filter((c) =>
        !qq ? true : [c.name, c.category].join(" ").toLowerCase().includes(qq)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [costs, q]);

  async function remove(id: string) {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("fixed_costs").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Разходът е изтрит.");
      window.location.reload();
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  }

  return (
    <Card className="mt-4 border-white/10 bg-surface p-4">
      <div className="flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Търси..."
          className="h-9 border-white/10 bg-background/40"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Име</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead>Активен</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-white/60">
                  Няма данни.
                </TableCell>
              </TableRow>
            ) : (
              list.map((c) => (
                <TableRow key={c.id} className="border-white/10">
                  <TableCell className="min-w-[240px] font-medium text-foreground">
                    {c.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-white/70">
                    {c.category}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold">
                    {formatCurrency(c.amount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-white/70">
                    {c.is_active ? "Да" : "Не"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/expenses/fixed?edit=${c.id}`}>
                        <Button variant="secondary" size="sm">
                          Редакция
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => setConfirmId(c.id)}>
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
        description="Разходът ще бъде изтрит."
        confirmText="Изтрий"
        loading={deleting}
        onConfirm={() => (confirmId ? remove(confirmId) : undefined)}
      />
    </Card>
  );
}

