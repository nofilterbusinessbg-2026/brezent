import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import type { CashMovement, UserRole } from "@/types";
import { CashBook } from "@/components/cash/CashBook";

export default async function CashPage() {
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

  const role = (profile?.role ?? "secretary") as UserRole;

  const { data: movements } = await supabase.from("cash_movements").select("*");

  return (
    <>
      <Navbar role={role} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground">Каса</h1>
        <CashBook movements={(movements ?? []) as CashMovement[]} />
      </main>
    </>
  );
}

