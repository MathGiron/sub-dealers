"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import { Product, OrderProduct } from "@/services/index";
import jsPDF from "jspdf";

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

    const productIds: string[] = [];
    const productQuantities: { [id: string]: number } = {};

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
      productIds.push(id);
      productQuantities[id] = quantity;
    }

    console.log("IDs dos produtos:", productIds);
    console.log("Quantidades:", productQuantities);

    if (productIds.length === 0) {
      setError("Nenhum ID de produto válido encontrado.");
      setProducts([]);
      return false;
    }

    let fetchedProducts: Product[] = [];
    try {
      const response = await fetch("/api/shopify-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: productIds }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao buscar produtos via proxy - Status:", response.status, "Texto:", errorText);
        setError("Erro ao carregar produtos. Verifique sua conexão ou as credenciais da API.");
        setProducts([]);
        return false;
      }

      const rawResponse = await response.text();
      console.log("Resposta bruta da API:", rawResponse);

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (err) {
        console.error("Erro ao parsear resposta como JSON:", err);
        setError("Erro ao processar dados da API Shopify.");
        setProducts([]);
        return false;
      }

      console.log("Dados retornados pelo proxy:", JSON.stringify(data, null, 2));

      if (!data || !data.data || !data.data.nodes) {
        console.error("Resposta inválida, falta 'data.data.nodes':", data);
        setError("Dados inválidos retornados pela API Shopify.");
        setProducts([]);
        return false;
      }

      fetchedProducts = data.data.nodes
        .filter((node: any) => node?.__typename === "Product" || (node.id && node.title))
        .map((node: any) => {
          console.log("Mapeando nó:", JSON.stringify(node, null, 2));
          const priceAmount = node.priceRange?.minVariantPrice?.amount
            ? parseFloat(node.priceRange.minVariantPrice.amount) / 100
            : 0;

          const product: Product = {
            id: node.id,
            name: node.title || `Produto Desconhecido (${node.id.split("/").pop()})`,
            image: node.featuredImage?.url || "/images/placeholder.png",
            description: node.description || "Sem descrição disponível",
            price: priceAmount,
            specs: [
              { name: "Capacidade", included: true },
              { name: "Potência", included: true },
              { name: "Peso", included: true },
            ],
            buttonText: "Comprar Agora",
            href: `/checkout/${node.id.split("/").pop()}`,
            highlighted: node.title?.includes("DELTA 2") || false,
          };

          return product;
        });

      console.log("Produtos retornados:", fetchedProducts);
      if (fetchedProducts.length === 0) {
        console.warn("Nenhum produto retornado pela API Shopify após mapeamento.");
        setError("Nenhum produto encontrado para os IDs selecionados.");
        setProducts([]);
        return false;
      }
    } catch (err) {
      console.error("Erro ao buscar produtos via proxy:", err);
      setError("Erro ao carregar produtos. Verifique sua conexão ou as credenciais da API.");
      setProducts([]);
      return false;
    }

    const selectedProducts: OrderProduct[] = fetchedProducts.map((product: Product) => ({
      ...product,
      quantity: productQuantities[product.id] || 1,
    }));

    console.log("Produtos selecionados com quantidades:", selectedProducts);

    setProducts(selectedProducts);
    setError(null);
    return true;
  };

  const saveDraft = async (draftProducts: OrderProduct[]) => {
    if (!user) return;

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          draftOrder: draftProducts,
        },
      });
      console.log("Rascunho salvo no unsafeMetadata:", draftProducts);
    } catch (err) {
      console.error("Erro ao salvar rascunho no unsafeMetadata:", err);
    }
  };

  const loadDraft = () => {
    if (!user || !user.unsafeMetadata?.draftOrder) return;

    const draftOrder = user.unsafeMetadata.draftOrder as OrderProduct[];
    if (draftOrder.length > 0 && products.length === 0) {
      setProducts(draftOrder);
      console.log("Rascunho carregado do unsafeMetadata:", draftOrder);
    }
  };

  useEffect(() => {
    loadProducts();
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

    loadDraft();
  }, [searchParams, user]);

  useEffect(() => {
    if (products.length > 0) {
      saveDraft(products);
    }
  }, [products]);

  const handleSubmit = async () => {
    setLoading(true);
    const hasProducts = await loadProducts();
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
      // Gerar o PDF
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Nota de Pedido", 20, 20);
      doc.setFontSize(12);
      doc.text(`Cliente: ${user?.fullName || "Cliente não identificado"}`, 20, 30);
      doc.text(`CNPJ: ${(user?.unsafeMetadata?.cnpj as string) || "CNPJ não informado"}`, 20, 40);
      doc.text(`Contato: ${user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber || "Número de contato não informado"}`, 20, 50);
      doc.text(`Data do Pedido: ${orderDate}`, 20, 60);
      doc.text("Itens do Pedido:", 20, 70);

      let yPosition = 80;
      products.forEach((product, index) => {
        doc.text(`${index + 1}. ${product.name}`, 20, yPosition);
        doc.text(`Quantidade: ${product.quantity}`, 20, yPosition + 5);
        doc.text(`Preço Unitário: R$ ${getProductPrice(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPosition + 10);
        doc.text(`Total: R$ ${calculateItemTotal(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPosition + 15);
        yPosition += 25;
      });

      doc.text(`Total Geral: R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPosition);

      const pdfBuffer = doc.output('arraybuffer');
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

      // Enviar o pedido e o e-mail
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products,
          clientName: user?.fullName || "Cliente não identificado",
          cnpj: (user?.unsafeMetadata?.cnpj as string) || "CNPJ não informado",
          contactNumber: user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber || "Número de contato não informado",
          orderDate,
          pdfBuffer: pdfBase64,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error("Erro ao enviar pedido:", result.error);
        alert("Erro ao enviar pedido. Tente novamente.");
        setLoading(false);
        return;
      }

      // Salvar o pedido concluído no unsafeMetadata
      const completedOrders = (user?.unsafeMetadata?.completedOrders || []) as any[];
      const newOrder = {
        id: `order_${Date.now()}`,
        products,
        orderDate,
        status: "success",
      };
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          completedOrders: [...completedOrders, newOrder],
          draftOrder: [],
        },
      });
      setProducts([]);

      // Redirecionar pro WhatsApp imediatamente
      window.open(result.whatsappLink, "_blank");
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: OrderProduct) => {
    return product.price || 0;
  };

  const calculateItemTotal = (product: OrderProduct) => {
    const price = getProductPrice(product);
    return price * (product.quantity || 1);
  };

  const totalAmount = products.reduce((sum, product) => sum + calculateItemTotal(product), 0);

  if (!isLoaded || loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  const clientName = user?.fullName?.toString() || "Cliente não identificado";
  const cnpj = (user?.unsafeMetadata?.cnpj as string | undefined)?.toString() || "CNPJ não informado";
  const contactNumber = (user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber)?.toString() || "Número de contato não informado";

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <div className="mx-auto w-full max-w-md p-6 py-40 flex justify-center">
        <div className="shadow-input w-full rounded-none bg-black p-4 md:rounded-2xl md:p-8 dark:bg-black border border-gray-300">
          <h1 className="text-xl font-bold text-neutral-200">Nota de Pedido</h1>
          <p className="mt-2 max-w-sm text-sm text-neutral-300">Detalhes do pedido para o time comercial.</p>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
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
                      <p className="text-sm text-neutral-300">Quantidade: {product.quantity}</p>
                      <p className="text-sm text-neutral-300">Preço Unitário: R$ {getProductPrice(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-sm text-neutral-300">Total: R$ {calculateItemTotal(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-lg font-bold text-neutral-200">Total Geral: R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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