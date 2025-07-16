import ProductTableLazyWrapper from "@/components/ProductTableLazyWrapper";
import { fetchSubDealersProducts } from "@/services/shopifyService";
import {Product} from "@/services/index";
import Navbar from "@/components/ui/navbar"; // Importando a navbar correta

async function getData(): Promise<Product[]> {
  try {
    const products = await fetchSubDealersProducts();
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