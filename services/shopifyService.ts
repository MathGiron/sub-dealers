import { GraphQLClient } from "graphql-request";

// Interface para os dados retornados
interface ProductSpec {
  name: string;
  included: boolean;
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

// Query GraphQL
const GET_SUBDEALERS_PRODUCTS_QUERY = `
  query {
    collection(id: "gid://shopify/Collection/498546704664") {
      id
      title
      products(first: 10) {
        edges {
          node {
            id
            title
            description
            featuredImage {
              url
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

// Serviço para buscar produtos da coleção pelo ID usando graphql-request
export const fetchSubDealersProducts = async (): Promise<Product[]> => {
  const adminApiAccessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
  const hostName = process.env.SHOPIFY_STORE_DOMAIN;

  if (!adminApiAccessToken || !hostName) {
    console.error("fetchSubDealersProducts: Variáveis de ambiente SHOPIFY_ADMIN_API_TOKEN ou SHOPIFY_STORE_DOMAIN não definidas.");
    return [];
  }

  const apiUrl = `https://${hostName}/admin/api/2025-04/graphql.json`;
  const client = new GraphQLClient(apiUrl, {
    headers: {
      "X-Shopify-Access-Token": adminApiAccessToken,
    },
  });

  try {
    console.log("fetchSubDealersProducts: Iniciando requisição GraphQL com graphql-request para", apiUrl);
    const data = await client.request(GET_SUBDEALERS_PRODUCTS_QUERY);
    console.log("fetchSubDealersProducts: Dados completos retornados pela API:", JSON.stringify(data, null, 2));

    const subDealersCollection = data.collection;

    if (!subDealersCollection) {
      console.log("fetchSubDealersProducts: Coleção com ID 'gid://shopify/Collection/498546704664' não encontrada.");
      return [];
    }

    console.log("fetchSubDealersProducts: Coleção encontrada:", subDealersCollection);

    if (subDealersCollection.products.edges.length === 0) {
      console.log("fetchSubDealersProducts: Nenhum produto encontrado na coleção. Verifique se a coleção contém produtos visíveis.");
    }

    const products: Product[] = subDealersCollection.products.edges.map((edge: any) => {
      const variants = edge.node.variants.edges.map((variantEdge: any) => ({
        name: variantEdge.node.title,
        included: true,
      }));

      const product = {
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

      console.log("fetchSubDealersProducts: Produto mapeado:", product);
      return product;
    });

    console.log("fetchSubDealersProducts: Produtos retornados:", products);
    return products;
  } catch (error) {
    console.error("fetchSubDealersProducts: Erro ao buscar produtos da coleção com ID gid://shopify/Collection/498546704664:", error);
    return [];
  }
};