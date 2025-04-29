"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Book, type BookSearch } from "~/schemas/book";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BookGrid } from "~/components/books/BookGrid";
import { BookTable } from "~/components/books/BookTable";
import { BookFormDialog } from "~/components/books/BookFormDialog";
import { BookFilter } from "~/components/books/BookFilter";
import { useCookieViewMode } from "~/hooks/useCookieViewMode";
import { Pagination } from "~/components/ui/pagination";

interface BooksClientProps {
  initialViewMode: "grid" | "table";
}

export function BooksClient({ initialViewMode }: Readonly<BooksClientProps>) {
  const [viewMode, setViewMode] = useCookieViewMode(initialViewMode);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = viewMode === "grid" ? 12 : 10;

  const filters: BookSearch = {
    query: searchParams.get("query") ?? undefined,
    authorId: searchParams.get("authorId") ?? undefined,
    seriesId: searchParams.get("seriesId") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    noCover: searchParams.has("noCover") ? true : undefined,
    noCategory: searchParams.has("noCategory") ? true : undefined,
    pagination: {
      page: currentPage,
      pageSize,
    },
  };

  const {
    data,
    isLoading: isBooksLoading,
    refetch,
  } = api.book.getAll.useQuery(filters, {});

  const books = data?.books ?? [];
  const pagination = data?.pagination;

  // Prefetch the next page
  const nextPage = currentPage + 1;
  api.book.getAll.useQuery(
    {
      ...filters,
      pagination: {
        page: nextPage,
        pageSize,
      },
    },
    {
      enabled: !!data?.pagination?.hasMore,
      staleTime: 30 * 1000, // Consider data valid for 30 seconds
    },
  );

  const { data: authors } = api.author.getAll.useQuery();
  const { data: series } = api.series.getAll.useQuery();

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsAddingBook(false);
  };

  const handleAddBook = () => {
    setIsAddingBook(true);
    setEditingBook(null);
  };

  const handleCloseDialog = () => {
    setIsAddingBook(false);
    setEditingBook(null);
  };

  const handleFormSuccess = () => {
    setIsAddingBook(false);
    setEditingBook(null);
  };

  useEffect(() => {
    // Refetch books when filters change
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-bold sm:mb-0">Books</h1>

        <div className="flex items-center gap-4">
          <Tabs
            value={viewMode}
            onValueChange={setViewMode as (value: string) => void}
            className="w-32"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={handleAddBook}>Add Book</Button>
        </div>
      </div>

      <BookFilter />

      {viewMode === "grid" ? (
        <BookGrid
          books={books}
          onEditBook={handleEditBook}
          isLoading={isBooksLoading}
        />
      ) : (
        <BookTable
          books={books}
          onEditBook={handleEditBook}
          isLoading={isBooksLoading}
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <BookFormDialog
        isOpen={isAddingBook || !!editingBook}
        onClose={handleCloseDialog}
        initialData={editingBook ?? undefined}
        authors={authors}
        series={series}
        onSuccess={handleFormSuccess}
        title={isAddingBook ? "Add New Book" : "Edit Book"}
      />
    </>
  );
}
