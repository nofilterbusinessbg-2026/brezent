"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { BusinessTrip } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/calculations";

export function TripTable({ trips }: { trips: BusinessTrip[] }) {
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return [...trips]
      .filter((t) =>
        !qq
          ? true
          : [t.destination, t.notes ?? "", t.order_reference ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(qq)
      )
      .sort((a, b) => (b.trip_date ?? "").localeCompare(a.trip_date ?? ""));
  }, [trips, q]);

  async function remove(id: string) {
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("business_trips").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Командировката е изтрита.");
      window.location.reload();
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  }

  return (
    <Card className="mt-4 border-white/10 bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Търси..."
          className="h-9 border-white/10 bg-background/40"
        />
        <Link href="/trips?new=1">
          <Button className="bg-accent text-background hover:bg-accent/90">
            Нова командировка
          </Button>
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Дестинация</TableHead>
              <TableHead>Разход</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-white/60">
                  Няма командировки.
                </TableCell>
              </TableRow>
            ) : (
              list.map((t) => (
                <TableRow key={t.id} className="border-white/10">
                  <TableCell className="whitespace-nowrap">{t.trip_date}</TableCell>
                  <TableCell className="min-w-[260px]">
                    <div className="font-medium text-foreground">{t.destination}</div>
                    <div className="text-xs text-white/50">
                      {t.days} дни • {t.people} човека
                      {t.order_reference ? ` • ${t.order_reference}` : ""}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-semibold">
                    {formatCurrency(t.total_cost)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/trips?edit=${t.id}`}>
                        <Button variant="secondary" size="sm">
                          Редакция
                        </Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => setConfirmId(t.id)}>
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
        description="Командировката ще бъде изтрита."
        confirmText="Изтрий"
        loading={deleting}
        onConfirm={() => (confirmId ? remove(confirmId) : undefined)}
      />
    </Card>
  );
}

