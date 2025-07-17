"use client";
import { NumberTicker } from "@/components/magicui/number-ticker";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--background)]/90">
      <NumberTicker value={100} startValue={0} className="text-5xl font-bold text-[var(--primary)]" />
    </div>
  );
}