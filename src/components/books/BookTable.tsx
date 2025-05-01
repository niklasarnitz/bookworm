"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  Edit,
  MoreVertical,
  Trash,
  BookOpen,
  BookX,
  Check,
  Copy,
} from "lucide-react";
import { useHandleEditBook } from "~/stores/booksPageStore/helpers/useHandleEditBook";
import { useRouter } from "next/navigation";

export function formatAuthors(
  bookAuthorRelations: { id: string; author: { id: string; name: string } }[],
): string {
  return bookAuthorRelations.map((relation) => relation.author.name).join(", ");
}

interface BookTableProps {
  books: RouterOutputs["book"]["getAll"]["books"];
}

const BookTableInternal = ({ books }: Readonly<BookTableProps>) => {
  const router = useRouter();
  const [bookToDelete, setBookToDelete] = useState<
    RouterOutputs["book"]["getAll"]["books"][number] | null
  >(null);

  const utils = api.useUtils();
  const deleteMutation = api.book.delete.useMutation({
    onSuccess: async () => {
      router.refresh();
      await utils.book.getAll.invalidate();
      toast.success("Book deleted successfully");
      setBookToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting book: ${error.message}`);
      setBookToDelete(null);
    },
  });

  const toggleReadStatusMutation = api.book.toggleReadStatus.useMutation({
    onSuccess: async () => {
      router.refresh();
      await utils.book.getAll.invalidate();
      toast.success("Read status updated");
    },
    onError: (error) => {
      toast.error(`Error updating read status: ${error.message}`);
    },
  });

  const onEditBook = useHandleEditBook();

  const handleToggleReadStatus = (
    book: RouterOutputs["book"]["getAll"]["books"][number],
  ) => {
    toggleReadStatusMutation.mutate({ id: book.id });
  };

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
                    <div className="flex items-center">
                      <Link
                        href={`/books/${book.id}`}
                        className="font-medium hover:underline"
                      >
                        <p className="break-words hyphens-auto whitespace-normal">
                          {book.name}
                        </p>
                      </Link>
                      {book.readDate && (
                        <div className="ml-2 rounded-full bg-green-500 p-[2px] text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {book.readDate ? (
                          <DropdownMenuItem
                            onClick={() => handleToggleReadStatus(book)}
                          >
                            <BookX className="mr-2 h-4 w-4" />
                            <span>Mark as Unread</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleToggleReadStatus(book)}
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Mark as Read</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              `${book.name} by ${formatAuthors(book.bookAuthors)}`,
                            );
                            toast.success("Book data copied to clipboard");
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Copy Book Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditBook(book)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setBookToDelete(book)}
                          className="text-red-600 focus:bg-red-50 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
};

export function BookTableSkeleton() {
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

export const BookTable = BookTableInternal;
