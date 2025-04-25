import React from "react";
import { Product } from "@/services/shopifyService";
import ProductCard from "./ProductCard";

interface ProductCatalogProps {
  products: Product[];
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ products }) => {
  console.log("ProductCatalog: Produtos recebidos:", products);

  return (
    <div className="py-20 lg:py-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 dark:text-white tracking-tight">
          Catálogo de Produtos EcoFlow - Sub-Dealers
        </h2>
        <p className="mt-4 text-base lg:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Descubra nossas soluções de energia portátil e sustentável para casa, camping e emergências.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Nenhum produto encontrado na coleção.
          </p>
        ) : (
          products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;