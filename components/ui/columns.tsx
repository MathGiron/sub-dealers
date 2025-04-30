"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/services/shopifyService";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<Product>[] = [
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
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => {
      const price = row.original.specs[0]?.price || "N/A"; // Usar o preço da primeira variante
      return (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <SignedIn>
            <span>{price}</span>
          </SignedIn>
          <SignedOut>
            <span className="blur-sm">R$ XXXX</span>
          </SignedOut>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];