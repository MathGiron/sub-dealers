import { ProductDataTable } from "@/components/product-table";
import { Product, fetchSubDealersProducts } from "@/services/shopifyService";

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
    <div className="container mx-auto py-10">
      <ProductDataTable initialData={data} />
    </div>
  );
}