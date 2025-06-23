import { Product } from "./index";
import { useUser } from "@clerk/nextjs";

export const filterPricesByState = (products: Product[]): Product[] => {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return products;

  const state = user.unsafeMetadata?.state as string;
  let variantTitle: string = "Revenda"; // Base em Revenda
  if (state && ["PR", "MG", "RJ", "SC"].includes(state)) {
    variantTitle = "PR/MG/RJ/SC"; // Sobrescreve pra esses estados
  } else {
    variantTitle = "Unificado"; // Resto usa Unificado
  }

  return products.map((product) => {
    const revendaVariant = product.specs.find((spec) => spec.name === "Revenda");
    const targetVariant = product.specs.find((spec) => spec.name === variantTitle);
    return {
      ...product,
      price: targetVariant ? parseFloat(targetVariant.price as string) : revendaVariant ? parseFloat(revendaVariant.price as string) : product.specs[0]?.price ? parseFloat(product.specs[0].price as string) : 0.00,
    };
  });
};