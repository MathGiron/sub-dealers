import type { DataTableConfig } from "@/types/utils";

export const dataTableConfig: DataTableConfig = {
  operators: ["equals", "contains", "starts with", "ends with", "is empty", "is not empty"],
  filterVariants: ["text", "number", "date", "select"],
  joinOperators: ["and", "or"],
}; 