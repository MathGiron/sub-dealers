// Tipos relacionados aos componentes
import type { Table } from "@tanstack/react-table";
import type { ComponentPropsWithoutRef } from "react";

// Data Table
export interface DataTableProps<TData> {
  table: Table<TData>;
  renderExpandedRow?: (row: unknown) => React.ReactNode;
}

export interface ProductDataTableProps<TData> {
  initialData: TData[];
}

// Carousel
export interface CarouselProps {
  items: React.ReactNode[];
  className?: string;
}

export interface Card {
  title: string;
  description: string;
  src: string;
  href: string;
}

// Expandable Card
export interface ExpandableCardDemoProps {
  products: Array<{
    id: string;
    name: string;
    image: string;
    description: string;
  }>;
}

// Hover Border Gradient
export type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export interface HoverBorderGradientProps {
  children: React.ReactNode;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
}

// Number Ticker
export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  className?: string;
} 