import { NextRequest, NextResponse } from "next/server";
import { fetchProductsByIds, fetchSubDealersProducts } from "@/services/shopifyService";

export async function POST(req: NextRequest) {
  const body = await req.clone().json();
  console.log("API /api/shopify-products - Body recebido:", body);
  const { collectionId, productIds } = body;
  console.log("API /api/shopify-products - collectionId:", collectionId, "productIds:", productIds);

  if (!collectionId || typeof collectionId !== "string") {
    console.error("Shopify Products Proxy: Collection ID inválido:", collectionId);
    return NextResponse.json({ error: "Collection ID inválido ou ausente" }, { status: 400 });
  }

  try {
    if (Array.isArray(productIds) && productIds.length > 0) {
      // Buscar produtos específicos
      console.log("Shopify Products Proxy: Iniciando fetch de produtos por IDs:", productIds);
      const products = await fetchProductsByIds(productIds);
      console.log("Shopify Products Proxy: Produtos retornados pelo serviço:", JSON.stringify(products, null, 2));
      return NextResponse.json(products);
    } else {
      // Buscar todos os produtos da coleção
      console.log("Shopify Products Proxy: Buscando todos os produtos da coleção:", collectionId);
      const products = await fetchSubDealersProducts();
      return NextResponse.json(products);
    }
  } catch (error) {
    console.error("Shopify Products Proxy: Erro ao conectar com Shopify:", error);
    return NextResponse.json({ error: "Erro ao conectar com Shopify", details: (error as Error).message }, { status: 500 });
  }
}