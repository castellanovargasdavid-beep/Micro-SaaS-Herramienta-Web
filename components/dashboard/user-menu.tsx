"use client";

import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLAN_LABELS } from "@/lib/constants";
import type { Profile } from "@/types/database";

export function UserMenu({ profile }: { profile: Profile }) {
  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg border border-border px-2 py-1.5 text-sm outline-none hover:bg-accent">
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate sm:inline">
          {profile.full_name ?? profile.email}
        </span>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {PLAN_LABELS[profile.plan]}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{profile.full_name}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="size-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <User className="size-4" />
            Mi plan: {PLAN_LABELS[profile.plan]}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
