import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import { Edit, Trash } from "lucide-react";

export function formatAuthors(
  bookAuthorRelations: { id: string; author: { id: string; name: string } }[],
): string {
  return bookAuthorRelations.map((relation) => relation.author.name).join(", ");
}

interface BookTableProps {
  books: RouterOutputs["book"]["getAll"]["books"];
  onEditBook: (book: RouterOutputs["book"]["getAll"]["books"][number]) => void;
  isLoading?: boolean;
}

export function BookTable({
  books,
  onEditBook,
  isLoading = false,
}: Readonly<BookTableProps>) {
  const [bookToDelete, setBookToDelete] = useState<
    RouterOutputs["book"]["getAll"]["books"][number] | null
  >(null);

  const utils = api.useUtils();
  const deleteMutation = api.book.delete.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      toast.success("Book deleted successfully");
      setBookToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting book: ${error.message}`);
      setBookToDelete(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-md border">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-full max-w-[250px]" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <p className="text-muted-foreground py-6">No books found</p>
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell className="truncate">{book.isbn ?? "-"}</TableCell>
                  <TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditBook(book)}
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => setBookToDelete(book)}
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!bookToDelete}
        onOpenChange={(open) => !open && setBookToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book{" "}
              <span className="font-semibold">{bookToDelete?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (bookToDelete) {
                  deleteMutation.mutate({ id: bookToDelete.id });
                }
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
