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
import { ChevronDown, Plus, Scan, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { BarcodeScanner } from "~/components/books/BarcodeScanner";

interface BooksClientProps {
  initialViewMode: "grid" | "table";
}

export function BooksClient({ initialViewMode }: Readonly<BooksClientProps>) {
  const [viewMode, setViewMode] = useCookieViewMode(initialViewMode);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAmazonSearch, setShowAmazonSearch] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [addBookType, setAddBookType] = useState<"manual" | "isbn" | "barcode">(
    "manual",
  );
  const [scannedIsbn, setScannedIsbn] = useState<string>("");

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

  const handleAddBook = (type: "manual" | "isbn" | "barcode") => {
    setAddBookType(type);
    setScannedIsbn(""); // Reset any previously scanned ISBN

    if (type === "isbn") {
      setIsAddingBook(true);
      setEditingBook(null);
      setShowAmazonSearch(true);
      setShowBarcodeScanner(false);
    } else if (type === "barcode") {
      // Don't open the form dialog immediately for barcode scanning
      setIsAddingBook(false);
      setEditingBook(null);
      setShowAmazonSearch(false);
      setShowBarcodeScanner(true);
    } else {
      setIsAddingBook(true);
      setEditingBook(null);
      setShowAmazonSearch(false);
      setShowBarcodeScanner(false);
    }

    setShowAddMenu(false);
  };

  const handleCloseDialog = () => {
    setIsAddingBook(false);
    setEditingBook(null);
    setShowAmazonSearch(false);
    setShowBarcodeScanner(false);
    setScannedIsbn("");
  };

  const handleBarcodeScanComplete = (isbn: string) => {
    setScannedIsbn(isbn);
    setShowBarcodeScanner(false);
    setIsAddingBook(true); // Now open the form dialog
    setShowAmazonSearch(true);
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

          <Popover open={showAddMenu} onOpenChange={setShowAddMenu}>
            <PopoverTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="mr-1 h-4 w-4" />
                Add Book <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="flex flex-col py-1">
                <button
                  className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleAddBook("manual")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create from Scratch
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleAddBook("isbn")}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Import via ISBN
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleAddBook("barcode")}
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Scan Barcode
                </button>
              </div>
            </PopoverContent>
          </Popover>
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

      {(isAddingBook || !!editingBook) && (
        <BookFormDialog
          isOpen={true}
          onClose={handleCloseDialog}
          initialData={editingBook ?? undefined}
          authors={authors}
          series={series}
          onSuccess={handleCloseDialog}
          title={isAddingBook ? "Add New Book" : "Edit Book"}
          showAmazonSearch={showAmazonSearch}
          setShowAmazonSearch={setShowAmazonSearch}
          addBookType={addBookType}
          scannedIsbn={scannedIsbn}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onScanComplete={handleBarcodeScanComplete}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}
    </>
  );
}
