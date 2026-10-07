import Image from "next/image";
import { cn } from "@/lib/cn";

/** The Papizza mark (logo.jpg, with its black background made transparent). */
export function Logo({ className, preload = false }: { className?: string; preload?: boolean }) {
  return (
    <Image
      src="/brand/papizza-logo.png"
      alt="Papizza"
      width={720}
      height={650}
      preload={preload}
      sizes="160px"
      className={cn("h-auto w-auto select-none", className)}
    />
  );
}
