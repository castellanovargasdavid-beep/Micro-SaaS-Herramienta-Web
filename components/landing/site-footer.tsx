import Link from "next/link";
import { Sparkles } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

const FOOTER_LINKS = {
  Producto: [
    { href: "#plantillas", label: "Plantillas" },
    { href: "#precios", label: "Precios" },
    { href: "/login", label: "Iniciar sesión" },
  ],
  Legal: [
    { href: "/legal/terminos", label: "Términos de servicio" },
    { href: "/legal/privacidad", label: "Política de privacidad" },
  ],
  Soporte: [
    { href: "mailto:hola@brieffast.app", label: "hola@brieffast.app" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-3.5" />
              </span>
              <span className="tracking-tight">{APP_NAME}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Briefs claros y ejecutables, generados con IA a partir de las
              respuestas de tus clientes.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. Todos los derechos
            reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho para freelancers y agencias boutique.
          </p>
        </div>
      </div>
    </footer>
  );
}
