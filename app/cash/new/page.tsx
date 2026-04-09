import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import type { CashMovement, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { MovementForm } from "@/components/cash/MovementForm";

export default async function NewMovementPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const editId = typeof sp.edit === "string" ? sp.edit : undefined;

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

  const { data: movement } = editId
    ? await supabase
        .from("cash_movements")
        .select("*")
        .eq("id", editId)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <Navbar role={role} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">
            {editId ? "Редакция на движение" : "Ново движение"}
          </h1>
          <Link href="/cash">
            <Button variant="secondary">Назад</Button>
          </Link>
        </div>
        <MovementForm
          mode={editId ? "edit" : "create"}
          initial={(movement ?? undefined) as Partial<CashMovement> | undefined}
        />
      </main>
    </>
  );
}

