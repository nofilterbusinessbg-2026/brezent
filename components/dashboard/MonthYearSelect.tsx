"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const MONTHS: Array<{ value: string; label: string }> = [
  { value: "1", label: "Януари" },
  { value: "2", label: "Февруари" },
  { value: "3", label: "Март" },
  { value: "4", label: "Април" },
  { value: "5", label: "Май" },
  { value: "6", label: "Юни" },
  { value: "7", label: "Юли" },
  { value: "8", label: "Август" },
  { value: "9", label: "Септември" },
  { value: "10", label: "Октомври" },
  { value: "11", label: "Ноември" },
  { value: "12", label: "Декември" },
];

export function MonthYearSelect({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const from = Math.min(2024, now - 3);
    const to = now + 1;
    return Array.from({ length: to - from + 1 }, (_, i) => from + i).reverse();
  }, []);

  function setParam(nextMonth: number, nextYear: number) {
    const params = new URLSearchParams(sp?.toString());
    params.set("month", String(nextMonth));
    params.set("year", String(nextYear));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card className="flex items-center gap-2 border-white/10 bg-surface p-2">
      <Select
        value={String(month)}
        onValueChange={(v) => setParam(Number(v), year)}
      >
        <SelectTrigger className="h-9 w-[170px] border-white/10 bg-background/40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(year)}
        onValueChange={(v) => setParam(month, Number(v))}
      >
        <SelectTrigger className="h-9 w-[120px] border-white/10 bg-background/40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}

