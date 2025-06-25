import { NextRequest, NextResponse } from "next/server";
import { fetchProductsByIds } from "@/services/shopifyService"; // Ajuste o caminho conforme a estrutura

export async function POST(req: NextRequest) {
  const { collectionId, productIds } = await req.json();
  console.log("Shopify Products Proxy: Coleta recebida:", { collectionId, productIds });

  if (!collectionId || typeof collectionId !== "string") {
    console.error("Shopify Products Proxy: Collection ID inválido:", collectionId);
    return NextResponse.json({ error: "Collection ID inválido ou ausente" }, { status: 400 });
  }

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    console.error("Shopify Products Proxy: Product IDs inválidos:", productIds);
    return NextResponse.json({ error: "Product IDs inválidos ou ausentes" }, { status: 400 });
  }

  try {
    console.log("Shopify Products Proxy: Iniciando fetch de produtos por IDs:", productIds);
    const products = await fetchProductsByIds(productIds);
    console.log("Shopify Products Proxy: Produtos retornados pelo serviço:", JSON.stringify(products, null, 2));
    return NextResponse.json(products);
  } catch (error) {
    console.error("Shopify Products Proxy: Erro ao conectar com Shopify:", error);
    return NextResponse.json({ error: "Erro ao conectar com Shopify", details: (error as Error).message }, { status: 500 });
  }
}