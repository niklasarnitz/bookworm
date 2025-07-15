"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Folder } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import Image from "next/image";
import { cn } from "~/lib/utils";
import type { Book } from "~/schemas/book";

export function CategoryBooksList() {
  const router = useRouter();
  const { data: categoryTree, isLoading: loadingCategories } =
    api.category.getTree.useQuery();
  const { data: booksData, isLoading: loadingBooks } = api.book.getAll.useQuery(
    { pagination: { page: 1, pageSize: 999 } },
  );

  // State to hold expanded accordion items
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Set all categories as expanded by default when data loads
  useEffect(() => {
    if (categoryTree) {
      // Collect all category IDs in a flat array
      const getAllCategoryIds = (categories: typeof categoryTree): string[] => {
        return categories.reduce((ids: string[], category) => {
          ids.push(category.id);
          if (category.children && category.children.length > 0) {
            ids = [...ids, ...getAllCategoryIds(category.children)];
          }
          return ids;
        }, []);
      };

      setExpandedItems(getAllCategoryIds(categoryTree));
    }
  }, [categoryTree]);

  if (loadingCategories || loadingBooks) {
    return <LoadingState />;
  }

  if (!categoryTree || !booksData) {
    return <div className="py-4">Failed to load categories and books.</div>;
  }

  // Flat map of all books by category ID
  const booksByCategory = booksData.books.reduce(
    (acc, book) => {
      const categoryId = book.categoryId;
      if (categoryId) {
        acc[categoryId] ??= [];
        acc[categoryId].push(book);
      }
      return acc;
    },
    {} as Record<string, typeof booksData.books>,
  );

  // Books with no category assigned
  const uncategorizedBooks = booksData.books.filter((book) => !book.categoryId);

  // Recursive function to render category tree with books
  const renderCategory = (category: (typeof categoryTree)[0]) => {
    const books = booksByCategory[category.id] ?? [];

    return (
      <AccordionItem value={category.id} key={category.id} className="border-b">
        <AccordionTrigger className="py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Folder className="text-muted-foreground h-4 w-4" />
            <span className="font-medium">{category.name}</span>
            <div className="ml-2 flex gap-2">
              {books.length > 0 && (
                <Badge variant="outline">
                  {books.length} {books.length === 1 ? "book" : "books"}
                </Badge>
              )}
              {category.totalBookCount !== undefined &&
                category.totalBookCount !== books.length &&
                category.totalBookCount > 0 && (
                  <Badge variant="secondary">
                    {category.totalBookCount} total
                  </Badge>
                )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pl-6">
            {/* Books in this category */}
            {books.length > 0 && (
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={() => router.push(`/books/${book.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Child categories */}
            {category.children && category.children.length > 0 && (
              <Accordion
                type="multiple"
                className="mb-4"
                value={category.children.map((child) => child.id)}
              >
                {category.children.map((child) => renderCategory(child))}
              </Accordion>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div>
      <ScrollArea className="h-full">
        {/* Display categories and their books */}
        <Accordion
          type="multiple"
          className="mb-6"
          value={expandedItems}
          onValueChange={setExpandedItems}
        >
          {categoryTree.map((category) => renderCategory(category))}
        </Accordion>

        {/* Display uncategorized books */}
        {uncategorizedBooks.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Uncategorized Books</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uncategorizedBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => router.push(`/books/${book.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Book card component for displaying a single book
function BookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  const authors = book.bookAuthors?.map((ba) => ba.author.name).join(", ");

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="bg-muted relative aspect-[2/3]">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center">
            No Cover
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="line-clamp-1 text-sm font-medium" title={book.name}>
          {book.name}
        </h3>
        {authors && (
          <p
            className="text-muted-foreground line-clamp-1 text-xs"
            title={authors}
          >
            {authors}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Loading state UI
function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="ml-2 h-5 w-16" />
          </div>
          <div className="grid grid-cols-1 gap-4 py-2 pl-6 md:grid-cols-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-2">
                <Skeleton className={cn("h-32 w-full")} />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
