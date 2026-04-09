"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      setReady(true);
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Паролата трябва да е поне 8 символа.");
      return;
    }
    if (password !== password2) {
      toast.error("Паролите не съвпадат.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Паролата е зададена.");
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-white/10 bg-surface p-6">
        <div className="mb-4 text-center">
          <div className="text-xl font-semibold text-accent">Задай парола</div>
          <div className="mt-1 text-sm text-white/60">
            Това е еднократно при покана / възстановяване.
          </div>
        </div>

        {!ready ? (
          <div className="text-center text-sm text-white/60">Зареждане...</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Нова парола</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/10 bg-background/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Повтори паролата</label>
              <Input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="border-white/10 bg-background/40"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-background hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? "Запис..." : "Запази"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

