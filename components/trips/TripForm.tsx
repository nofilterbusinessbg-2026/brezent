"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { BusinessTrip } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TripForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: Partial<BusinessTrip>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [tripDate, setTripDate] = useState(
    initial?.trip_date ?? new Date().toISOString().slice(0, 10)
  );
  const [days, setDays] = useState<number>(initial?.days ?? 1);
  const [people, setPeople] = useState<number>(initial?.people ?? 1);
  const [fuelCost, setFuelCost] = useState<number>(initial?.fuel_cost ?? 0);
  const [accommodationCost, setAccommodationCost] = useState<number>(
    initial?.accommodation_cost ?? 0
  );
  const [otherCost, setOtherCost] = useState<number>(initial?.other_cost ?? 0);
  const [orderReference, setOrderReference] = useState(initial?.order_reference ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

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

      const payload = {
        destination,
        trip_date: tripDate,
        days,
        people,
        fuel_cost: fuelCost,
        accommodation_cost: accommodationCost,
        other_cost: otherCost,
        order_reference: orderReference || null,
        notes: notes || null,
        created_by: user.id,
      };

      if (!destination.trim()) {
        toast.error("Моля, въведи дестинация.");
        return;
      }

      if (mode === "create") {
        const { error } = await supabase.from("business_trips").insert(payload);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Командировката е създадена.");
        router.replace("/trips");
        return;
      }

      if (!initial?.id) {
        toast.error("Липсва ID за редакция.");
        return;
      }

      const { error } = await supabase
        .from("business_trips")
        .update(payload)
        .eq("id", initial.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Командировката е обновена.");
      router.replace("/trips");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="mt-4 border-white/10 bg-surface p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm text-white/70">Дестинация</div>
            <Input
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Дата</div>
            <Input
              type="date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Дни</div>
            <Input
              type="number"
              min="1"
              step="1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Хора</div>
            <Input
              type="number"
              min="1"
              step="1"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Гориво</div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={fuelCost}
              onChange={(e) => setFuelCost(Number(e.target.value))}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Нощувки</div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={accommodationCost}
              onChange={(e) => setAccommodationCost(Number(e.target.value))}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-white/70">Други</div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={otherCost}
              onChange={(e) => setOtherCost(Number(e.target.value))}
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-sm text-white/70">Заповед / Референция</div>
            <Input
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
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

        <div className="mt-4 flex justify-end">
          <Button type="submit" className="bg-accent text-background hover:bg-accent/90" disabled={saving}>
            {saving ? "Запис..." : mode === "create" ? "Създай" : "Запази"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

