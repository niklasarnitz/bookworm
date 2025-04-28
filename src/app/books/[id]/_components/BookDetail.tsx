"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  const { data: categoryPath } = api.category.getPath.useQuery(
    { id: book?.categoryId ?? "" },
    { enabled: !!book?.categoryId },
  );

  const deleteMutation = api.book.delete.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

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
      <div className="flex items-center p-4">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">{book.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3">
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
                <div className="flex flex-wrap gap-1">
                  {book.bookAuthors.map((bookAuthor) => (
                    <Link
                      key={bookAuthor.id}
                      href={`/?authorId=${bookAuthor.author.id}`}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-sm text-blue-700 hover:bg-blue-100"
                    >
                      {bookAuthor.author.name}
                      {bookAuthor.tag && (
                        <span className="ml-1">({bookAuthor.tag})</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {book.series && (
                <div>
                  <h3 className="font-semibold">Series</h3>
                  <Link
                    href={`/?seriesId=${book.series.id}`}
                    className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-sm text-purple-700 hover:bg-purple-100"
                  >
                    {book.series.name}
                    {book.seriesNumber !== null && (
                      <span className="ml-1">#{book.seriesNumber}</span>
                    )}
                  </Link>
                </div>
              )}

              {book.isbn && (
                <div>
                  <h3 className="font-semibold">ISBN</h3>
                  <p>{book.isbn}</p>
                </div>
              )}

              {book.categoryId && categoryPath && categoryPath.length > 0 && (
                <div>
                  <h3 className="font-semibold">Category</h3>
                  <div className="flex flex-wrap gap-1">
                    <Link
                      href={`/?categoryId=${book.categoryId}`}
                      className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-sm text-green-700 hover:bg-green-100"
                    >
                      {categoryPath[categoryPath.length - 1]?.name}
                    </Link>
                  </div>
                </div>
              )}

              {book.publisher && (
                <div>
                  <h3 className="font-semibold">Publisher</h3>
                  <p>{book.publisher}</p>
                </div>
              )}

              {book.pages && (
                <div>
                  <h3 className="font-semibold">Pages</h3>
                  <p>{book.pages}</p>
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
