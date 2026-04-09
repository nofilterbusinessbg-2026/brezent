import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import type { Invoice, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default async function NewInvoicePage({
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

  const { data: invoice } = editId
    ? await supabase.from("invoices").select("*").eq("id", editId).maybeSingle()
    : { data: null };

  return (
    <>
      <Navbar role={role} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">
            {editId ? "Редакция на фактура" : "Нова фактура"}
          </h1>
          <Link href="/invoices">
            <Button variant="secondary">Назад</Button>
          </Link>
        </div>
        <InvoiceForm
          mode={editId ? "edit" : "create"}
          initial={(invoice ?? undefined) as Partial<Invoice> | undefined}
        />
      </main>
    </>
  );
}

