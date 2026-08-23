import Link from "next/link";
import { Sparkles } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grid flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <span className="text-lg tracking-tight">{APP_NAME}</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
