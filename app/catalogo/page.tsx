import { fetchSubDealersProducts, Product } from "@/services/shopifyService";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Image from "next/image";

async function fetchProducts(): Promise<Product[]> {
  const products = await fetchSubDealersProducts();
  return products;
}

export default async function CatalogoPage() {
  const products = await fetchProducts();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8">
          Catálogo de Produtos
        </h1>
        {products.length === 0 ? (
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Nenhum produto encontrado.
          </p>
        ) : (
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
                  // Obter o preço da primeira variante disponível
                  const price = product.specs[0]?.price
                    ? `R$ ${parseFloat(product.specs[0].price).toFixed(2)}`
                    : "N/A";
                  return (
                    <tr key={product.id} className="border-b border-neutral-200 dark:border-neutral-800">
                      <td className="border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm">
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
                        {price}
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
        )}
      </div>
    </div>
  );
}