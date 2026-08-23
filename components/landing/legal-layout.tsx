import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: {updatedAt}
          </p>
          <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
