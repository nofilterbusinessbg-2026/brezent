"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        toast.error("Липсва потребител в сесията.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        toast.error(profileError.message);
        return;
      }

      router.replace(profile?.role === "owner" ? "/dashboard" : "/invoices");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-white/10 bg-surface p-6">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold tracking-tight text-accent">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "Финансова Система"}
          </div>
          <div className="mt-1 text-sm text-white/60">Вход (без регистрация)</div>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="border-white/10 bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Парола</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-white/10 bg-background/40"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-accent text-background hover:bg-accent/90"
            disabled={loading}
          >
            {loading ? "Влизане..." : "Влез"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

