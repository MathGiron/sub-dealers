"use client";
export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/ui/navbar";
import { Product, OrderProduct, UserMetadata } from "@/types/business";
import jsPDF from "jspdf";
import FreightCalculator from "@/components/FreightCalculator";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/magicui/number-ticker";

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const calculateDistance = (cep: string, metadata?: UserMetadata) => {
  const cleanedCEP = cep.replace(/\D/g, "");
  if (cleanedCEP.length !== 8) {
    return { distance: null };
  }
  return { distance: metadata?.distance || null };
};

const getProductVariant = (product: Product, state: string | null) => {
  if (!state || !product.specs || product.specs.length === 0) {
    return null;
  }

  const variant = product.specs.find((spec) => spec.name.includes(state));
  if (variant) return variant;

  const unifiedVariant = product.specs.find((spec) => spec.name.includes("Unificado"));
  return unifiedVariant || null;
};

export default function OrderPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-96 w-full bg-[var(--background)]"><NumberTicker value={100} startValue={0} className="text-5xl font-bold text-[var(--primary)]" /></div>}>
      <OrderPage />
    </Suspense>
  );
}

function OrderPage() {
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDate, setOrderDate] = useState<string>("");
  const [distance, setDistance] = useState<number | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [freightCost, setFreightCost] = useState<number>(0);
  const [additionalFees, setAdditionalFees] = useState<number>(0);

  const hasLoadedRef = useRef(false);

  const loadProducts = useCallback(async () => {
    console.log("Chamando loadProducts"); // Log pra debug
    const entries = Object.entries(Object.fromEntries(searchParams.entries())).filter(
      ([key]) => key.startsWith("products[")
    );

    if (entries.length === 0) {
      setProducts([]);
      return false;
    }

    const productIds: string[] = [];
    const productQuantities: { [id: string]: number } = {};
    const productVariants: { [id: string]: unknown } = {};

    for (const [key, value] of entries) {
      const id = key.replace("products[", "").replace("]", "").split("/").pop();
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        console.error(`Erro ao parsear produto ${id}:`, error);
        continue;
      }
      const quantity = parseInt(parsed.quantity, 10) || 1;
      productIds.push(`gid://shopify/Product/${id}`);
      productQuantities[`gid://shopify/Product/${id}`] = quantity;
      if (parsed.variant) productVariants[`gid://shopify/Product/${id}`] = parsed.variant;
    }

    if (productIds.length === 0) {
      setProducts([]);
      return false;
    }

    let fetchedProducts: Product[] = [];
    try {
      const response = await fetch("/api/shopify-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: "gid://shopify/Collection/498546704664", productIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Erro ao carregar produtos: ${errorData.error || response.statusText}`);
        setProducts([]);
        return false;
      }

      const data = await response.json();
      console.log("Dados retornados pelo proxy:", data);

      if (!data || !Array.isArray(data) || data.length === 0) {
        setProducts([]);
        return false;
      }

      fetchedProducts = data.map((product: Product) => ({
        id: product.id,
        name: product.name || `Produto Desconhecido (${product.id.split("/").pop()})`,
        image: product.image || "/images/placeholder.png",
        description: product.description || "Sem descrição disponível",
        price: undefined,
        weight: product.weight ?? 0,
        specs: product.specs || [],
        buttonText: "Comprar Agora",
        href: `/checkout/${product.id.split("/").pop()}`,
        highlighted: product.highlighted || product.name?.includes("DELTA 2") || false,
      }));

      console.log("Produtos mapeados:", fetchedProducts);
      if (fetchedProducts.length === 0) {
        setProducts([]);
        return false;
      }
    } catch (error) {
      console.error("Erro ao carregar produtos. Verifique sua conexão ou as credenciais da API.", error);
      setProducts([]);
      return false;
    }

    const userState = (user?.unsafeMetadata?.state as string) || null;
    const selectedProducts: OrderProduct[] = fetchedProducts.map((product: Product) => {
      const variantFromParams = productVariants[product.id];
      let selectedVariant: { name: string; price?: string | number; weight?: number } | null = null;
      if (variantFromParams && typeof variantFromParams === 'object' && 'name' in variantFromParams) {
        selectedVariant = variantFromParams as { name: string; price?: string | number; weight?: number };
      } else {
        const variant = getProductVariant(product, userState);
        if (variant && typeof variant === 'object' && 'name' in variant) {
          selectedVariant = variant as { name: string; price?: string | number; weight?: number };
        } else {
          selectedVariant = null;
        }
      }
      if (!selectedVariant) {
        console.warn(`Nenhuma variante válida encontrada para o produto ${product.name}.`);
      }
      return {
        ...product,
        quantity: productQuantities[product.id] || 1,
        selectedVariant,
        weight: product.weight ?? 0,
      };
    });

    setProducts(selectedProducts);
    return true;
  }, [searchParams, user]);

  // Corrigido: função inline para evitar warning do useCallback
  const debouncedSaveDraft = debounce((...args: unknown[]) => {
    const draftProducts = args[0] as OrderProduct[];
      if (!user) return;
      try {
        user.update({ unsafeMetadata: { ...user.unsafeMetadata, draftOrder: draftProducts } });
      } catch (err) {
        console.error("Erro ao salvar rascunho:", err);
      }
  }, 1000);

  const loadDraft = useCallback(() => {
    if (!user || !user.unsafeMetadata?.draftOrder) return;
    const userState = (user?.unsafeMetadata?.state as string) || null;
    const draftOrder = user.unsafeMetadata.draftOrder as OrderProduct[];
    if (draftOrder.length > 0 && products.length === 0) {
      const updatedDraft = draftOrder.map((product) => ({
        ...product,
        selectedVariant: product.selectedVariant || getProductVariant(product, userState),
      }));
      setProducts(updatedDraft);
    }
  }, [user, products.length]);

  useEffect(() => {
    if (!isLoaded || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadData = async () => {
      setLoading(true);
      console.log("Metadata:", user?.unsafeMetadata); // Log pra debug
      await loadProducts();
      const metadata = user?.unsafeMetadata as UserMetadata;
      if (user?.unsafeMetadata?.cep) {
        const cep = typeof user.unsafeMetadata.cep === 'string' ? user.unsafeMetadata.cep : '';
        const { distance: calculatedDistance } = calculateDistance(cep, metadata);
        setDistance(calculatedDistance ?? 0);
      } else {
        setDistance(0);
      }
      setState(typeof metadata?.state === 'string' ? metadata.state : '');
      const now = new Date();
      setOrderDate(now.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
      setLoading(false);
      loadDraft();
    };
    loadData();
  }, [loadProducts, loadDraft, isLoaded, user?.unsafeMetadata]);

  useEffect(() => {
    if (user?.unsafeMetadata?.state && typeof user.unsafeMetadata.state === 'string') {
      setState(user.unsafeMetadata.state);
    } else {
      setState('');
    }
  }, [user?.unsafeMetadata?.state]);

  useEffect(() => {
    if (products.length > 0) debouncedSaveDraft(products);
  }, [products, debouncedSaveDraft]);

  const handleSubmit = async () => {
    setLoading(true);
    const total = calculateTotal(products);

    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Nota de Pedido", 20, 20);
      doc.setFontSize(12);
      doc.text(`Cliente: ${user?.fullName || "Cliente não identificado"}`, 20, 30);
      doc.text(`CNPJ: ${(user?.unsafeMetadata?.cnpj as string) || "CNPJ não informado"}`, 20, 40);
      doc.text(`Contato: ${user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber || "Número de contato não informado"}`, 20, 50);
      doc.text(`Data do Pedido: ${orderDate}`, 20, 60);
      const metadata = user?.unsafeMetadata as UserMetadata;
      doc.text(`Endereço de Entrega: ${metadata?.address || "Endereço não informado"}, ${metadata?.number || "Número não informado"}, CEP ${metadata?.cep || "CEP não informado"}`, 20, 70);
      doc.text(`Estado: ${typeof state === 'string' && state ? state : "Estado não informado"}`, 20, 80);
      doc.text(`Frete Estimado: R$ ${freightCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, 90);
      doc.text(`Taxas Adicionais: R$ ${additionalFees.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, 100);
      doc.text("Itens do Pedido:", 20, 110);

      let yPosition = 120;
      products.forEach((product, index) => {
        const variant = product.selectedVariant || { name: "Padrão", price: null, weight: null };
        doc.text(`${index + 1}. ${product.name} (${variant.name})`, 20, yPosition);
        doc.text(`Quantidade: ${product.quantity}`, 20, yPosition + 5);
        doc.text(
          `Preço Unitário: R$ ${variant.price ? Number(variant.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "Consultar"}`,
          20,
          yPosition + 10
        );
        doc.text(
          `Total Item: R$ ${calculateItemTotal(product).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          20,
          yPosition + 15
        );
        yPosition += 25;
      });

      doc.text(`Subtotal (sem frete/taxas): R$ ${totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, yPosition);
      doc.text(`Total com Frete e Taxas: R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, yPosition + 10);

      const pdfBuffer = doc.output("arraybuffer");
      const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: products.map((product) => ({
            ...product,
            variantName: product.selectedVariant?.name || "Padrão",
            variantPrice: product.selectedVariant?.price || null,
          })),
          clientName: user?.fullName || "Cliente não identificado",
          cnpj: (user?.unsafeMetadata?.cnpj as string) || "CNPJ não informado",
          contactNumber: user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber || "Número de contato não informado",
          orderDate,
          pdfBuffer: pdfBase64,
          freightCost,
          additionalFees,
          total,
          deliveryAddress: `${metadata?.address || "Endereço não informado"}, ${metadata?.number || "Número não informado"}, CEP ${metadata?.cep || "CEP não informado"}`,
          state: typeof state === 'string' && state ? state : "Estado não informado",
          email: user?.primaryEmailAddress?.emailAddress || "seu@email.com",
        }),
      });

      const result = await response.json();
      if (!result.success) {
        alert("Erro ao enviar pedido. Tente novamente.");
        setLoading(false);
        return;
      }

      const completedOrders = (user?.unsafeMetadata?.completedOrders || []) as unknown[];
      const newOrder = {
        idPedido: result.idPedido || `pedido_${Date.now()}`,
        produtos: products.map((product) => ({
          nome: product.name,
          quantidade: product.quantity,
          variante: product.selectedVariant?.name || "Padrão",
          precoVariante: product.selectedVariant?.price || null,
        })),
        status: "sucesso",
        frete: freightCost,
        taxasAdicionais: additionalFees,
        total: total,
        enderecoEntrega: `${metadata?.address || "Endereço não informado"}, ${metadata?.number || "Número não informado"}, CEP ${metadata?.cep || "CEP não informado"}`,
        dataPedido: orderDate,
        estado: typeof state === 'string' && state ? state : "Estado não informado",
      };
      if (user) {
        await user.update({ unsafeMetadata: { ...user.unsafeMetadata, completedOrders: [...completedOrders, newOrder], draftOrder: [] } });
      }
      setProducts([]);
      
      // Abrir WhatsApp
      window.open(result.whatsappLink, "_blank");
    } catch {
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: OrderProduct) => product.selectedVariant?.price ? Number(product.selectedVariant.price) : 0;
  const calculateItemTotal = (product: OrderProduct) => getProductPrice(product) * (product.quantity || 1);
  const calculateTotal = (products: OrderProduct[]) => products.reduce((sum, product) => sum + calculateItemTotal(product), 0) + freightCost + additionalFees;
  const totalAmount = products.reduce((sum, product) => sum + calculateItemTotal(product), 0);

  if (!isLoaded || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <NumberTicker value={100} startValue={0} className="text-5xl font-bold text-[var(--primary)]" />
    </div>
  );

  const clientName = user?.fullName?.toString() || "Cliente não identificado";
  const cnpj = (user?.unsafeMetadata?.cnpj as string | undefined)?.toString() || "CNPJ não informado";
  const contactNumber = (user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber)?.toString() || "Número de contato não informado";
  const metadata = user?.unsafeMetadata as UserMetadata;

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <div className="mx-auto w-full max-w-[540px] p-6 py-40 flex justify-center">
        <div className="shadow-input w-full rounded-none bg-black p-4 md:rounded-2xl md:p-8 dark:bg-black border border-gray-300">
          <h1 className="text-xl font-bold text-neutral-200">Nota de Pedido</h1>
          <p className="mt-2 max-w-sm text-sm text-neutral-300">Detalhes do pedido para o time comercial.</p>
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-neutral-200">Informações do Cliente</h2>
            <p className="text-sm text-neutral-300">Nome: {clientName}</p>
            <p className="text-sm text-neutral-300">CNPJ: {cnpj}</p>
            <p className="text-sm text-neutral-300">Contato: {contactNumber}</p>
            <p className="text-sm text-neutral-300">Data do Pedido: {orderDate}</p>
            <p className="text-sm text-neutral-300">Endereço de Entrega: {metadata?.address || "Endereço não informado"}, {metadata?.number || "Número não informado"}, CEP {metadata?.cep || "CEP não informado"}</p>
            <p className="text-sm text-neutral-300">Estado: {state || "Estado não informado"}</p>
            <p className="text-sm text-neutral-300">Frete Estimado: R$ {freightCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            <p className="text-sm text-neutral-300">Taxas Adicionais: R$ {additionalFees.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          {products.length > 0 ? (
            <>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-neutral-200">Itens do Pedido</h2>
                <ul className="mt-2 space-y-4">
                  {products.map((product) => (
                    <li key={product.id} className="flex flex-col">
                      <p className="text-sm text-white">{product.name} ({product.selectedVariant?.name || "Padrão"})</p>
                      <p className="text-sm text-neutral-300">Quantidade: {product.quantity}</p>
                      <p className="text-sm text-neutral-300">Preço Unitário: R$ {product.selectedVariant?.price ? Number(product.selectedVariant.price).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Consultar"}</p>
                      <p className="text-sm text-neutral-300">Peso: {(product.selectedVariant?.weight || product.weight || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg</p>
                      <p className="text-sm text-neutral-300">Total Item: R$ {calculateItemTotal(product).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-lg font-bold text-neutral-200">Subtotal (sem frete/taxas): R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-lg font-bold text-neutral-200">Total com Frete e Taxas: R$ {calculateTotal(products).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="mt-6 flex justify-center w-full">
                <Button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto mt-4 h-12 px-8 text-md flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[var(--radius)] shadow transition-colors hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                >
                  Enviar para o time comercial
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-neutral-300 mt-4">Nenhum produto no pedido. Verifique os IDs ou a coleção.</p>
          )}
          <FreightCalculator
            products={products.map(p => ({ 
              id: p.id, 
              name: p.name, 
              weight: p.selectedVariant?.weight ?? p.weight ?? 0, 
              quantity: p.quantity ?? 1 
            }))}
            distance={distance ?? 0}
            state={state ?? ""}
            totalAmount={totalAmount ?? 0}
            onFreightCalculated={(freight, fees) => {
              setFreightCost(freight);
              setAdditionalFees(fees);
            }}
          />
        </div>
      </div>
    </div>
  );
}