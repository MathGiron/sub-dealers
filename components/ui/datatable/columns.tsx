"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/services/shopifyService";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const columns: ColumnDef<Product & { quantity?: number }>[] = [
  {
    accessorKey: "image",
    header: "Foto",
    cell: ({ row }) => (
      <Image
        src={row.getValue("image")}
        alt={row.original.name}
        width={50}
        height={50}
        className="object-contain"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-white dark:text-white hover:text-blue-400 dark:hover:text-blue-400"
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4 text-white dark:text-white" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-white dark:text-white">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="text-white dark:text-white hover:text-blue-400 dark:hover:text-blue-400"
      >
        Preço
        <ArrowUpDown className="ml-2 h-4 w-4 text-white dark:text-white" />
      </Button>
    ),
    cell: ({ row }) => {
      const priceSpec = row.original.specs[0];
      const price = priceSpec?.price || "Consultar";
      return (
        <div className="text-sm text-white dark:text-white">
          <SignedIn>
            <span>{price}</span>
          </SignedIn>
          <SignedOut>
            <span className="blur-sm">R$ XXXX</span>
          </SignedOut>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const priceA = rowA.original.specs[0]?.price
        ? parseFloat(rowA.original.specs[0].price)
        : Infinity;
      const priceB = rowB.original.specs[0]?.price
        ? parseFloat(rowB.original.specs[0].price)
        : Infinity;
      return priceA - priceB;
    },
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <span className="text-white dark:text-white">Selecionados</span>
      </div>
    ),
    cell: ({ row }) => {
      const [quantity, setQuantity] = useState(row.original.quantity || 1);

      const handleQuantityChange = (value: string) => {
        const newValue = parseInt(value) || 1;
        if (newValue < 1) return;
        setQuantity(newValue);
        row.original.quantity = newValue; // Atualiza a quantidade no objeto original
      };

      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="w-16 bg-black dark:bg-black text-white dark:text-white border-gray-300 dark:border-gray-300"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];