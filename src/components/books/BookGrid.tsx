import React, { useState } from "react";
import Link from "next/link";
import { type Book } from "~/schemas/book";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { api, type RouterOutputs } from "~/trpc/react";
import { BookCover } from "./BookCover";
import { BookFormDialog } from "./BookFormDialog";
import { getCategoryName } from "~/app/helpers/getCategoryName";

interface BookGridProps {
  books: RouterOutputs["book"]["getAll"];
  onEditBook: (book: Book) => void;
  isLoading?: boolean;
  authors?: { id: string; name: string }[];
  series?: { id: string; name: string }[];
}

export function BookGrid({
  books,
  onEditBook,
  isLoading = false,
  authors = [],
  series = [],
}: Readonly<BookGridProps>) {
  const utils = api.useUtils();
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const deleteMutation = api.book.delete.useMutation({
    onSuccess: () => {
      void utils.book.getAll.invalidate();
    },
  });

  const categoriesData = api.category.getMultiplePaths.useQuery(
    {
      ids: books.map((book) => book.categoryId).filter(Boolean) as string[],
    },
    {
      enabled: books.length > 0 && books.some((book) => !!book.categoryId),
    },
  );

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    onEditBook(book);
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
  };

  const handleEditSuccess = () => {
    setEditingBook(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from<number>({ length: 8 }).map((_, index) => (
          <Card
            key={`loading-card-${index}`}
            className="flex h-full flex-col overflow-hidden"
          >
            <div className="bg-muted relative h-64 animate-pulse"></div>
            <CardHeader className="pb-0">
              <div className="bg-muted h-6 w-3/4 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="flex-grow-0 pb-0">
              <div className="bg-muted h-4 w-1/2 animate-pulse rounded"></div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="bg-muted h-8 w-16 animate-pulse rounded"></div>
              <div className="bg-muted h-8 w-16 animate-pulse rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {books.length === 0 ? (
          <div className="text-muted-foreground col-span-full py-10 text-center">
            No books found
          </div>
        ) : (
          books.map((book) => (
            <Card
              key={book.id}
              className="flex h-full flex-col overflow-hidden"
            >
              <Link href={`/books/${book.id}`} className="flex-grow">
                <div className="bg-muted/30 relative flex h-64 items-center justify-center">
                  <BookCover book={book} />
                </div>
                <CardHeader className="pb-0">
                  <h3 className="mt-1 line-clamp-2 font-semibold hover:underline">
                    {book.name}
                  </h3>
                  {book.subtitle && (
                    <p className="text-muted-foreground line-clamp-1 text-sm">
                      {book.subtitle}
                    </p>
                  )}
                </CardHeader>
              </Link>
              <CardContent className="flex-grow-0 pb-0">
                <div className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {book.bookAuthors.map((bookAuthor) => (
                      <Link
                        key={bookAuthor.id}
                        href={`/?authorId=${bookAuthor.author.id}`}
                        className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {bookAuthor.author.name}
                        {bookAuthor.tag && (
                          <span className="ml-1 opacity-75">
                            ({bookAuthor.tag})
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {book.series && (
                    <div>
                      <Link
                        href={`/?seriesId=${book.series.id}`}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {book.series.name}
                        {book.seriesNumber !== null && (
                          <span className="ml-1">#{book.seriesNumber}</span>
                        )}
                      </Link>
                    </div>
                  )}

                  {book.categoryId &&
                    categoriesData.data?.[book.categoryId] && (
                      <div>
                        <Link
                          href={`/?categoryId=${book.categoryId}`}
                          className="bg-accent text-accent-foreground hover:bg-accent/80 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getCategoryName(
                            categoriesData.data,
                            book.categoryId,
                          )}
                        </Link>
                      </div>
                    )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBook(book)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this book?",
                      )
                    ) {
                      deleteMutation.mutate({ id: book.id });
                    }
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Edit Form Dialog */}
      <BookFormDialog
        isOpen={!!editingBook}
        onClose={handleCancelEdit}
        initialData={editingBook ?? undefined}
        authors={authors}
        series={series}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
