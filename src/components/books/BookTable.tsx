import Link from "next/link";
import { type Book } from "~/schemas/book";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api, type RouterOutputs } from "~/trpc/react";

// Helper function to format all authors with commas
export function formatAuthors(
  bookAuthorRelations: { id: string; author: { id: string; name: string } }[],
): string {
  return bookAuthorRelations.map((relation) => relation.author.name).join(", ");
}

interface BookTableProps {
  books: RouterOutputs["book"]["getAll"];
  onEditBook: (book: Book) => void;
  isLoading?: boolean;
}

export function BookTable({
  books,
  onEditBook,
  isLoading = false,
}: Readonly<BookTableProps>) {
  const utils = api.useUtils();
  const deleteMutation = api.book.delete.useMutation({
    onSuccess: () => {
      void utils.book.getAll.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Series</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No books found
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <div>
                    <Link
                      href={`/books/${book.id}`}
                      className="font-medium hover:underline"
                    >
                      {book.name}
                    </Link>
                    {book.subtitle && (
                      <p className="text-sm text-gray-500">{book.subtitle}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatAuthors(book.bookAuthors)}</TableCell>
                <TableCell>
                  {book.series ? (
                    <span>
                      {book.series.name}
                      {book.seriesNumber !== null && ` #${book.seriesNumber}`}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{book.isbn ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
