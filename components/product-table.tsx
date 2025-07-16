"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { DataTable } from "@/components/ui/datatable/data-table";
import { columns } from "@/components/ui/datatable/columns";
import { useRouter } from "next/navigation";
import { Product, UserMetadata } from "@/services/index";
import { useUser } from "@clerk/nextjs";

// Função para selecionar a variante correta com base no estado
const getProductVariant = (product: Product, state: string) => {
  const validStates = ["PR", "MG", "RJ", "SC"];
  const isValidState = validStates.includes(state);

  const variant = product.specs.find((spec) => spec.name.includes(state));
  if (variant) return variant;

  const unifiedVariant = product.specs.find((spec) => spec.name.includes("Unificado"));
  return unifiedVariant || product.specs[0] || { price: product.price, weight: product.weight, name: "Padrão" };
};

interface ProductDataTableProps<TData> {
  initialData: TData[];
}

export function ProductDataTable<TData>({ initialData }: ProductDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { user } = useUser();
  const state = (user?.unsafeMetadata?.state as string) || "SP"; // Fallback pra SP

  const router = useRouter();

  const table = useReactTable({
    data: initialData as (Product & { quantity?: number })[],
    columns: columns as ColumnDef<Product & { quantity?: number }, unknown>[],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

  const handleMakeOrder = () => {
    if (selectedRows.length > 0) {
      const query = new URLSearchParams(
        selectedRows.map((product) => [
          `products[${product.id}]`,
          JSON.stringify({
            quantity: product.quantity || 1,
            variant: getProductVariant(product, state), // Envia a variante selecionada
          }),
        ])
      ).toString();
      router.push(`/order?${query}`);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nome..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-auto"
              style={{
                background: "var(--card)",
                color: "var(--card-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)"
              }}
            >
              Colunas <ChevronDown className="ml-2 h-4 w-4" style={{ color: "var(--card-foreground)" }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            style={{
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)"
            }}
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize hover:bg-[var(--muted)]"
                  style={{ color: "var(--popover-foreground)" }}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DataTable table={table} />
      <div className="flex items-center justify-between w-full px-4 py-4">
        <div className="flex items-center gap-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.8)",
              borderRadius: "var(--radius)",
              transition: "background 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "var(--muted)"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowLeft/>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.8)",
              borderRadius: "var(--radius)",
              transition: "background 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "var(--muted)"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            <ArrowRight/>
          </Button>
          <span className="ml-4 text-sm text-gray-400 dark:text-gray-400">
            {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </span>
        </div>
        <div>
          <Button
            variant="default"
            size="sm"
            onClick={handleMakeOrder}
            disabled={selectedRows.length === 0}
            className="text-foreground"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: "var(--radius)"
            }}
          >
            Fazer Orçamento
          </Button>
        </div>
      </div>
    </div>
  );
}