"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type Book, type BookSearch } from "~/schemas/book";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BookGrid } from "~/components/books/BookGrid";
import { BookTable } from "~/components/books/BookTable";
import { BookFormDialog } from "~/components/books/BookFormDialog";
import { BookFilter } from "~/components/books/BookFilter";
import { useCookieViewMode } from "~/hooks/useCookieViewMode";

interface BooksClientProps {
  initialViewMode: "grid" | "table";
}

export function BooksClient({ initialViewMode }: Readonly<BooksClientProps>) {
  const [viewMode, setViewMode] = useCookieViewMode(initialViewMode);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const searchParams = useSearchParams();

  // Build filter object from search params
  const filters: BookSearch = {
    query: searchParams.get("query") ?? undefined,
    authorId: searchParams.get("authorId") ?? undefined,
    seriesId: searchParams.get("seriesId") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    noCover: searchParams.has("noCover") ? true : undefined,
    noCategory: searchParams.has("noCategory") ? true : undefined,
  };

  // Fetch books from API with filters
  const {
    data: books = [],
    isLoading: isBooksLoading,
    refetch,
  } = api.book.getAll.useQuery(filters, {});

  // Fetch authors and series for dropdowns
  const { data: authors = [] } = api.author.getAll.useQuery();
  const { data: series = [] } = api.series.getAll.useQuery();

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

      {/* Add Book Filter component */}
      <BookFilter />

      {viewMode === "grid" ? (
        <BookGrid
          books={books}
          onEditBook={handleEditBook}
          isLoading={isBooksLoading}
          authors={authors}
          series={series}
        />
      ) : (
        <BookTable
          books={books}
          onEditBook={handleEditBook}
          isLoading={isBooksLoading}
        />
      )}

      {/* Dialog for adding new books */}
      <BookFormDialog
        isOpen={isAddingBook}
        onClose={handleCloseDialog}
        authors={authors}
        series={series}
        onSuccess={handleFormSuccess}
        title="Add New Book"
      />

      {/* Dialog for editing books in table view */}
      {viewMode === "table" && (
        <BookFormDialog
          isOpen={!!editingBook}
          onClose={handleCloseDialog}
          initialData={editingBook ?? undefined}
          authors={authors}
          series={series}
          onSuccess={handleFormSuccess}
          title="Edit Book"
        />
      )}
    </>
  );
}
