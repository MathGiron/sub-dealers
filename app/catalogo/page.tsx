export const dynamic = "force-dynamic";
import ProductTableLazyWrapper from "@/components/ProductTableLazyWrapper";
import {Product} from "@/services/index";
import Navbar from "@/components/ui/navbar"; // Importando a navbar correta
import { headers } from "next/headers";

async function getData(): Promise<Product[]> {
  try {
    const body = { collectionId: "gid://shopify/Collection/498546704664", productIds: [] };
    console.log("Frontend: Enviando para /api/shopify-products", body);
    let baseUrl = "";
    if (typeof window === "undefined") {
      // SSR
      const h = await headers();
      const host = h.get("host");
      baseUrl = host ? `http://${host}` : "http://localhost:3000";
    }
    const res = await fetch(
      baseUrl ? `${baseUrl}/api/shopify-products` : "/api/shopify-products",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    const products = await res.json();
    console.log("Produtos retornados:", products); // Log para depuração
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-20">
        <ProductTableLazyWrapper initialData={data} />
      </div>
    </div>
  );
}