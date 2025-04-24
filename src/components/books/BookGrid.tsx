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
import { formatAuthors } from "./BookTable";
import { BookCover } from "./BookCover";

interface BookGridProps {
  books: RouterOutputs["book"]["getAll"];
  onEditBook: (book: Book) => void;
  isLoading?: boolean;
}

export function BookGrid({
  books,
  onEditBook,
  isLoading = false,
}: Readonly<BookGridProps>) {
  const utils = api.useUtils();
  const deleteMutation = api.book.delete.useMutation({
    onSuccess: () => {
      void utils.book.getAll.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from<number>({ length: 8 }).map((_, index) => (
          <Card
            key={`loading-card-${index}`}
            className="flex h-full flex-col overflow-hidden"
          >
            <div className="relative h-64 animate-pulse bg-gray-200"></div>
            <CardHeader className="pb-0">
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent className="flex-grow-0 pb-0">
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {books.length === 0 ? (
        <div className="col-span-full py-10 text-center">No books found</div>
      ) : (
        books.map((book) => (
          <Card key={book.id} className="flex h-full flex-col overflow-hidden">
            <Link href={`/books/${book.id}`} className="flex-grow">
              <div className="relative flex h-64 items-center justify-center bg-gray-100">
                <BookCover book={book} />
              </div>
              <CardHeader className="pb-0">
                <h3 className="mt-1 line-clamp-2 font-semibold hover:underline">
                  {book.name}
                </h3>
                {book.subtitle && (
                  <p className="line-clamp-1 text-sm text-gray-500">
                    {book.subtitle}
                  </p>
                )}
              </CardHeader>
            </Link>
            <CardContent className="flex-grow-0 pb-0">
              <div className="text-sm">
                <p className="text-gray-700">
                  {formatAuthors(book.bookAuthors)}
                </p>
                {book.series && (
                  <p className="text-gray-500">
                    {book.series.name}
                    {book.seriesNumber !== null && ` #${book.seriesNumber}`}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditBook(book)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this book?")
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
  );
}
