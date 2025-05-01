"use client";

import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  className,
}: Readonly<PaginationProps>) {
  const searchParams = useSearchParams();

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Function to generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Always show first page
    pageNumbers.push(1);

    // Show ellipsis if needed
    if (currentPage > 3) {
      pageNumbers.push(-1); // -1 represents ellipsis
    }

    // Show current page and adjacent pages
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i >= 2 && i <= totalPages - 1) {
        pageNumbers.push(i);
      }
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      pageNumbers.push(-2); // -2 represents ellipsis to the right
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("mx-auto flex w-full justify-center py-8", className)}
    >
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href={{
              query: {
                ...Object.fromEntries(searchParams.entries()),
                page: currentPage === 1 ? undefined : currentPage - 1,
              },
            }}
            prefetch={true}
          >
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </li>

        {pageNumbers.map((pageNum, index) => (
          <li key={`page-${index}`}>
            {pageNum === -1 || pageNum === -2 ? (
              <span className="text-muted-foreground flex h-9 w-9 items-center justify-center text-sm">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Link
                href={{
                  query: {
                    ...Object.fromEntries(searchParams.entries()),
                    page: pageNum === 1 ? undefined : pageNum,
                  },
                }}
              >
                <Button
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  aria-current={currentPage === pageNum ? "page" : undefined}
                  aria-label={`Page ${pageNum}`}
                >
                  <span>{pageNum}</span>
                </Button>
              </Link>
            )}
          </li>
        ))}

        <li>
          <Link
            href={{
              query: {
                ...Object.fromEntries(searchParams.entries()),
                page: currentPage === totalPages ? undefined : currentPage + 1,
              },
            }}
            prefetch={true}
          >
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
