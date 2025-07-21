"use client";
import React, { Suspense } from "react";
import { NumberTicker } from "@/components/magicui/number-ticker";
import dynamic from "next/dynamic";

const ProductDataTable = dynamic(
  () => import("./product-table").then(mod => ({ default: mod.ProductDataTable })),
  { ssr: false }
);

export default function ProductTableLazyWrapper({ initialData }: { initialData: unknown[] }) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-96 w-full bg-[var(--background)]"><NumberTicker value={100} startValue={0} className="text-5xl font-bold text-[var(--primary)]" /></div>}>
      <ProductDataTable initialData={initialData} />
    </Suspense>
  );
} 