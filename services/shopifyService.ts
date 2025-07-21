import { GraphQLClient } from "graphql-request";
import { ProductSpec, Product } from "./index";

// Interfaces para tipagem
interface ProductNode {
  __typename?: string; // Opcional, pra lidar com ausência
  id: string;
  title: string;
  description: string;
  featuredImage: { url: string | null };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: { node: { id: string; title: string; price: string; metafield?: { value: string | null } | null } }[] };
  metafield?: { value: string | null } | null; // Opcional
}

interface GraphQLResponse {
  nodes: ProductNode[];
}

// Query para buscar todos os produtos da coleção (mantida)
const GET_SUBDEALERS_PRODUCTS_QUERY = `
  query {
    collection(id: "gid://shopify/Collection/498546704664") {
      id
      title
      products(first: 70) {
        edges {
          node {
            id
            title
            description
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  price
                  metafield(namespace: "custom", key: "peso") {
                    value
                  }
                }
              }
            }
            metafield(namespace: "custom", key: "peso") {
              value
            }
          }
        }
      }
    }
  }
`;

// Query para buscar produtos por IDs (com __typename explícito)
const GET_PRODUCTS_BY_IDS_QUERY = `
  query GetProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on Product {
        id
        title
        description
        featuredImage {
          url
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 3) {
          edges {
            node {
              id
              title
              price
              metafield(namespace: "custom", key: "peso") {
                value
              }
            }
          }
        }
        metafield(namespace: "custom", key: "peso") {
          value
        }
      }
    }
  }
`;

// Serviço para buscar produtos da coleção (mantido)
export const fetchSubDealersProducts = async (): Promise<Product[]> => {
  const adminApiAccessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
  const hostName = process.env.SHOPIFY_STORE_DOMAIN;

  if (!adminApiAccessToken || !hostName) {
    console.error("fetchSubDealersProducts: Variáveis de ambiente não definidas.");
    return [];
  }

  const apiUrl = `https://${hostName}/admin/api/2024-07/graphql.json`;
  const client = new GraphQLClient(apiUrl, {
    headers: { "X-Shopify-Access-Token": adminApiAccessToken },
  });

  try {
    const data = await client.request(GET_SUBDEALERS_PRODUCTS_QUERY);
    const subDealersCollection = (data as any).collection;

    if (!subDealersCollection) return [];
    if (subDealersCollection.products.edges.length === 0) return [];

    const products: Product[] = subDealersCollection.products.edges.map((edge: any) => {
      let weight = 0;
      if (edge.node.metafield?.value) weight = parseFloat(edge.node.metafield.value) || 0;

      const variants = edge.node.variants.edges.map((variantEdge: any) => {
        let variantWeight = weight;
        if (variantEdge.node.metafield?.value) variantWeight = parseFloat(variantEdge.node.metafield.value) || 0;
        return {
          name: variantEdge.node.title,
          included: true,
          price: variantEdge.node.price ? parseFloat(variantEdge.node.price) : edge.node.priceRange?.minVariantPrice?.amount ? parseFloat(edge.node.priceRange.minVariantPrice.amount) : 0,
          weight: variantWeight,
        };
      });

      return {
        id: edge.node.id,
        name: edge.node.title,
        image: edge.node.featuredImage?.url || "/images/placeholder.png",
        description: edge.node.description || "Sem descrição disponível",
        price: edge.node.priceRange?.minVariantPrice?.amount ? parseFloat(edge.node.priceRange.minVariantPrice.amount) / 100 : 0,
        weight: weight,
        specs: variants.length > 0 ? variants : [{ name: "Capacidade", included: true }, { name: "Potência", included: true }, { name: "Peso", included: true }],
        buttonText: "Comprar Agora",
        href: `/checkout/${edge.node.id.split("/").pop()}`,
        highlighted: edge.node.title.includes("DELTA 2"),
      };
    });

    return products;
  } catch (error) {
    console.error("fetchSubDealersProducts: Erro na requisição:", error);
    return [];
  }
};

// Serviço para buscar produtos por IDs (ajustado pra aceitar nodos sem __typename)
export const fetchProductsByIds = async (ids: string[]): Promise<Product[]> => {
  const adminApiAccessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
  const hostName = process.env.SHOPIFY_STORE_DOMAIN;

  if (!adminApiAccessToken || !hostName) {
    console.error("fetchProductsByIds: Variáveis de ambiente não definidas.");
    return [];
  }

  const apiUrl = `https://${hostName}/admin/api/2024-07/graphql.json`;
  const client = new GraphQLClient(apiUrl, {
    headers: { "X-Shopify-Access-Token": adminApiAccessToken },
  });

  try {
    console.log("fetchProductsByIds: IDs recebidos:", ids);
    console.log("fetchProductsByIds: Iniciando requisição para IDs:", ids);
    const data = await client.request<GraphQLResponse>(GET_PRODUCTS_BY_IDS_QUERY, { ids });
    console.log("fetchProductsByIds: Dados brutos retornados:", JSON.stringify(data, null, 2));

    const filteredNodes = data.nodes.filter((node: ProductNode) => 
      node.__typename === "Product" || (node.id && node.title)
    );
    console.log("fetchProductsByIds: Número de nodos filtrados:", filteredNodes.length);
    if (filteredNodes.length === 0) {
      console.warn("fetchProductsByIds: Nenhum nodo válido encontrado. Verifique os IDs ou a resposta da API.");
    } else {
      filteredNodes.forEach((node, index) => {
        console.log(`fetchProductsByIds: Nodo ${index + 1} - ID: ${node.id}, Title: ${node.title || 'Sem título'}, Metafield: ${node.metafield?.value || 'null'}`);
      });
    }

    const products: Product[] = filteredNodes.map((node: ProductNode) => {
      let weight = 0;
      if (node.metafield?.value) weight = parseFloat(node.metafield.value) || 0;

      const variants = node.variants.edges.map((variantEdge: any, variantIndex) => {
        let variantWeight = weight;
        if (variantEdge.node.metafield?.value) variantWeight = parseFloat(variantEdge.node.metafield.value) || 0;
        console.log(`  Variante ${variantIndex + 1} - Title: ${variantEdge.node.title}, Price: ${variantEdge.node.price}, Weight: ${variantWeight}`);
        return {
          name: variantEdge.node.title,
          included: true,
          price: variantEdge.node.price ? parseFloat(variantEdge.node.price) : node.priceRange?.minVariantPrice?.amount ? parseFloat(node.priceRange.minVariantPrice.amount) / 100 : 0,
          weight: variantWeight,
        };
      });

      const product: Product = {
        id: node.id,
        name: node.title,
        image: node.featuredImage?.url || "/images/placeholder.png",
        description: node.description || "Sem descrição disponível",
        price: node.priceRange?.minVariantPrice?.amount ? parseFloat(node.priceRange.minVariantPrice.amount) / 100 : 0,
        weight: weight,
        specs: variants.length > 0 ? variants : [{ name: "Capacidade", included: true }, { name: "Potência", included: true }, { name: "Peso", included: true }],
        buttonText: "Comprar Agora",
        href: `/checkout/${node.id.split("/").pop()}`,
        highlighted: node.title.includes("DELTA 2"),
      };
      console.log(`Produto mapeado - ID: ${product.id}, Name: ${product.name}, Price: ${product.price}, Specs length: ${product.specs.length}`);

      return product;
    });

    console.log("fetchProductsByIds: Produtos mapeados:", JSON.stringify(products, null, 2));
    return products;
  } catch (error) {
    console.error("fetchProductsByIds: Erro na requisição:", error);
    return [];
  }
};

export type { Product } from './index';