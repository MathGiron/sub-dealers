import { GraphQLClient } from "graphql-request";
import { Product } from "./index";

// Query para buscar todos os produtos da coleção (mantida como está)
const GET_SUBDEALERS_PRODUCTS_QUERY = `
  query {
    collection(id: "gid://shopify/Collection/498546704664") {
      id
      title
      products(first: 30) {
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
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Query para buscar produtos por IDs
const GET_PRODUCTS_BY_IDS_QUERY = `
  query GetProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
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
            }
          }
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
    console.error("fetchSubDealersProducts: Variáveis de ambiente não definidas.", {
      adminApiAccessToken: adminApiAccessToken ? "Definido" : "Não definido",
      hostName: hostName ? "Definido" : "Não definido",
    });
    return [];
  }

  const apiUrl = `https://${hostName}/admin/api/2024-07/graphql.json`;
  const client = new GraphQLClient(apiUrl, {
    headers: {
      "X-Shopify-Access-Token": adminApiAccessToken,
    },
  });

  try {
    console.log("fetchSubDealersProducts: Iniciando requisição para", apiUrl);
    const data = await client.request(GET_SUBDEALERS_PRODUCTS_QUERY);
    console.log("fetchSubDealersProducts: Dados retornados:", JSON.stringify(data, null, 2));

    const subDealersCollection = data.collection;

    if (!subDealersCollection) {
      console.log("fetchSubDealersProducts: Coleção não encontrada.");
      return [];
    }

    if (subDealersCollection.products.edges.length === 0) {
      console.log("fetchSubDealersProducts: Nenhum produto encontrado na coleção.");
    }

    const products: Product[] = subDealersCollection.products.edges.map((edge: any) => {
      const variants = edge.node.variants.edges.map((variantEdge: any) => ({
        name: variantEdge.node.title,
        included: true,
        price: variantEdge.node.price || edge.node.priceRange?.minVariantPrice?.amount,
      }));

      const product: Product = {
        id: edge.node.id,
        name: edge.node.title,
        image: edge.node.featuredImage?.url || "/images/placeholder.png",
        description: edge.node.description || "Sem descrição disponível",
        specs: variants.length > 0 ? variants : [
          { name: "Capacidade", included: true },
          { name: "Potência", included: true },
          { name: "Peso", included: true },
        ],
        buttonText: "Comprar Agora",
        href: `/checkout/${edge.node.id.split("/").pop()}`,
        highlighted: edge.node.title.includes("DELTA 2"),
      };

      return product;
    });

    console.log("fetchSubDealersProducts: Produtos retornados:", products);
    return products;
  } catch (error) {
    console.error("fetchSubDealersProducts: Erro na requisição:", error);
    return [];
  }
};

// Serviço para buscar produtos por IDs
export const fetchProductsByIds = async (ids: string[]): Promise<Product[]> => {
  const adminApiAccessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
  const hostName = process.env.SHOPIFY_STORE_DOMAIN;

  if (!adminApiAccessToken || !hostName) {
    console.error("fetchProductsByIds: Variáveis de ambiente não definidas.", {
      adminApiAccessToken: adminApiAccessToken ? "Definido" : "Não definido",
      hostName: hostName ? "Definido" : "Não definido",
    });
    return [];
  }

  // Lista de versões da API pra tentar
  const apiVersions = ["2025-01", "2024-10", "2024-07", "2024-04"];
  let lastError: any = null;

  // Primeiro, testar a conexão com um fetch direto
  const testUrl = `https://${hostName}/admin/api/2024-07/graphql.json`;
  try {
    console.log("fetchProductsByIds: Testando conexão com", testUrl);
    const testResponse = await fetch(testUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": adminApiAccessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "query { shop { name } }" }),
    });
    const testResult = await testResponse.json();
    console.log("fetchProductsByIds: Resposta do teste:", testResult, "Status:", testResponse.status);
  } catch (testError) {
    console.error("fetchProductsByIds: Erro no teste de conexão:", testError, "URL:", testUrl);
    lastError = testError;
  }

  // Tentar cada versão da API
  for (const version of apiVersions) {
    const apiUrl = `https://${hostName}/admin/api/${version}/graphql.json`;
    const client = new GraphQLClient(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": adminApiAccessToken,
      },
    });

    try {
      console.log("fetchProductsByIds: Iniciando requisição para IDs:", ids, "em", apiUrl);
      const data = await client.request(GET_PRODUCTS_BY_IDS_QUERY, { ids });
      console.log("fetchProductsByIds: Dados retornados:", JSON.stringify(data, null, 2));

      const products: Product[] = data.nodes
        .filter((node: any) => node.__typename === "Product")
        .map((node: any) => {
          const variants = node.variants.edges.map((variantEdge: any) => ({
            name: variantEdge.node.title,
            included: true,
            price: variantEdge.node.price || node.priceRange?.minVariantPrice?.amount,
          }));

          const product: Product = {
            id: node.id,
            name: node.title,
            image: node.featuredImage?.url || "/images/placeholder.png",
            description: node.description || "Sem descrição disponível",
            specs: variants.length > 0 ? variants : [
              { name: "Capacidade", included: true },
              { name: "Potência", included: true },
              { name: "Peso", included: true },
            ],
            buttonText: "Comprar Agora",
            href: `/checkout/${node.id.split("/").pop()}`,
            highlighted: node.title.includes("DELTA 2"),
          };

          return product;
        });

      console.log("fetchProductsByIds: Produtos retornados:", products);
      return products;
    } catch (error) {
      console.error(`fetchProductsByIds: Erro na requisição com ${apiUrl}:`, error);
      lastError = error;
    }
  }

  console.error("fetchProductsByIds: Todas as versões da API falharam. Último erro:", lastError);
  return [];
};