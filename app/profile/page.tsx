"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/datatable/data-table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  TableRow,
  TableCell,
} from "@/components/ui/datatable/table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { OrderProduct } from "@/services/index";

interface Order {
  id: string;
  products: OrderProduct[];
  orderDate: string;
  status: "pending" | "success";
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [draftOrder, setDraftOrder] = useState<OrderProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDraftOrder([]);
      setOrders([]);
      setLoading(false);
      return;
    }

    const draft = (user.unsafeMetadata?.draftOrder || []) as OrderProduct[];
    const completed = (user.unsafeMetadata?.completedOrders || []) as Order[];

    const draftAsOrder: Order[] = draft.length > 0
      ? [{
          id: "draft",
          products: draft,
          orderDate: new Date().toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "pending",
        }]
      : [];

    setDraftOrder(draft);
    setOrders([...draftAsOrder, ...completed]);
    setLoading(false);
  }, [user]);

  const handleContinueOrder = () => {
    const params = draftOrder.map((product) => `products[${product.id}]={"quantity":${product.quantity}}`).join("&");
    router.push(`/order?${params}`);
  };

  const handleClearDraft = async () => {
    if (!user) return;

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          draftOrder: [],
        },
      });
      setDraftOrder([]);
      console.log("Rascunho limpo com sucesso.");
    } catch (err) {
      console.error("Erro ao limpar rascunho:", err);
    }
  };

  const getProductPrice = (product: OrderProduct) => {
    return product.price || 0;
  };

  const calculateItemTotal = (product: OrderProduct) => {
    const price = getProductPrice(product);
    return price * (product.quantity || 1);
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-white dark:text-white hover:text-blue-400 dark:hover:text-blue-400"
        >
          Pedido
          <ArrowUpDown className="ml-2 h-4 w-4 text-white dark:text-white" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-white dark:text-white">
          {row.getValue("id") === "draft" ? "Rascunho" : row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-white dark:text-white hover:text-blue-400 dark:hover:text-blue-400"
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4 text-white dark:text-white" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-sm text-white">{row.getValue("orderDate")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={row.getValue("status") === "success" ? "bg-green-500" : "bg-yellow-500"}>
          {row.getValue("status") === "success" ? "Concluído" : "Pendente"}
        </Badge>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-white dark:text-white hover:text-blue-400 dark:hover:text-blue-400"
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4 text-white dark:text-white" />
        </Button>
      ),
      cell: ({ row }) => {
        const total = row.original.products.reduce((sum, product) => {
          const price = product.price || 0;
          return sum + price * (product.quantity || 1);
        }, 0);
        return (
          <div className="text-sm text-white dark:text-white">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const totalA = rowA.original.products.reduce((sum, product) => {
          const price = product.price || 0;
          return sum + price * (product.quantity || 1);
        }, 0);
        const totalB = rowB.original.products.reduce((sum, product) => {
          const price = product.price || 0;
          return sum + price * (product.quantity || 1);
        }, 0);
        return totalA - totalB;
      },
    },
    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => {
            setExpandedRows((prev) =>
              prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
            );
          }}
        >
          {expandedRows.includes(row.id) ? (
            <ChevronUp className="h-4 w-4 text-neutral-300" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-300" />
          )}
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (!isLoaded || loading) return <div className="min-h-screen text-white flex items-center justify-center">Carregando...</div>;

  if (!user) return <div className="min-h-screen text-white flex items-center justify-center">Por favor, faça login para ver seu perfil.</div>;

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <div className="mx-auto w-full max-w-4xl p-6 py-40">
        <div className="shadow-input w-full rounded-none bg-black p-4 md:rounded-2xl md:p-8 dark:bg-black border border-gray-300">
          <h1 className="text-xl font-bold text-neutral-200">Meus Pedidos</h1>
          <div className="mt-6">
            <div className="mt-4">
              <DataTable table={table} />
              {table.getRowModel().rows.map((row) => (
                expandedRows.includes(row.id) && (
                  <TableRow key={`${row.id}-expanded`} className="bg-zinc-900">
                    <TableCell colSpan={columns.length}>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-neutral-200">Produtos do Pedido</h3>
                        <ul className="mt-2 space-y-2">
                          {row.original.products.map((product) => (
                            <li key={product.id} className="flex flex-col">
                              <p className="text-sm text-white">{product.name}</p>
                              <p className="text-sm text-neutral-300">Quantidade: <span className="text-white">{product.quantity}</span></p>
                              <p className="text-sm text-neutral-300">Preço Unitário: <span className="text-white">R$ {getProductPrice(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                              <p className="text-sm text-neutral-300">Total: <span className="text-white">R$ {calculateItemTotal(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 text-sm font-medium text-neutral-200">
                          Total do Pedido: R$ {row.original.products.reduce((sum, product) => sum + calculateItemTotal(product), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {row.original.id === "draft" && (
                          <div className="mt-4 flex space-x-4">
                            <Button
                              onClick={handleContinueOrder}
                              className="group/btn relative block h-10 w-1/2 rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                            >
                              Continuar Pedido
                              <BottomGradient />
                            </Button>
                            <Button
                              onClick={handleClearDraft}
                              className="group/btn relative block h-10 w-1/2 rounded-md bg-gradient-to-br from-red-600 to-red-800 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-red-800 dark:from-red-900 dark:to-red-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                            >
                              Limpar Rascunho
                              <BottomGradient />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}