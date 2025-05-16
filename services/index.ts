export interface ProductSpec {
  name: string;
  included: boolean;
  price?: string; // Campo para o preço da variante
}

export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  specs: ProductSpec[];
  buttonText: string;
  href: string;
  highlighted?: boolean;
}

export interface OrderProduct extends Product {
  quantity: number;
}