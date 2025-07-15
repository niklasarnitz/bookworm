"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { LinkTag } from "~/components/LinkTag";
import { Card, CardContent } from "~/components/ui/card";
import { BookForm } from "~/components/books/bookForm/BookForm";
import { BookCover } from "~/components/books/BookCover";
import { Quotes } from "~/components/books/Quotes";
import { api } from "~/trpc/react";
import type { Author } from "~/schemas/author";
import type { Series } from "~/schemas/series";
import type { Book } from "~/schemas/book";

interface BookDetailProps {
  book: Book;
  authors: Author[];
  series: Series[];
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
      <BookForm
        initialData={book}
        authors={authors}
        series={series}
        onSuccess={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader title={book.name} description={book.subtitle ?? undefined}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back
          </Button>
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
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="bg-muted relative aspect-[3/4] w-full overflow-hidden rounded-lg">
            <BookCover book={book} priority showDetails isDetail />
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="mb-2 text-base font-semibold">Author</h3>
                <div className="flex flex-wrap gap-1">
                  {book.bookAuthors.map((bookAuthor) => (
                    <LinkTag
                      key={bookAuthor.id}
                      href={`/?authorId=${bookAuthor.author.id}`}
                      color="blue"
                    >
                      {bookAuthor.author.name}
                      {bookAuthor.tag && (
                        <span className="ml-1 opacity-75">
                          ({bookAuthor.tag})
                        </span>
                      )}
                    </LinkTag>
                  ))}
                </div>
              </div>

              {book.series && (
                <div>
                  <h3 className="mb-2 text-base font-semibold">Series</h3>
                  <LinkTag href={`/?seriesId=${book.series.id}`} color="purple">
                    {book.series.name}
                    {book.seriesNumber !== null && (
                      <span className="ml-1">#{book.seriesNumber}</span>
                    )}
                  </LinkTag>
                </div>
              )}

              {book.isbn && (
                <div>
                  <h3 className="mb-2 text-base font-semibold">ISBN</h3>
                  <p className="text-sm">{book.isbn}</p>
                </div>
              )}

              {book.categoryId && categoryPath && categoryPath.length > 0 && (
                <div>
                  <h3 className="mb-2 text-base font-semibold">Category</h3>
                  <div className="flex flex-wrap gap-1">
                    <LinkTag
                      href={`/?categoryId=${book.categoryId}`}
                      color="green"
                    >
                      {categoryPath[categoryPath.length - 1]?.name}
                    </LinkTag>
                  </div>
                </div>
              )}

              {book.publisher && (
                <div>
                  <h3 className="mb-2 text-base font-semibold">Publisher</h3>
                  <p className="text-sm">{book.publisher}</p>
                </div>
              )}

              {book.pages && (
                <div>
                  <h3 className="mb-2 text-base font-semibold">Pages</h3>
                  <p className="text-sm">{book.pages}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Quotes book={book} />
        </div>
      </div>
    </div>
  );
}
