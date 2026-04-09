import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (me?.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    email?: string;
    full_name?: string;
    role?: "owner" | "secretary";
  };

  const email = body.email?.trim();
  const fullName = body.full_name?.trim();
  const role = body.role;

  if (!email || !fullName || (role !== "owner" && role !== "secretary")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://brezent-financial-dashboard.vercel.app";

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${baseUrl}/auth/callback?type=invite`,
    });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  const id = invited.user?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id,
    full_name: fullName,
    role,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user_id: id });
}

