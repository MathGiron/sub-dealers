import { ProductDataTable } from "@/components/product-table";
import { fetchSubDealersProducts } from "@/services/shopifyService";
import {Product} from "@/services/index";
import Navbar from "@/components/navbar"; // Importando a navbar correta

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
    <div className="min-h-screen bg-black dark:bg-black text-white dark:text-white">
      <Navbar />
      <div className="container mx-auto py-20">
        <ProductDataTable initialData={data} />
      </div>
    </div>
  );
}