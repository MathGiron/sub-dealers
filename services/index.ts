export interface RegisterCompanyFormData {
  cnpj: string;
  cep: string;
  address: string;
  number: string;
  companyName: string;
  contactNumber: string;
}

// Define o tipo completo do unsafeMetadata
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
  [key: string]: any; // Permite propriedades adicionais
}

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
  weight?: number;
}

export interface OrderProduct extends Product {
  quantity: number;
  weight?: number; // Adiciona weight pra evitar o erro de Property 'weight' does not exist
}