// Tipos utilitários

import type { ClassValue } from "clsx";

// Utilitários para classes CSS
export type ClassValueType = ClassValue;

// Tipos para configurações
export interface DataTableConfig {
  operators: string[];
  filterVariants: string[];
  joinOperators: string[];
}

export interface FilterItemSchema {
  id: string;
  value: unknown;
  operator?: string;
}

// Tipos para IndexedDB
export interface IndexedDBConfig {
  dbName: string;
  storeName: string;
  version: number;
}

// Tipos para debounce
export interface DebounceConfig {
  delay: number;
  immediate?: boolean;
}

// Tipos para animações
export interface AnimationConfig {
  duration: number;
  easing?: string;
  delay?: number;
}

// Tipos para validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Tipos para eventos
export interface EventHandler<T = Event> {
  (event: T): void;
}

// Tipos para estados
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Tipos para paginação
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
}

// Tipos para ordenação
export interface SortState {
  id: string;
  desc: boolean;
}

// Tipos para filtros
export interface FilterState {
  id: string;
  value: unknown;
} 