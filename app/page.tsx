import ProductCatalog from "@/components/product-catalog";
import HeroSectionOne from "@/components/hero-section-demo-1";
import Navbar from "@/components/navbar";
import { Product } from "@/services/shopifyService";

async function fetchProducts(): Promise<Product[]> {
  console.log("Iniciando fetch para /api/produtos...");
  const res = await fetch("http://localhost:3000/api/produtos", {
    cache: "no-store", // Garante que a requisição seja feita no SSR
  });
  console.log("Resposta recebida de /api/produtos:", res.status, res.statusText);

  if (!res.ok) {
    console.error("Erro ao buscar produtos:", res.statusText);
    throw new Error("Erro ao buscar produtos");
  }

  const data = await res.json();
  console.log("Dados recebidos de /api/produtos:", data);
  return data;
}

export default async function Home() {
  console.log("Renderizando página Home...");
  let products: Product[] = [];
  try {
    products = await fetchProducts();
  } catch (error) {
    console.error("Erro ao carregar produtos na página:", error);
  }
  console.log("Produtos a serem passados para ProductCatalog:", products);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSectionOne />
      <main>
        <ProductCatalog products={products} />
      </main>
    </div>
  );
}