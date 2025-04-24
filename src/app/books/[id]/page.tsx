"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { BookForm } from "~/components/books/BookForm";
import { BookCover } from "~/components/books/BookCover";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const { data: book, isLoading } = api.book.getById.useQuery({
    id: params.id,
  });

  // Fetch authors and series for the edit form
  const { data: authors = [] } = api.author.getAll.useQuery();
  const { data: series = [] } = api.series.getAll.useQuery();

  const deleteMutation = api.book.delete.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-64 flex-col items-center justify-center">
          <h2 className="mb-4 text-xl font-semibold">Book not found</h2>
          <Button onClick={() => router.push("/")}>Back to Books</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
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

      {isEditing ? (
        <div className="mb-6">
          <BookForm
            initialData={book}
            authors={authors}
            series={series}
            onSuccess={() => {
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-200">
              <BookCover
                book={book}
                priority
                showDetails={true}
                isDetail={true}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{book.name}</CardTitle>
                {book.subtitle && (
                  <p className="text-gray-500">{book.subtitle}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">Author</h3>
                  <p>
                    {book.bookAuthors.map((ba) => ba.author.name).join(", ")}
                  </p>
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
          </div>
        </div>
      )}
    </div>
  );
}
