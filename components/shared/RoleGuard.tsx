import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export async function RoleGuard({
  allow,
  fallback = "/invoices",
  children,
}: {
  allow: UserRole | UserRole[];
  fallback?: string;
  children: ReactNode;
}) {
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

  const allowed = Array.isArray(allow) ? allow : [allow];
  if (!profile?.role || !allowed.includes(profile.role as UserRole)) {
    redirect(fallback);
  }

  return children;
}

