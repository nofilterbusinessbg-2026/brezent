"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { FixedCost } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = FixedCost["category"];

export function FixedCostForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Partial<FixedCost>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState<number>(initial?.amount ?? 0);
  const [category, setCategory] = useState<Category>((initial?.category as Category) ?? "other");
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = { name, amount, category, is_active: isActive };

      if (!name.trim()) {
        toast.error("Моля, въведи име.");
        return;
      }

      if (mode === "create") {
        const { error } = await supabase.from("fixed_costs").insert(payload);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Разходът е добавен.");
        router.replace("/expenses/fixed");
        return;
      }

      if (!initial?.id) {
        toast.error("Липсва ID за редакция.");
        return;
      }

      const { error } = await supabase.from("fixed_costs").update(payload).eq("id", initial.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Разходът е обновен.");
      router.replace("/expenses/fixed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="mt-4 border-white/10 bg-surface p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm text-white/70">Име</div>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-background/40"
            />
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
            <div className="text-sm text-white/70">Категория</div>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="border-white/10 bg-background/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Наем</SelectItem>
                <SelectItem value="salaries">Заплати</SelectItem>
                <SelectItem value="utilities">Комунални</SelectItem>
                <SelectItem value="other">Друго</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Активен
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" className="bg-accent text-background hover:bg-accent/90" disabled={saving}>
            {saving ? "Запис..." : mode === "create" ? "Добави" : "Запази"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

