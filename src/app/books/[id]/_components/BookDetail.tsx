"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { BookForm } from "~/components/books/BookForm";
import { BookCover } from "~/components/books/BookCover";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/react";

interface BookDetailProps {
  book: RouterOutputs["book"]["getById"];
  authors: RouterOutputs["author"]["getAll"];
  series: RouterOutputs["series"]["getAll"];
}

export function BookDetail({ book, authors, series }: BookDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const deleteMutation = api.book.delete.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  // Format authors for display
  const formatAuthors = (
    bookAuthors: NonNullable<typeof book>["bookAuthors"],
  ) => {
    return bookAuthors
      .map(({ author, tag }) => (tag ? `${author.name} (${tag})` : author.name))
      .join(", ");
  };

  if (!book) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="mb-6">
        <BookForm
          initialData={book}
          authors={authors}
          series={series}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="mr-2"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">{book.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-200">
            <BookCover book={book} priority showDetails isDetail />
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl">{book.name}</h2>
              {book.subtitle && (
                <p className="text-gray-500">{book.subtitle}</p>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Author</h3>
                <p>{formatAuthors(book.bookAuthors)}</p>
              </div>

              {book.series && (
                <div>
                  <h3 className="font-semibold">Series</h3>
                  <p>
                    {book.series.name}
                    {book.seriesNumber !== null && ` #${book.seriesNumber}`}
                  </p>
                </div>
              )}

              {book.isbn && (
                <div>
                  <h3 className="font-semibold">ISBN</h3>
                  <p>{book.isbn}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>

              <Button
                variant="destructive"
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
        </div>
      </div>
    </>
  );
}
