// Tipos relacionados ao negócio

export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  price?: number;
  specs: Array<{
    name: string;
    included: boolean;
    price?: string | number;
    weight?: number;
  }>;
  buttonText: string;
  href: string;
  highlighted: boolean;
  weight?: number;
}

export interface OrderProduct extends Product {
  quantity: number;
  selectedVariant?: {
    name: string;
    price?: number | string;
    weight?: number;
  } | null;
  variantPrice?: number | string;
}

export interface UserMetadata {
  cnpj?: string;
  cep?: string;
  address?: string;
  number?: string;
  companyName?: string;
  contactNumber?: string;
  state?: string;
  registerCompany?: boolean;
  draftOrder?: OrderProduct[];
  completedOrders?: any[];
  email?: string;
  [key: string]: any;
}

export interface RegisterCompanyFormData {
  cnpj: string;
  cep: string;
  address: string;
  number: string;
  contactNumber: string;
}

// Tipos para pedidos
export interface Order {
  id: string;
  products: OrderProduct[];
  orderDate: string;
  status: "pending" | "success";
  total?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
}

export interface OrderSummaryProps {
  items: OrderItem[];
}

// Tipos para manuais
export interface Manual {
  category: string;
  title: string;
  src: string;
  pdfPath: string;
  group: string;
}

// Tipos para cálculo de frete
export type DistanceRange = 
  | "001-100" | "101-200" | "201-400" | "401-600" | "601-800" | "801-1000" 
  | "1001-1200" | "1201-1400" | "1401-1600" | "1601-1800" | "1801-2000" 
  | "2001-2200" | "2201-2400" | "2401-2600" | "2601-2800" | "2801-3000" 
  | "3001-3200" | "3201-3400" | "3401-3800" | "3801-4200" | "4201-4600" 
  | "4601-5000" | "5001-5400" | "5400+";

export type WeightRange = "0-5" | "5-10" | "11-20" | "21-40" | "41-60" | "61-100" | "100+";

export interface FreightProduct {
  id: string;
  name: string;
  weight: number;
  quantity: number;
}

export interface FreightCalculatorProps {
  products: FreightProduct[];
  distance: number;
  state: string;
  totalAmount: number;
  onFreightCalculated: (freight: number, additionalFees: number) => void;
} 