"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/datatable/table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { OrderProduct } from "@/services/index";

interface Order {
  id: string;
  products: OrderProduct[];
  orderDate: string;
  status: "pending" | "success";
  total?: number;
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
  const [sorting, setSorting] = useState<SortingState>([]);
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
    if ('variantPrice' in product && product.variantPrice !== undefined && product.variantPrice !== null) {
      return Number(product.variantPrice);
    }
    if (product.selectedVariant && product.selectedVariant.price !== undefined && product.selectedVariant.price !== null) {
      return Number(product.selectedVariant.price);
    }
    if (product.price !== undefined && product.price !== null) {
      return Number(product.price);
    }
    return 0;
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
          className="text-[var(--card-foreground)] hover:text-[var(--primary)]"
        >
          Pedido
          <ArrowUpDown className="ml-2 h-4 w-4 text-[var(--card-foreground)]" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-[var(--card-foreground)]">
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
          className="text-[var(--card-foreground)] hover:text-[var(--primary)]"
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4 text-[var(--card-foreground)]" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-sm text-[var(--card-foreground)]">{row.getValue("orderDate")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={row.getValue("status") === "success" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--accent)] text-[var(--accent-foreground)]"}>
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
          className="text-[var(--card-foreground)] hover:text-[var(--primary)]"
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4 text-[var(--card-foreground)]" />
        </Button>
      ),
      cell: ({ row }) => {
        const total = typeof row.original.total === 'number'
          ? row.original.total
          : row.original.products.reduce((sum: number, product: OrderProduct) => sum + calculateItemTotal(product), 0);
        return (
          <div className="text-sm text-[var(--card-foreground)]">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const totalA = typeof rowA.original.total === 'number'
          ? rowA.original.total
          : rowA.original.products.reduce((sum: number, product: OrderProduct) => sum + calculateItemTotal(product), 0);
        const totalB = typeof rowB.original.total === 'number'
          ? rowB.original.total
          : rowB.original.products.reduce((sum: number, product: OrderProduct) => sum + calculateItemTotal(product), 0);
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
            <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
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

  const renderExpandedRow = (row: unknown) => {
    const order = row as Order;
    if (!order.products || !Array.isArray(order.products)) {
      return null;
    }
    const total = order.products.reduce((sum: number, product: OrderProduct) => sum + calculateItemTotal(product), 0);
    return (
      <TableRow className="bg-[var(--card)]">
        <TableCell colSpan={columns.length} className="p-0 w-full">
          <div className="p-4 sm:p-6 w-full">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Produtos do Pedido</h3>
            <ul className="mt-2 space-y-2">
              {order.products.map((product: OrderProduct) => (
                <li key={product.id} className="flex flex-col">
                  <p className="text-sm text-[var(--card-foreground)]">{product.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Quantidade: <span className="text-[var(--card-foreground)]">{product.quantity}</span></p>
                  <p className="text-sm text-[var(--muted-foreground)]">Preço Unitário: <span className="text-[var(--card-foreground)]">R$ {getProductPrice(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                  <p className="text-sm text-[var(--muted-foreground)]">Total: <span className="text-[var(--card-foreground)]">R$ {calculateItemTotal(product).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-medium text-[var(--muted-foreground)]">
              Total do Pedido: R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {order.id === "draft" && (
              <div className="mt-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={handleContinueOrder}
                  className="group/btn relative block h-10 w-full sm:w-auto rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                >
                  Continuar Pedido
                  <BottomGradient />
                </Button>
                <Button
                  onClick={handleClearDraft}
                  className="group/btn relative block h-10 w-full sm:w-auto rounded-[var(--radius)] bg-[var(--red-600)] text-[var(--red-foreground)] shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-red-800 dark:from-red-900 dark:to-red-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                >
                  Limpar Rascunho
                  <BottomGradient />
                </Button>
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  if (!isLoaded || loading) return <div className="min-h-screen text-[var(--card-foreground)] flex items-center justify-center">Carregando...</div>;

  if (!user) return <div className="min-h-screen text-[var(--card-foreground)] flex items-center justify-center">Por favor, faça login para ver seu perfil.</div>;

  return (
    <div className="min-h-screen pt-30 text-[var(--card-foreground)]">
      <Navbar />
      <div className="mx-auto w-full max-w-4xl  sm:p-6 "> {/* Restaurando pt-40 */}
        <div className="shadow-input w-full rounded-[var(--radius)] bg-[var(--card)] p-4 sm:p-6 md:rounded-2xl md:p-8 border border-[var(--border)]">
          <h1 className="text-xl font-bold text-[var(--muted-foreground)]">Meus Pedidos</h1>
          <div className="mt-6">
            <div className="mt-4">
              <Table className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-[var(--muted-foreground)]">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow className="hover:bg-[var(--zinc-800)]">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="text-[var(--muted-foreground)]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                      {expandedRows.includes(row.id) && renderExpandedRow(row.original)}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
