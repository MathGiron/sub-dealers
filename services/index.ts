export interface RegisterCompanyFormData {
  cnpj: string;
  cep: string;
  address: string;
  number: string;
  companyName: string;
  contactNumber: string;
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
  [key: string]: any;
}

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
  weight?: number;
  selectedVariant?: {
    name: string;
    price?: string | number;
    weight?: number;
  } | null;
}