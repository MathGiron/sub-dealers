"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import { Product, OrderProduct } from "@/services/index";
import { fetchProductsByIds } from "@/services/shopifyService";

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

export default function OrderPage() {
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDate, setOrderDate] = useState<string>("");

  // Função para carregar produtos por IDs do searchParams
  const loadProducts = async () => {
    const entries = Object.entries(Object.fromEntries(searchParams.entries())).filter(
      ([key]) => key.startsWith("products[")
    );

    console.log("Entradas do searchParams:", entries);

    if (entries.length === 0) {
      setError("Nenhum produto selecionado.");
      setProducts([]);
      return false;
    }

    const productIds = entries.map(([key]) => key.replace("products[", "").replace("]", ""));
    let fetchedProducts: Product[] = [];

    try {
      fetchedProducts = await fetchProductsByIds(productIds);
      console.log("Produtos retornados por IDs:", fetchedProducts);
    } catch (err) {
      console.error("Erro ao buscar produtos por IDs na API:", err);
      setError("Erro ao carregar produtos por IDs.");
      setProducts([]);
      return false;
    }

    const selectedProducts: OrderProduct[] = [];
    for (const [key, value] of entries) {
      const id = key.replace("products[", "").replace("]", "");
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        console.error("Erro ao parsear searchParams:", error, "Valor:", value);
        continue;
      }
      const quantity = parseInt(parsed.quantity, 10) || 1;

      const productFromApi = fetchedProducts.find((p) => p.id === id);
      if (productFromApi) {
        selectedProducts.push({
          ...productFromApi,
          quantity,
        });
      } else {
        console.warn(`Produto com ID ${id} não encontrado na API.`);
        selectedProducts.push({
          id,
          name: `Produto Desconhecido (${id.split("/").pop()})`,
          image: "/images/placeholder.png",
          description: "Sem descrição disponível",
          specs: [{ name: "Preço", included: true, price: "0" }],
          buttonText: "Comprar Agora",
          href: `/checkout/${id.split("/").pop()}`,
          highlighted: false,
          quantity,
        });
      }
    }

    console.log("Produtos selecionados:", selectedProducts);
    if (selectedProducts.length === 0) {
      setError("Nenhum produto encontrado para os IDs selecionados.");
      setProducts([]);
      return false;
    }

    setProducts(selectedProducts);
    setError(null);
    return true;
  };

  useEffect(() => {
    // Carregar produtos na montagem inicial
    loadProducts();

    // Atualizar a data do pedido
    const now = new Date();
    const formattedDate = now.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrderDate(formattedDate);
    setLoading(false);
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);

    // Reanalisar os produtos do searchParams antes de enviar
    const hasProducts = await loadProducts();

    // Atualizar a data do pedido
    const now = new Date();
    const formattedDate = now.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setOrderDate(formattedDate);

    if (!hasProducts) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products,
          clientName: user?.fullName || "Cliente não identificado",
          cnpj: (user?.unsafeMetadata?.cnpj as string) || "CNPJ não informado",
          contactNumber: user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber || "Número de contato não informado",
          orderDate,
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Pedido enviado com sucesso!");
        window.open(result.whatsappLink, "_blank");
      } else {
        console.error("Erro ao enviar pedido:", result.error);
        alert("Erro ao enviar pedido. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: OrderProduct) => {
    const price = product.specs && product.specs.length > 0 && product.specs[0]?.price
      ? parseFloat(product.specs[0].price)
      : 0;
    return price;
  };

  const calculateItemTotal = (product: OrderProduct) => {
    const price = getProductPrice(product);
    return price * (product.quantity || 1);
  };

  const totalAmount = products.reduce((sum, product) => sum + calculateItemTotal(product), 0);

  if (!isLoaded || loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  const clientName = user?.fullName || "Cliente não identificado";
  const cnpj = (user?.unsafeMetadata?.cnpj as string) || "CNPJ não informado";
  const contactNumber = user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber || "Número de contato não informado";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto w-full max-w-md p-6 py-40 flex justify-center">
        <div className="shadow-input w-full rounded-none bg-black p-4 md:rounded-2xl md:p-8 dark:bg-black border border-gray-300">
          <h1 className="text-xl font-bold text-neutral-200">Nota de Pedido</h1>
          <p className="mt-2 max-w-sm text-sm text-neutral-300">
            Detalhes do pedido para o time comercial.
          </p>

          {error && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}

          <div className="mt-4">
            <h2 className="text-lg font-semibold text-neutral-200">Informações do Cliente</h2>
            <p className="text-sm text-neutral-300">Nome: {clientName}</p>
            <p className="text-sm text-neutral-300">CNPJ: {cnpj}</p>
            <p className="text-sm text-neutral-300">Contato: {contactNumber}</p>
            <p className="text-sm text-neutral-300">Data do Pedido: {orderDate}</p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-neutral-200">Itens do Pedido</h2>
                <ul className="mt-2 space-y-4">
                  {products.map((product) => (
                    <li key={product.id} className="flex flex-col">
                      <p className="text-sm text-white">{product.name}</p>
                      <p className="text-sm text-neutral-300">
                        Quantidade: {product.quantity}
                      </p>
                      <p className="text-sm text-neutral-300">
                        Preço Unitário: R$ {getProductPrice(product).toFixed(2)}
                      </p>
                      <p className="text-sm text-neutral-300">
                        Total: R$ {calculateItemTotal(product).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <p className="text-lg font-bold text-neutral-200">
                  Total Geral: R$ {totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                >
                  {loading ? "Carregando..." : "Enviar para o Time Comercial"}
                  <BottomGradient />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-neutral-300 mt-4">Nenhum produto no pedido.</p>
          )}
        </div>
      </div>
    </div>
  );
}