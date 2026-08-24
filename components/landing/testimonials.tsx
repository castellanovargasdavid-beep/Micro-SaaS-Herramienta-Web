"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

import { TESTIMONIALS, type Testimonial } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ACCENT_RING: Record<Testimonial["accent"], string> = {
  violet: "ring-brand-violet/30",
  orange: "ring-brand-orange/30",
  pink: "ring-brand-pink/30",
  teal: "ring-brand-teal/30",
  blue: "ring-brand-blue/30",
  amber: "ring-brand-amber/30",
};

const ACCENT_TEXT: Record<Testimonial["accent"], string> = {
  violet: "text-brand-violet",
  orange: "text-brand-orange",
  pink: "text-brand-pink",
  teal: "text-brand-teal",
  blue: "text-brand-blue",
  amber: "text-brand-amber",
};

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-pink">
          Lo que dicen quienes ya lo usan
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Freelancers reales, briefs reales
        </h2>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <Quote
              className={cn(
                "absolute top-5 right-5 size-8 opacity-10",
                ACCENT_TEXT[testimonial.accent],
              )}
            />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-3.5 fill-brand-amber text-brand-amber"
                />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Image
                src={`https://i.pravatar.cc/80?img=${testimonial.avatarSeed}`}
                alt={testimonial.name}
                width={40}
                height={40}
                unoptimized
                className={cn(
                  "size-10 rounded-full object-cover ring-2",
                  ACCENT_RING[testimonial.accent],
                )}
              />
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
