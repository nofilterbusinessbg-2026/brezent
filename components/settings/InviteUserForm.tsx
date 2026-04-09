"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/types";

export function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("secretary");
  const [loading, setLoading] = useState(false);

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, full_name: fullName, role }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; user_id?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Грешка при покана.");
        return;
      }
      toast.success("Поканата е изпратена.");
      setEmail("");
      setFullName("");
      setRole("secretary");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-4 border-white/10 bg-surface p-4">
      <div className="text-sm text-white/60">Добави потребител (invite)</div>
      <form onSubmit={onInvite} className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          <div className="text-sm text-white/70">Email</div>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-white/10 bg-background/40"
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <div className="text-sm text-white/70">Име</div>
          <Input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border-white/10 bg-background/40"
          />
        </div>
        <div className="space-y-2 md:col-span-1">
          <div className="text-sm text-white/70">Роля</div>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="border-white/10 bg-background/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="secretary">Secretary</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Button type="submit" className="bg-accent text-background hover:bg-accent/90" disabled={loading}>
            {loading ? "Изпращане..." : "Изпрати покана"}
          </Button>
        </div>
      </form>
      <div className="mt-2 text-xs text-white/50">
        Поканеният потребител ще получи email и след приемане ще може да влезе през /login.
      </div>
    </Card>
  );
}

