import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { Navbar } from "@/components/shared/Navbar";
import { calculateDashboardMetrics } from "@/lib/calculations";
import type { BusinessTrip, CashMovement, FixedCost, Invoice } from "@/types";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { VATWidget } from "@/components/dashboard/VATWidget";
import { PendingPayments } from "@/components/dashboard/PendingPayments";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { MonthYearSelect } from "@/components/dashboard/MonthYearSelect";

function clampInt(v: unknown, min: number, max: number, fallback: number) {
  const n = typeof v === "string" ? Number.parseInt(v, 10) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const now = new Date();
  const month = clampInt(sp.month, 1, 12, now.getMonth() + 1);
  const year = clampInt(sp.year, 2020, 2100, now.getFullYear());

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "owner") redirect("/invoices");

  const [{ data: invoices }, { data: movements }, { data: fixedCosts }, { data: trips }] =
    await Promise.all([
      supabase.from("invoices").select("*").eq("is_deleted", false),
      supabase.from("cash_movements").select("*"),
      supabase.from("fixed_costs").select("*"),
      supabase.from("business_trips").select("*"),
    ]);

  const metrics = calculateDashboardMetrics(
    (invoices ?? []) as Invoice[],
    (movements ?? []) as CashMovement[],
    (fixedCosts ?? []) as FixedCost[],
    (trips ?? []) as BusinessTrip[],
    month,
    year
  );

  return (
    <RoleGuard allow="owner" fallback="/invoices">
      <Navbar role="owner" email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Финансов Дашборд
            </h1>
            <div className="mt-1 text-sm text-white/60">
              {month.toString().padStart(2, "0")}.{year}
            </div>
          </div>

          <MonthYearSelect month={month} year={year} />
        </div>

        <section className="space-y-3">
          <div className="text-sm text-white/60">Наличност сега</div>
          <DashboardCards metrics={metrics} />
        </section>

        <section className="space-y-3">
          <div className="text-sm text-white/60">ДДС</div>
          <VATWidget metrics={metrics} />
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <PendingPayments invoices={metrics.unpaidInvoices} />
          <CashFlowChart data={metrics.chartData} />
        </section>
      </main>
    </RoleGuard>
  );
}

