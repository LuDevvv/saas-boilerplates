"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Inbox,
} from "lucide-react";
import React, { useState } from "react";

import { Button } from "./Button.js";
import { SearchInput } from "./SearchInput.js";
import { Skeleton } from "./Skeleton.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table.js";
import { cn } from "../../utils.js";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder = "Buscar...",
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>): React.JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* 1. Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SearchInput
          value={globalFilter ?? ""}
          onChange={setGlobalFilter}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          {/* Slot for additional actions */}
        </div>
      </div>

      {/* 2. Table Container */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-[var(--surface)] shadow-sm shadow-black/5 transition-all duration-500">
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-[var(--canvas)] border-b border-border-subtle">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            header.column.getCanSort() && "cursor-pointer select-none hover:text-[#004080] dark:hover:text-[#00E6E6] transition-colors"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border-subtle">
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "group transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/[0.02] active:bg-gray-100/50 dark:active:bg-white/[0.04] border-b border-border-subtle",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-72 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                      <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-border-subtle p-6">
                        <Inbox className="h-10 w-10 opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-heading text-fg text-[14px]">Sin resultados</p>
                        <p className="text-xs font-label text-fg-secondary">No encontramos registros que coincidan con tu búsqueda.</p>                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 3. Pagination */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border-subtle bg-[var(--canvas)]">
          <div className="hidden sm:block text-[11px] font-label uppercase  text-fg-secondary">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>

          <div className="flex items-center gap-8 ml-auto">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(table.getPageCount(), 5) }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    table.getState().pagination.pageIndex === i
                      ? "w-8 bg-primary dark:bg-secondary"
                      : "w-2 bg-gray-200 dark:bg-white/10"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-10 w-10 border border-border-subtle"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-10 w-10 border border-border-subtle"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
