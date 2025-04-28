import Link from "next/link";
import { getCategoryName } from "~/app/helpers/getCategoryName";
import { LinkTag } from "~/components/LinkTag";
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

export function formatAuthors(
  bookAuthorRelations: { id: string; author: { id: string; name: string } }[],
): string {
  return bookAuthorRelations.map((relation) => relation.author.name).join(", ");
}

interface BookTableProps {
  books: RouterOutputs["book"]["getAll"];
  onEditBook: (book: RouterOutputs["book"]["getAll"][number]) => void;
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
    onError: (error) => {
      console.error("Failed to delete book:", error);
      window.alert(`Error deleting book: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Title</TableHead>
              <TableHead className="w-[20%]">Author</TableHead>
              <TableHead className="w-[15%]">Series</TableHead>
              <TableHead className="w-[10%]">ISBN</TableHead>
              <TableHead className="w-[10%]">Category</TableHead>
              <TableHead className="w-[15%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                <TableCell className="w-[30%]">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell className="w-[20%]">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell className="w-[15%]">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell className="w-[10%]">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell className="w-[10%]">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                </TableCell>
                <TableCell className="w-[15%] text-right">
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
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Title</TableHead>
            <TableHead className="w-[20%]">Author</TableHead>
            <TableHead className="w-[15%]">Series</TableHead>
            <TableHead className="w-[10%]">ISBN</TableHead>
            <TableHead className="w-[10%]">Category</TableHead>
            <TableHead className="w-[15%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No books found
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="w-[30%]">
                  <Link
                    href={`/books/${book.id}`}
                    className="font-medium hover:underline"
                  >
                    <p className="break-words hyphens-auto whitespace-normal">
                      {book.name}
                    </p>
                  </Link>
                  {book.subtitle && (
                    <p className="text-sm break-words hyphens-auto whitespace-normal text-gray-500">
                      {book.subtitle}
                    </p>
                  )}
                </TableCell>
                <TableCell className="w-[20%]">
                  <div className="flex flex-wrap gap-1 break-words hyphens-auto whitespace-normal">
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
                </TableCell>
                <TableCell className="w-[15%]">
                  {book.series ? (
                    <LinkTag
                      href={`/?seriesId=${book.series.id}`}
                      color="purple"
                    >
                      {book.series.name}
                      {book.seriesNumber !== null && (
                        <span className="ml-1">#{book.seriesNumber}</span>
                      )}
                    </LinkTag>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="w-[10%] truncate">
                  {book.isbn ?? "-"}
                </TableCell>
                <TableCell className="w-[10%]">
                  {book.category ? (
                    <LinkTag
                      href={`/?categoryId=${book.categoryId}`}
                      color="green"
                    >
                      {getCategoryName(book.category)}
                    </LinkTag>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="w-[15%] text-right">
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
