"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSignature,
  FileText,
  LayoutDashboard,
  MessageSquareWarning,
  Settings,
  Sparkles,
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Mis briefs", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/proposals", label: "Propuestas", icon: FileSignature },
  { href: "/dashboard/incidents", label: "Incidencias", icon: MessageSquareWarning },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function SidebarNav() {
  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <span className="tracking-tight">{APP_NAME}</span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        <NavLinks />
      </nav>

      <div className="mt-auto rounded-xl border border-dashed border-border p-3.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="size-3.5" />
          ¿Necesitas ayuda?
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Escríbenos a{" "}
          <a href="mailto:hola@brieffast.app" className="text-primary hover:underline">
            hola@brieffast.app
          </a>
        </p>
      </div>
    </div>
  );
}

export function MobileNav() {
  return (
    <nav className="flex items-center gap-1">
      <NavLinks />
    </nav>
  );
}
