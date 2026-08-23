import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { APP_NAME, APP_URL } from "@/lib/constants";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Briefs claros, en minutos`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "BriefFast transforma los requerimientos caóticos de tus clientes en briefs estructurados y ejecutables con IA. Ideal para freelancers, agencias boutique y creadores de contenido.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: `${APP_NAME} — Briefs claros, en minutos`,
    description:
      "Convierte mensajes desordenados de clientes en briefs ejecutables con IA.",
    siteName: APP_NAME,
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Briefs claros, en minutos`,
    description:
      "Convierte mensajes desordenados de clientes en briefs ejecutables con IA.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
