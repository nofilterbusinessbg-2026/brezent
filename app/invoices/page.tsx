import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import type { UserRole } from "@/types";
import type { Invoice } from "@/types";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";

export default async function InvoicesPage() {
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

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("is_deleted", false);

  return (
    <>
      <Navbar role={role} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground">Фактури</h1>
        <InvoiceTable invoices={(invoices ?? []) as Invoice[]} canCreate={true} />
      </main>
    </>
  );
}

