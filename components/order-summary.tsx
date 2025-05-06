"use client";

import React from "react";

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  // Calcular o subtotal de cada item e o total geral
  const calculateSubtotal = (price: string, quantity: number) => {
    if (price === "Consultar") return 0;
    return parseFloat(price) * quantity;
  };

  const total = items.reduce((sum, item) => {
    return sum + calculateSubtotal(item.price, item.quantity);
  }, 0);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Resumo do Pedido
        </h2>
        {items.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum produto selecionado.</p>
        ) : (
          <div className="space-y-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="border p-3 text-left">Nome</th>
                  <th className="border p-3 text-left">Preço</th>
                  <th className="border p-3 text-left">Quantidade</th>
                  <th className="border p-3 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="border p-3 text-gray-600">{item.name}</td>
                    <td className="border p-3 text-gray-600">
                      {item.price === "Consultar"
                        ? "Consultar"
                        : `R$ ${parseFloat(item.price).toFixed(2).replace(".", ",")}`}
                    </td>
                    <td className="border p-3 text-gray-600">{item.quantity}</td>
                    <td className="border p-3 text-gray-600">
                      {item.price === "Consultar"
                        ? "Consultar"
                        : `R$ ${calculateSubtotal(item.price, item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-4">
              <div className="text-lg font-semibold text-gray-800">
                Total: R$ {total.toFixed(2).replace(".", ",")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}