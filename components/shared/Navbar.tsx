"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; ownerOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Дашборд", ownerOnly: true },
  { href: "/invoices", label: "Фактури" },
  { href: "/cash", label: "Каса" },
  { href: "/trips", label: "Командировки" },
  { href: "/expenses/fixed", label: "Стационарни", ownerOnly: true },
  { href: "/settings", label: "Настройки", ownerOnly: true },
];

export function Navbar({ role, email }: { role: UserRole; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => NAV.filter((i) => (i.ownerOnly ? role === "owner" : true)),
    [role]
  );

  useEffect(() => {
    // Prefetch main sections to speed up navigation.
    items.forEach((i) => router.prefetch(i.href));
  }, [items, router]);

  async function onLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={role === "owner" ? "/dashboard" : "/invoices"}
            className="text-sm font-semibold tracking-wide text-accent"
          >
            {process.env.NEXT_PUBLIC_APP_NAME ?? "Финансова Система"}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((i) => {
              const active = pathname?.startsWith(i.href);
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  prefetch
                  className={[
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-white/10 text-foreground"
                      : "text-white/70 hover:text-foreground",
                  ].join(" ")}
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm text-white/70 sm:block">
            <div className="text-xs text-white/50">{role === "owner" ? "Owner" : "Secretary"}</div>
            <div className="max-w-[220px] truncate">{email}</div>
          </div>

          <Button variant="secondary" onClick={onLogout} className="hidden sm:inline-flex">
            <LogOut className="mr-2 h-4 w-4" />
            Изход
          </Button>

          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "secondary", size: "icon" }),
                "md:hidden"
              )}
            >
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <div className="text-xs text-white/50">
                  {role === "owner" ? "Owner" : "Secretary"}
                </div>
                <div className="truncate text-sm">{email}</div>
              </div>
              <Separator />
              {items.map((i) => (
                <DropdownMenuItem
                  key={i.href}
                  onClick={() => {
                    setOpen(false);
                    // Let the menu close before navigation (better on mobile)
                    setTimeout(() => router.push(i.href), 0);
                  }}
                >
                  {i.label}
                </DropdownMenuItem>
              ))}
              <Separator />
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false);
                  void onLogout();
                }}
              >
                Изход
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

