"use client";

import React from "react";
import type { OrderSummaryProps } from "@/types/business";

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
    <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
      <div className="bg-[var(--card)] p-6 rounded-[var(--radius)] shadow-lg w-full max-w-2xl border border-[var(--border)]">
        <h2 className="text-2xl font-bold text-[var(--card-foreground)] mb-4 text-center">
          Resumo do Pedido
        </h2>
        {items.length === 0 ? (
          <p className="text-center text-[var(--muted-foreground)]">Nenhum produto selecionado.</p>
        ) : (
          <div className="space-y-4">
            <table className="w-full border-collapse rounded-[var(--radius)] overflow-hidden">
              <thead>
                <tr className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                  <th className="border border-[var(--border)] p-3 text-left">Nome</th>
                  <th className="border border-[var(--border)] p-3 text-left">Preço</th>
                  <th className="border border-[var(--border)] p-3 text-left">Quantidade</th>
                  <th className="border border-[var(--border)] p-3 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)]">
                    <td className="border border-[var(--border)] p-3 text-[var(--card-foreground)]">{item.name}</td>
                    <td className="border border-[var(--border)] p-3 text-[var(--card-foreground)]">
                      {item.price === "Consultar"
                        ? "Consultar"
                        : `R$ ${parseFloat(item.price).toFixed(2).replace(".", ",")}`}
                    </td>
                    <td className="border border-[var(--border)] p-3 text-[var(--card-foreground)]">{item.quantity}</td>
                    <td className="border border-[var(--border)] p-3 text-[var(--card-foreground)]">
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
              <div className="text-lg font-semibold text-[var(--primary)]">
                Total: R$ {total.toFixed(2).replace(".", ",")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}