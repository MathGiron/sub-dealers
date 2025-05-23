export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  price?: number; // Adiciona o campo price
  specs: Array<{
    name: string;
    included: boolean;
    price?: string | number;
  }>;
  buttonText: string;
  href: string;
  highlighted: boolean;
}

export interface OrderProduct extends Product {
  quantity: number;
}