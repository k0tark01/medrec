"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

export function Pagination({ currentPage, totalItems, onPageChange, pageSize = PAGE_SIZE }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <span className="text-xs text-muted-foreground">
        {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => (
            <span key={p}>
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="px-1 text-muted-foreground text-xs">…</span>
              )}
              <Button
                variant={p === currentPage ? "default" : "outline"}
                size="sm"
                className="w-8 h-8"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            </span>
          ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    paginate: (page: number) => items.slice((page - 1) * pageSize, page * pageSize),
    totalItems,
    totalPages,
    pageSize,
  };
}

export { PAGE_SIZE };
