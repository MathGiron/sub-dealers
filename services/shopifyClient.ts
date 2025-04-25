import { Shopify, shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";

// Verificar se as variáveis de ambiente estão definidas
const adminApiAccessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
const hostName = process.env.SHOPIFY_STORE_DOMAIN;

console.log("Variáveis de ambiente carregadas:");
console.log("SHOPIFY_ADMIN_API_TOKEN:", adminApiAccessToken);
console.log("SHOPIFY_STORE_DOMAIN:", hostName);

if (!adminApiAccessToken) {
  throw new Error(
    "Erro: A variável de ambiente SHOPIFY_ADMIN_API_TOKEN deve estar definida no arquivo .env.local"
  );
}

if (!hostName) {
  throw new Error(
    "Erro: A variável de ambiente SHOPIFY_STORE_DOMAIN deve estar definida no arquivo .env.local (ex.: nome-da-loja.myshopify.com)"
  );
}

// Configurar o cliente Shopify
const shopify = shopifyApi({
  apiKey: "not-needed-for-custom-apps",
  apiSecretKey: "not-needed-for-custom-apps",
  scopes: ["read_products", "write_products"],
  hostName: hostName,
  apiVersion: "2025-04",
  isCustomStoreApp: true,
  adminApiAccessToken: adminApiAccessToken,
});

// Função para criar um cliente GraphQL
export const createGraphQLClient = () => {
  const session = {
    id: `offline_${hostName}`,
    shop: hostName,
    accessToken: adminApiAccessToken,
    state: "offline",
    isOnline: false,
    isActive: true,
    scope: ["read_products", "write_products"],
    expires: undefined,
    onlineAccessInfo: undefined,
    accessTokenExpiresAt: undefined,
  };

  return new shopify.clients.Graphql({ session });
};