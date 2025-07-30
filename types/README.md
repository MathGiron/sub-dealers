# Arquitetura de Tipos - Sub-Dealers

## 📁 Estrutura Organizada

```
types/
├── index.ts          # Exportações principais
├── business.ts       # Tipos de negócio (produtos, pedidos, usuários)
├── api.ts           # Tipos de APIs (Shopify, pedidos, email)
├── components.ts    # Tipos de componentes
├── ui.ts           # Tipos de UI (data-table, etc.)
├── utils.ts        # Tipos utilitários
├── data-table.ts   # Compatibilidade (re-exporta ui.ts)
└── README.md       # Esta documentação
```

## 🎯 Categorias de Tipos

### **Business** (`/types/business.ts`)
- **Produtos:** `Product`, `OrderProduct`
- **Usuários:** `UserMetadata`, `RegisterCompanyFormData`
- **Pedidos:** `Order`, `OrderItem`, `OrderSummaryProps`
- **Manuais:** `Manual`
- **Frete:** `DistanceRange`, `WeightRange`, `FreightProduct`, `FreightCalculatorProps`

### **API** (`/types/api.ts`)
- **Shopify:** `ProductNode`, `GraphQLResponse`
- **Pedidos:** `PedidoData`
- **Email:** `ProductEmail`
- **Produtos:** `ProductOrder`

### **Components** (`/types/components.ts`)
- **Data Table:** `DataTableProps`, `ProductDataTableProps`
- **Carousel:** `CarouselProps`, `Card`
- **Expandable Card:** `ExpandableCardDemoProps`
- **Hover Border:** `Direction`, `HoverBorderGradientProps`
- **Number Ticker:** `NumberTickerProps`

### **UI** (`/types/ui.ts`)
- **Data Table UI:** Extensões do TanStack Table
- **Filtros:** `FilterOperator`, `FilterVariant`, `JoinOperator`
- **Ações:** `DataTableRowAction`

### **Utils** (`/types/utils.ts`)
- **CSS:** `ClassValueType`
- **Configurações:** `DataTableConfig`, `FilterItemSchema`
- **IndexedDB:** `IndexedDBConfig`
- **Estados:** `LoadingState`, `PaginationState`, `SortState`

## 🚀 Como Usar

### **Import Simples**
```typescript
import type { Product, OrderProduct } from "@/types/business";
import type { PedidoData } from "@/types/api";
import type { DataTableProps } from "@/types/components";
```

### **Import com Wildcard**
```typescript
import type * as BusinessTypes from "@/types/business";
import type * as ApiTypes from "@/types/api";
```

### **Import Tudo**
```typescript
import type * as Types from "@/types";
// Acesso: Types.Product, Types.PedidoData, etc.
```

## 🔄 Migração

### **Antes**
```typescript
// Tipos espalhados em vários arquivos
interface Product { ... } // em services/index.ts
type PedidoData = { ... } // em app/api/send-order/route.ts
interface OrderItem { ... } // em components/order-summary.tsx
```

### **Depois**
```typescript
// Tipos centralizados e organizados
import type { Product, PedidoData, OrderItem } from "@/types";
```

## ✅ Benefícios

1. **Organização:** Tipos organizados por categoria
2. **Reutilização:** Imports limpos e consistentes
3. **Manutenibilidade:** Mudanças em um só local
4. **Escalabilidade:** Fácil adição de novos tipos
5. **Type Safety:** Melhor inferência de tipos
6. **IntelliSense:** Autocompletar aprimorado

## 🔧 Manutenção

### **Adicionar Novo Tipo**
1. Identificar categoria (business, api, components, ui, utils)
2. Adicionar ao arquivo correspondente
3. Exportar no `index.ts` se necessário

### **Atualizar Tipo Existente**
1. Localizar no arquivo correto
2. Fazer alteração
3. Verificar imports em outros arquivos

### **Remover Tipo**
1. Remover do arquivo
2. Atualizar imports
3. Verificar dependências 