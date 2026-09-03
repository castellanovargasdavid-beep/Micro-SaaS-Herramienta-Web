"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, Inbox } from "lucide-react";

import { markNotificationsReadAction } from "@/app/dashboard/notifications-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NotificationItem } from "@/lib/data/dashboard";

const POLL_INTERVAL_MS = 30_000;

export function NotificationsBell({
  initialItems,
  initialUnreadCount,
}: {
  initialItems: NotificationItem[];
  initialUnreadCount: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items);
        setUnreadCount(data.unreadCount);
      } catch {
        // Silencioso: se reintenta en el siguiente ciclo de polling.
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  function handleOpenChange(open: boolean) {
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      void markNotificationsReadAction();
    }
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="relative flex size-9 items-center justify-center rounded-lg border border-border outline-none hover:bg-accent">
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Respuestas recientes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <Inbox className="size-5" />
            Aún no has recibido respuestas.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/briefs/${item.briefId}/submissions/${item.id}`}
                className="block rounded-md px-2 py-2 text-sm hover:bg-accent"
              >
                <p className="truncate font-medium">
                  {item.clientName ?? "Sin nombre"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.briefTitle} ·{" "}
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
