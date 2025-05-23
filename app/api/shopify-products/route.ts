import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ids } = await req.json();

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Nenhum ID fornecido ou formato inválido" }, { status: 400 });
  }

  const adminApiAccessToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
  const hostName = process.env.SHOPIFY_STORE_DOMAIN;

  if (!adminApiAccessToken || !hostName) {
    return NextResponse.json({ error: "Variáveis de ambiente não definidas" }, { status: 500 });
  }

  const apiUrl = `https://${hostName}/admin/api/2024-07/graphql.json`;
  const query = `
    query GetProductsByIds($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          __typename
          id
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  try {
    console.log("Shopify Products Proxy: Iniciando requisição POST para IDs:", ids, "em", apiUrl);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": adminApiAccessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { ids } }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify Products Proxy: Erro da API Shopify - Status:", response.status, "Texto:", errorText);
      return NextResponse.json({ error: `Erro na API Shopify: ${response.status} - ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("Shopify Products Proxy: Dados retornados:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Shopify Products Proxy: Erro ao conectar com Shopify:", error);
    return NextResponse.json({ error: "Erro ao conectar com Shopify", details: error.message }, { status: 500 });
  }
}