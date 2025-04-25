import dotenv from "dotenv";
import path from "path";


// Carrega o arquivo .env.local da raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Log para confirmar que o carregamento foi bem-sucedido
console.log("Variáveis carregadas do .env.local:");
console.log("SHOPIFY_ADMIN_API_TOKEN:", process.env.SHOPIFY_ADMIN_API_TOKEN);
console.log("SHOPIFY_STORE_DOMAIN:", process.env.SHOPIFY_STORE_DOMAIN);