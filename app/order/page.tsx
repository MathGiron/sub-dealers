"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/order-summary";

export default function OrderPage() {
  const searchParams = useSearchParams();
  const initialProducts = Object.entries(Object.fromEntries(searchParams.entries()))
    .filter(([key]) => key.startsWith("products["))
    .map(([key, value]) => {
      const id = key.replace("products[", "").replace("]", "");
      return { id, ...JSON.parse(value) };
    });

  const [products, setProducts] = useState(initialProducts);

  const handleQuantityChange = (id: string, value: string) => {
    const newValue = parseInt(value) || 1;
    if (newValue < 1) return;
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, quantity: newValue } : product
      )
    );
  };

  const handleSubmit = () => {
    console.log("Pedido submetido:", products);
    // Aqui você pode adicionar a lógica para enviar o pedido (ex.: via API)
  };

  return (
    <div className="container mx-auto py-10">
      <OrderSummary items={products} />
      {products.length > 0 && (
        <div className="flex justify-center mt-6 space-x-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center space-x-2">
              <span className="text-gray-600">{product.name}:</span>
              <Input
                type="number"
                min="1"
                value={product.quantity}
                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                className="w-20"
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-center mt-6">
        <Button onClick={handleSubmit} variant="default">
          Confirmar Pedido
        </Button>
      </div>
    </div>
  );
}