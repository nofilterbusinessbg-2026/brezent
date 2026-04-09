import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import { RoleGuard } from "@/components/shared/RoleGuard";
import type { FixedCost } from "@/types";
import { FixedCostTable } from "@/components/fixed-costs/FixedCostTable";
import { FixedCostForm } from "@/components/fixed-costs/FixedCostForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function FixedExpensesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const editId = typeof sp.edit === "string" ? sp.edit : undefined;
  const isNew = typeof sp.new === "string";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: fixedCosts } = await supabase.from("fixed_costs").select("*");
  const { data: fixedCost } = editId
    ? await supabase.from("fixed_costs").select("*").eq("id", editId).maybeSingle()
    : { data: null };

  return (
    <RoleGuard allow="owner" fallback="/invoices">
      <Navbar role="owner" email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Стационарни разходи</h1>
          {(isNew || editId) ? (
            <Link href="/expenses/fixed">
              <Button variant="secondary">Назад</Button>
            </Link>
          ) : (
            <Link href="/expenses/fixed?new=1">
              <Button className="bg-accent text-background hover:bg-accent/90">
                Добави
              </Button>
            </Link>
          )}
        </div>

        {isNew ? <FixedCostForm mode="create" /> : null}
        {editId ? (
          <FixedCostForm
            mode="edit"
            initial={(fixedCost ?? undefined) as Partial<FixedCost> | undefined}
          />
        ) : null}

        {!isNew && !editId ? (
          <FixedCostTable
            costs={(fixedCosts ?? []) as FixedCost[]}
          />
        ) : null}
      </main>
    </RoleGuard>
  );
}

