// Tipos relacionados às APIs

// Shopify API
export interface ProductNode {
  __typename?: string;
  id: string;
  title: string;
  description: string;
  featuredImage: { url: string | null };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { 
    edges: { 
      node: { 
        id: string; 
        title: string; 
        price: string; 
        metafield?: { value: string | null } | null 
      } 
    }[] 
  };
  metafield?: { value: string | null } | null;
}

export interface GraphQLResponse {
  nodes: ProductNode[];
}

// API de Pedidos
export interface PedidoData {
  products?: Array<{
    name: string;
    quantity: number;
    price?: number | string;
    variantPrice?: number | string;
    selectedVariant?: {
      price?: number | string;
    };
  }>;
  clientName?: string;
  cnpj?: string;
  contactNumber?: string;
  deliveryAddress?: string;
  state?: string;
  freightCost?: number;
  additionalFees?: number;
  email?: string;
  clientEmail?: string;
}

// API de Email
export interface ProductEmail {
  name: string;
  price: string;
  quantity: number;
}

// API de Produtos
export interface ProductOrder {
  name: string;
  quantity: number;
  price: number | string;
} 