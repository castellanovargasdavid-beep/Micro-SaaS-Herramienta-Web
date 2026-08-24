"use client";

import { motion } from "framer-motion";

import { STATS, type StatItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ACCENT_TEXT: Record<StatItem["accent"], string> = {
  violet: "text-brand-violet",
  orange: "text-brand-orange",
  pink: "text-brand-pink",
  teal: "text-brand-teal",
};

const ACCENT_BG: Record<StatItem["accent"], string> = {
  violet: "bg-brand-violet/10",
  orange: "bg-brand-orange/10",
  pink: "bg-brand-pink/10",
  teal: "bg-brand-teal/10",
};

export function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className={cn(
              "rounded-2xl border border-border p-5 text-center",
              ACCENT_BG[stat.accent],
            )}
          >
            <p className={cn("text-3xl font-bold tracking-tight", ACCENT_TEXT[stat.accent])}>
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
