"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const code = sp.get("code");
        const type = sp.get("type");
        const supabase = createClient();

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        if (cancelled) return;

        if (type === "invite" || type === "recovery") {
          router.replace("/set-password");
          return;
        }

        router.replace("/");
      } catch (e: unknown) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Auth error";
        toast.error(msg);
        router.replace("/login");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, sp]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-10 text-white/70">
      Завършваме входа...
    </div>
  );
}

