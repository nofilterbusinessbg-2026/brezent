import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/shared/Navbar";
import type { BusinessTrip, UserRole } from "@/types";
import { TripTable } from "@/components/trips/TripTable";
import { TripForm } from "@/components/trips/TripForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TripsPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "secretary") as UserRole;

  const { data: trips } = await supabase.from("business_trips").select("*");
  const { data: trip } = editId
    ? await supabase.from("business_trips").select("*").eq("id", editId).maybeSingle()
    : { data: null };

  return (
    <>
      <Navbar role={role} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Командировки</h1>
          {(isNew || editId) ? (
            <Link href="/trips">
              <Button variant="secondary">Назад</Button>
            </Link>
          ) : null}
        </div>

        {isNew ? <TripForm mode="create" /> : null}
        {editId ? (
          <TripForm
            mode="edit"
            initial={(trip ?? undefined) as Partial<BusinessTrip> | undefined}
          />
        ) : null}
        {!isNew && !editId ? <TripTable trips={(trips ?? []) as BusinessTrip[]} /> : null}
      </main>
    </>
  );
}

