"use client";

import { useState } from "react";
import { type Book } from "~/schemas/book";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BookGrid } from "~/components/books/BookGrid";
import { BookTable } from "~/components/books/BookTable";
import { BookForm } from "~/components/books/BookForm";
import { useCookieViewMode } from "~/hooks/useCookieViewMode";

interface BooksClientProps {
  initialViewMode: "grid" | "table";
}

export function BooksClient({ initialViewMode }: BooksClientProps) {
  const [viewMode, setViewMode] = useCookieViewMode(initialViewMode);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Fetch books from API
  const { data: books = [], isLoading: isBooksLoading } =
    api.book.getAll.useQuery();

  // Fetch authors and series for dropdowns
  const { data: authors = [] } = api.author.getAll.useQuery();
  const { data: series = [] } = api.series.getAll.useQuery();

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
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

          <Button
            onClick={() => {
              setIsAddingBook(true);
              setEditingBook(null);
            }}
          >
            Add Book
          </Button>
        </div>
      </div>

      {isAddingBook && !editingBook && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Add New Book</h2>
          <BookForm
            authors={authors}
            series={series}
            onSuccess={() => {
              setIsAddingBook(false);
            }}
            onCancel={() => setIsAddingBook(false)}
          />
        </div>
      )}

      {editingBook && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Edit Book</h2>
          <BookForm
            initialData={editingBook}
            authors={authors}
            series={series}
            onSuccess={() => {
              setEditingBook(null);
            }}
            onCancel={() => setEditingBook(null)}
          />
        </div>
      )}

      <div className={`${isAddingBook || editingBook ? "mt-8" : ""}`}>
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
      </div>
    </>
  );
}
