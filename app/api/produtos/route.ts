import { NextResponse } from "next/server";
import { fetchSubDealersProducts } from "@/services/shopifyService";

// Handler para GET requests
export async function GET() {
  console.log("API route /api/produtos foi chamada...");
  try {
    const products = await fetchSubDealersProducts();
    console.log("Produtos retornados pela API route:", products);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Erro na API /api/produtos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}