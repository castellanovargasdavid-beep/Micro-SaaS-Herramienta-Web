import { MobileNav, SidebarNav } from "@/components/dashboard/sidebar-nav";
import { NotificationsBell } from "@/components/dashboard/notifications-bell";
import { UserMenu } from "@/components/dashboard/user-menu";
import { getNotifications, requireUser } from "@/lib/data/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, profile } = await requireUser();
  const { items, unreadCount } = await getNotifications(
    supabase,
    profile.notifications_read_at,
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-muted/20 p-5 md:block">
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <NotificationsBell
              initialItems={items}
              initialUnreadCount={unreadCount}
            />
            <UserMenu profile={profile} />
          </div>
        </header>

        <main className="flex-1 bg-muted/10 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
