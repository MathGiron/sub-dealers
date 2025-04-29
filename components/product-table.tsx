"use client";

import { Product } from "@/services/shopifyService";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";

interface ProductTableProps {
  products: Product[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-neutral-200 dark:border-neutral-800">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-900">
            <th className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left text-sm font-medium text-neutral-800 dark:text-white">
              Foto
            </th>
            <th className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left text-sm font-medium text-neutral-800 dark:text-white">
              Nome
            </th>
            <th className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left text-sm font-medium text-neutral-800 dark:text-white">
              Preço
            </th>
            <th className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-left text-sm font-medium text-neutral-800 dark:text-white">
              Ação
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            // Obter o preço da primeira variante, se disponível
            const price = product.specs[0]?.name === "Default Title" ? product.specs[0]?.price || "N/A" : "Consultar";

            return (
              <tr key={product.id} className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="border border-neutral-200 dark:border-neutral-800 px-4 py-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                </td>
                <td className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {product.name}
                </td>
                <td className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <SignedIn>
                    <span>{price}</span>
                  </SignedIn>
                  <SignedOut>
                    <span className="blur-sm">R$ XXXX</span>
                  </SignedOut>
                </td>
                <td className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm">
                  <Link href={product.href}>
                    <button className="transform rounded-lg bg-blue-500 px-4 py-1 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600">
                      Fazer Pedido
                    </button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;