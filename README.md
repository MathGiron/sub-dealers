# Sub-Dealers - Sistema de Revendedores EcoFlow

Sistema completo para gestão de revendedores da EcoFlow, desenvolvido com Next.js 15, TypeScript e integração com múltiplas APIs.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica
- **Frontend**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + CSS Variables
- **Autenticação**: Clerk
- **Deploy**: Vercel
- **Package Manager**: pnpm
- **Banco de Dados**: IndexedDB (local) + Clerk User Metadata
- **Geração de PDF**: Puppeteer + jsPDF (fallback)
- **Email**: Nodemailer + Gmail SMTP

### Estrutura de Diretórios
```
sub-dealers/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── apresentacao/      # Página de apresentação
│   ├── catalogo/          # Catálogo de produtos
│   ├── faqs/              # Página de FAQs
│   ├── manuais/           # Página de manuais
│   ├── order/             # Página de pedidos
│   ├── profile/           # Perfil do usuário
│   └── register-company/  # Registro de empresa
├── components/             # Componentes React
│   ├── ui/                # Componentes de UI
│   ├── acertenity/        # Componentes customizados
│   └── magicui/           # Componentes de UI avançados
├── lib/                    # Utilitários e configurações
├── services/               # Serviços externos (Shopify)
├── types/                  # Definições de tipos TypeScript
└── public/                 # Arquivos estáticos
```

## 🔐 Sistema de Autenticação - Clerk

### Configuração
- **Provider**: Clerk
- **Integração**: Next.js App Router
- **Middleware**: Proteção de rotas
- **User Metadata**: Armazenamento de dados da empresa

### Variáveis de Ambiente Necessárias
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Gmail SMTP
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app

# Shopify
SHOPIFY_STORE_DOMAIN=seu-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_...
```

### Atualização de Environments
⚠️ **IMPORTANTE**: Para produção na Vercel, atualize as seguintes variáveis:

1. **Clerk**: Configure as chaves de produção
2. **Shopify**: Atualize para o store de produção
3. **Email**: Configure SMTP de produção

## 🛍️ Integração Shopify

### Serviços
- **shopifyClient.ts**: Cliente para API do Shopify
- **shopifyService.ts**: Lógica de negócio para produtos
- **API Route**: `/api/shopify-products` para busca de produtos

### Funcionalidades
- Busca de produtos em tempo real
- Filtros por categoria
- Informações detalhadas de produtos
- Preços e variantes

## 📄 Geração de PDF

### Tecnologias
- **Puppeteer**: Geração principal (renderização completa)
- **jsPDF**: Fallback caso Puppeteer falhe
- **Template HTML**: CSS otimizado para impressão

### Processo
1. Geração de HTML com dados do pedido
2. Renderização via Puppeteer
3. Conversão para PDF A4
4. Fallback para jsPDF se necessário

### Configuração Puppeteer
```typescript
const browser = await puppeteer.launch({ 
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--disable-extensions"
  ],
  headless: true,
  timeout: 30000
});
```

## 📧 Sistema de Email

### Configuração
- **Provider**: Gmail SMTP
- **Autenticação**: Senha de app (2FA obrigatório)
- **Templates**: HTML personalizado para pedidos

### Funcionalidades
- Envio automático de pedidos
- Anexo de PDF
- Link direto para WhatsApp
- Notificações para cliente e empresa

## 🗄️ Armazenamento de Dados

### Local (IndexedDB)
- Rascunhos de pedidos
- Cache de produtos
- Dados temporários

### Clerk User Metadata
- Informações da empresa
- CNPJ e dados cadastrais
- Histórico de pedidos
- Endereços de entrega

## 🚀 Deploy na Vercel

### Configuração
- **Platform**: Vercel
- **Framework**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

### Variáveis de Ambiente
Configure todas as variáveis necessárias no dashboard da Vercel:
- Clerk (produção)
- Shopify (produção)
- Email SMTP
- Outras configurações específicas

### Build Scripts
Para permitir scripts de build como Puppeteer:
```bash
pnpm approve-builds
```

## 📱 Funcionalidades Principais

### 1. Sistema de Cadastro
- Registro de empresas
- Validação de CNPJ
- Busca automática de endereço por CEP

### 2. Catálogo de Produtos
- Integração com Shopify
- Filtros e busca
- Seleção de variantes
- Cálculo de frete

### 3. Gestão de Pedidos
- Criação de rascunhos
- Finalização de pedidos
- Geração automática de PDF
- Envio via WhatsApp

### 4. Perfil do Usuário
- Histórico de pedidos
- Dados da empresa
- Rascunhos salvos

## 🛠️ Desenvolvimento

### Instalação
```bash
# Clone o repositório
git clone [url-do-repo]

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute em desenvolvimento
pnpm dev
```

### Scripts Disponíveis
```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build de produção
pnpm start        # Servidor de produção
pnpm lint         # Verificação de código
pnpm approve-builds # Aprovar scripts de build
```

### Estrutura de Componentes
- **Componentes UI**: Baseados em shadcn/ui
- **Componentes Customizados**: Acertenity e MagicUI
- **Layout Responsivo**: Mobile-first design
- **Tema**: Dark mode por padrão

## 🔧 Configurações Específicas

### Tailwind CSS
- Configuração customizada
- Variáveis CSS para temas
- Componentes otimizados

### TypeScript
- Configuração estrita
- Tipos bem definidos
- Interfaces para APIs

### ESLint
- Regras customizadas
- Integração com Next.js
- Prevenção de erros comuns

## 📊 Monitoramento e Logs

### Logs do Sistema
- Geração de PDF
- Envio de emails
- Integrações externas
- Erros e exceções

### Métricas
- Performance de build
- Tempo de resposta das APIs
- Uso de recursos

## 🔒 Segurança

### Implementações
- Autenticação via Clerk
- Validação de dados
- Sanitização de inputs
- Rate limiting nas APIs

### Boas Práticas
- Variáveis de ambiente seguras
- Validação de tipos
- Tratamento de erros
- Logs seguros

## 📈 Roadmap

### Próximas Funcionalidades
- Dashboard administrativo
- Relatórios de vendas
- Integração com sistemas ERP
- Notificações push
- App mobile

### Melhorias Técnicas
- Cache Redis
- CDN para assets
- Otimização de performance
- Testes automatizados

## 🤝 Contribuição

### Padrões de Código
- TypeScript strict mode
- ESLint configurado
- Prettier para formatação
- Commits semânticos

### Processo
1. Fork do repositório
2. Criação de branch feature
3. Desenvolvimento e testes
4. Pull Request com descrição detalhada

## 📞 Contato

- **WhatsApp**: +55 41 9 8440-3450
- **Email**: contato@rodoparana.com.br
- **Empresa**: RODOPARANÁ IMPLEMENTOS RODOVIÁRIOS LTDA.

---

**Desenvolvido com ❤️ para a EcoFlow**
