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
import { ChevronDown } from "lucide-react";
import { DataTable } from "@/components/ui/datatable/data-table";
import { columns } from "@/components/ui/datatable/columns";
import { useRouter } from "next/navigation";
import { Product } from "@/services/index";

interface ProductDataTableProps<TData> {
  initialData: TData[];
}

export function ProductDataTable<TData>({ initialData }: ProductDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
            quantity: product.quantity || 1, // Envia apenas a quantidade
          }),
        ])
      ).toString();
      router.push(`/order?${query}`);
    }
  };

  return (
    <div className="w-full  text-white dark:text-white">
      <div className="flex items-center py-4 ">
        <Input
          placeholder="Filtrar por nome..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm  text-white dark:text-white border-gray-300 dark:border-gray-300 placeholder-gray-400 dark:placeholder-gray-400"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-black dark:bg-black text-white dark:text-white border-gray-300 dark:border-gray-300 hover:bg-gray-800 dark:hover:bg-gray-800">
              Colunas <ChevronDown className="ml-2 h-4 w-4 text-white dark:text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black dark:bg-black text-white dark:text-white border-gray-300 dark:border-gray-300">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize text-white dark:text-white hover:bg-gray-800 dark:hover:bg-gray-800"
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
      <div className="flex items-center justify-between space-x-2 py-4 ">
        <div className="flex-1 text-sm text-gray-400 dark:text-gray-400">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-black dark:bg-black text-white dark:text-white border-gray-300 dark:border-gray-300 hover:bg-gray-800 dark:hover:bg-gray-800"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-black dark:bg-black text-white dark:text-white border-gray-300 dark:border-gray-300 hover:bg-gray-800 dark:hover:bg-gray-800"
          >
            Próximo
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleMakeOrder}
            disabled={selectedRows.length === 0}
            className="bg-blue-700 dark:bg-blue-700 text-white dark:text-white hover:bg-blue-600 dark:hover:bg-blue-600"
          >
            Fazer Orçamento
          </Button>
        </div>
      </div>
    </div>
  );
}