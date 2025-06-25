"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import { Product, OrderProduct, UserMetadata } from "@/services/index";
import jsPDF from "jspdf";
import FreightCalculator from "@/components/FreightCalculator";

// Componente decorativo
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const calculateDistance = (cep: string, metadata?: UserMetadata) => {
  const cleanedCEP = cep.replace(/\D/g, "");
  if (cleanedCEP.length !== 8) return { distance: 100, state: "SP" }; // Fallback
  if (metadata?.cep && metadata?.state) return { distance: metadata.distance || 100, state: metadata.state };
  return { distance: 100, state: "SP" }; // Fallback final
};

export default function OrderPage() {
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDate, setOrderDate] = useState<string>("");
  const [distance, setDistance] = useState<number>(100);
  const [state, setState] = useState<string>("SP");
  const [freightCost, setFreightCost] = useState<number>(0);
  const [additionalFees, setAdditionalFees] = useState<number>(0);

  const loadProducts = async () => {
    const entries = Object.entries(Object.fromEntries(searchParams.entries())).filter(
      ([key]) => key.startsWith("products[")
    );

    if (entries.length === 0) {
      setError("Nenhum produto selecionado.");
      setProducts([]);
      return false;
    }

    const productIds: string[] = [];
    const productQuantities: { [id: string]: number } = {};

    for (const [key, value] of entries) {
      const id = key.replace("products[", "").replace("]", "").split("/").pop();
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        continue;
      }
      const quantity = parseInt(parsed.quantity, 10) || 1;
      productIds.push(`gid://shopify/Product/${id}`);
      productQuantities[`gid://shopify/Product/${id}`] = quantity;
    }

    if (productIds.length === 0) {
      setError("Nenhum ID de produto válido encontrado.");
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
        setError(`Erro ao carregar produtos: ${errorData.error || response.statusText}`);
        setProducts([]);
        return false;
      }

      const data = await response.json();
      console.log("Dados retornados pelo proxy:", data); // Log essencial

      if (!data || !Array.isArray(data) || data.length === 0) {
        setError("Nenhum produto encontrado para os IDs selecionados na collection.");
        setProducts([]);
        return false;
      }

      fetchedProducts = data.map((product: any) => ({
        id: product.id,
        name: product.name || `Produto Desconhecido (${product.id.split("/").pop()})`,
        image: product.image || "/images/placeholder.png",
        description: product.description || "Sem descrição disponível",
        price: product.price || 0,
        weight: product.weight || 0,
        specs: product.specs || [],
        buttonText: "Comprar Agora",
        href: `/checkout/${product.id.split("/").pop()}`,
        highlighted: product.highlighted || product.name?.includes("DELTA 2") || false,
      }));

      console.log("Produtos mapeados:", fetchedProducts); // Log essencial
      if (fetchedProducts.length === 0) {
        setError("Nenhum produto encontrado para os IDs selecionados na collection.");
        setProducts([]);
        return false;
      }
    } catch (err) {
      setError("Erro ao carregar produtos. Verifique sua conexão ou as credenciais da API.");
      setProducts([]);
      return false;
    }

    const selectedProducts: OrderProduct[] = fetchedProducts.map((product: Product) => ({
      ...product,
      quantity: productQuantities[product.id] || 1,
    }));

    setProducts(selectedProducts);
    setError(null);
    return true;
  };

  const saveDraft = async (draftProducts: OrderProduct[]) => {
    if (!user) return;
    try {
      await user.update({ unsafeMetadata: { ...user.unsafeMetadata, draftOrder: draftProducts } });
    } catch (err) {}
  };

  const loadDraft = () => {
    if (!user || !user.unsafeMetadata?.draftOrder) return;
    const draftOrder = user.unsafeMetadata.draftOrder as OrderProduct[];
    if (draftOrder.length > 0 && products.length === 0) setProducts(draftOrder);
  };

  useEffect(() => {
    const loadData = async () => {
      const hasProducts = await loadProducts();
      if (user?.unsafeMetadata?.cep) {
        const metadata = user.unsafeMetadata as UserMetadata;
        const { distance: calculatedDistance, state: calculatedState } = calculateDistance(user.unsafeMetadata.cep, metadata);
        setDistance(calculatedDistance);
        setState(calculatedState);
      } else {
        setDistance(100);
        setState("SP");
      }
      const now = new Date();
      setOrderDate(now.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
      setLoading(false);
      loadDraft();
    };
    loadData();
  }, [searchParams, user]);

  useEffect(() => {
    if (products.length > 0) saveDraft(products);
  }, [products]);

  const handleSubmit = async () => {
    setLoading(true);
    const hasProducts = await loadProducts();
    const now = new Date();
    setOrderDate(now.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));

    if (!hasProducts) {
      setLoading(false);
      return;
    }

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
      doc.text(`Endereço de Entrega: ${metadata?.address}, ${metadata?.number}, CEP ${metadata?.cep}`, 20, 70);
      doc.text(`Estado: ${state}`, 20, 80);
      doc.text(`Frete Estimado: R$ ${freightCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, 90);
      doc.text(`Taxas Adicionais: R$ ${additionalFees.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, 100);
      doc.text("Itens do Pedido:", 20, 110);

      let yPosition = 120;
      products.forEach((product, index) => {
        doc.text(`${index + 1}. ${product.name}`, 20, yPosition);
        doc.text(`Quantidade: ${product.quantity}`, 20, yPosition + 5);
        doc.text(`Preço Unitário: R$ ${getProductPrice(product).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, yPosition + 10);
        doc.text(`Total Item: R$ ${calculateItemTotal(product).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 20, yPosition + 15);
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
          products,
          clientName: user?.fullName || "Cliente não identificado",
          cnpj: (user?.unsafeMetadata?.cnpj as string) || "CNPJ não informado",
          contactNumber: user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber || "Número de contato não informado",
          orderDate,
          pdfBuffer: pdfBase64,
          freightCost,
          additionalFees,
          total,
          deliveryAddress: `${metadata?.address}, ${metadata?.number}, CEP ${metadata?.cep}`,
          state,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        alert("Erro ao enviar pedido. Tente novamente.");
        setLoading(false);
        return;
      }

      const completedOrders = (user?.unsafeMetadata?.completedOrders || []) as any[];
      const newOrder = {
        id: `order_${Date.now()}`,
        products,
        orderDate,
        status: "success",
        freightCost,
        additionalFees,
        total,
        deliveryAddress: `${metadata?.address}, ${metadata?.number}, CEP ${metadata?.cep}`,
        state,
      };
      await user.update({ unsafeMetadata: { ...user.unsafeMetadata, completedOrders: [...completedOrders, newOrder], draftOrder: [] } });
      setProducts([]);
      window.open(result.whatsappLink, "_blank");
    } catch (error) {
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product: OrderProduct) => product.price || 0;
  const calculateItemTotal = (product: OrderProduct) => getProductPrice(product) * (product.quantity || 1);
  const calculateTotal = (products: OrderProduct[]) => products.reduce((sum, product) => sum + calculateItemTotal(product), 0) + freightCost + additionalFees;
  const totalAmount = products.reduce((sum, product) => sum + calculateItemTotal(product), 0);

  if (!isLoaded || loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  const clientName = user?.fullName?.toString() || "Cliente não identificado";
  const cnpj = (user?.unsafeMetadata?.cnpj as string | undefined)?.toString() || "CNPJ não informado";
  const contactNumber = (user?.phoneNumbers?.[0]?.phoneNumber || user?.unsafeMetadata?.contactNumber)?.toString() || "Número de contato não informado";
  const metadata = user?.unsafeMetadata as UserMetadata;

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
            <p className="text-sm text-neutral-300">Endereço de Entrega: {metadata?.address}, {metadata?.number}, CEP {metadata?.cep}</p>
            <p className="text-sm text-neutral-300">Estado: {state}</p>
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
                      <p className="text-sm text-white">{product.name}</p>
                      <p className="text-sm text-neutral-300">Quantidade: {product.quantity}</p>
                      <p className="text-sm text-neutral-300">Preço Unitário: R$ {getProductPrice(product).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-sm text-neutral-300">Peso: {(product.weight || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} kg</p>
                      <p className="text-sm text-neutral-300">Total Item: R$ {calculateItemTotal(product).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-lg font-bold text-neutral-200">Subtotal (sem frete/taxas): R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-lg font-bold text-neutral-200">Total com Frete e Taxas: R$ {calculateTotal(products).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
            <p className="text-center text-neutral-300 mt-4">Nenhum produto no pedido. Verifique os IDs ou a coleção.</p>
          )}
          <FreightCalculator
            products={products}
            distance={distance}
            state={state}
            totalAmount={totalAmount}
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