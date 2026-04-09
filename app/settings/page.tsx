import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import { RoleGuard } from "@/components/shared/RoleGuard";
import { Card } from "@/components/ui/card";
import { InviteUserForm } from "@/components/settings/InviteUserForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <RoleGuard allow="owner" fallback="/invoices">
      <Navbar role="owner" email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground">Настройки</h1>
        <InviteUserForm />
        <Card className="mt-4 border-white/10 bg-surface p-4 text-white/70">
          Тук ще добавим и списък на потребителите (profiles) в следваща стъпка.
        </Card>
      </main>
    </RoleGuard>
  );
}

