// Tipos relacionados aos componentes UI

import type { ColumnSort, Row, RowData } from "@tanstack/react-table";
import type { DataTableConfig } from "@/types/utils";
import type { FilterItemSchema } from "@/lib/parsers";

// Data Table UI
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  }
}

export interface UIProduct {
  id: string;
  name: string;
  image?: string;
  specs: Array<{
    price: string;
  }>;
}

export interface Option {
  label: string;
  value: string;
  count?: number;
}

export type FilterOperator = DataTableConfig["operators"][number];
export type FilterVariant = DataTableConfig["filterVariants"][number];
export type JoinOperator = DataTableConfig["joinOperators"][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: keyof TData;
}

export interface ExtendedColumnFilter<TData> extends Omit<FilterItemSchema, 'id'> {
  id: keyof TData;
}

export interface DataTableRowAction<TData> {
  label: string;
  onClick: (row: Row<TData>) => void;
  icon?: React.ComponentType<{ className?: string }>;
} 