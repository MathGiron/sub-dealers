"use client";
import React, { Suspense } from "react";
import { NumberTicker } from "@/components/magicui/number-ticker";

const ProductDataTable = React.lazy(() => import("@/components/product-table").then(mod => ({ default: mod.ProductDataTable })));

export default function ProductTableLazyWrapper({ initialData }: { initialData: any[] }) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-96 w-full bg-[var(--background)]"><NumberTicker value={100} startValue={0} className="text-5xl font-bold text-[var(--primary)]" /></div>}>
      <ProductDataTable initialData={initialData} />
    </Suspense>
  );
} 