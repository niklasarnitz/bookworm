"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api, type RouterOutputs } from "~/trpc/react";
import { BookCover } from "./BookCover";
import { getCategoryName } from "~/app/helpers/getCategoryName";
import { LinkTag } from "~/components/LinkTag";
import { toast } from "sonner";
import { Edit, MoreVertical, Trash, BookOpen, BookX, Copy } from "lucide-react";
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
import { useHandleEditBook } from "~/stores/booksPageStore/helpers/useHandleEditBook";
import { useRouter } from "next/navigation";
import { formatAuthors } from "~/components/books/BookTable";

interface BookGridProps {
  books: RouterOutputs["book"]["getAll"]["books"];
}

function BookGrid({ books }: Readonly<BookGridProps>) {
  const utils = api.useUtils();
  const router = useRouter();
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const deleteMutation = api.book.delete.useMutation({
    onSuccess: async () => {
      await utils.book.getAll.invalidate();
      router.refresh();
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
      await utils.book.getAll.invalidate();
      router.refresh();
      toast.success("Read status updated");
    },
    onError: (error) => {
      toast.error(`Error updating read status: ${error.message}`);
    },
  });

  const handleEditBook = useHandleEditBook();

  const handleToggleReadStatus = (book: Book) => {
    toggleReadStatusMutation.mutate({ id: book.id });
  };

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
                    <p className="text-muted-foreground text-sm">
                      {book.subtitle}
                    </p>
                  )}
                </CardHeader>
              </Link>
              <CardContent className="flex-grow-0 pb-0">
                <div className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {book.bookAuthors.map((bookAuthor) => (
                      <LinkTag
                        href={`/?authorId=${bookAuthor.author.id}`}
                        color="blue"
                        key={bookAuthor.id}
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

                  {book.series && (
                    <LinkTag
                      href={`/?seriesId=${book.series.id}`}
                      color="purple"
                    >
                      {book.series.name}
                      {book.seriesNumber !== null && (
                        <span className="ml-1">#{book.seriesNumber}</span>
                      )}
                    </LinkTag>
                  )}

                  {book.category && (
                    <LinkTag
                      href={`/?categoryId=${book.categoryId}`}
                      color="green"
                    >
                      {getCategoryName(book.category)}
                    </LinkTag>
                  )}
                </div>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                      <DropdownMenuItem onClick={() => handleEditBook(book)}>
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
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
    </>
  );
}

export function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from<number>({ length: 8 }).map((_, i) => (
        <Card
          // Using static but unique key for loading cards
          key={`loading-card-${i}`}
          className="flex h-full flex-col overflow-hidden"
        >
          <div className="bg-muted relative h-64 animate-pulse"></div>
          <CardHeader className="pb-0">
            <div className="bg-muted h-6 w-3/4 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent className="flex-grow-0 pb-0">
            <div className="bg-muted h-4 w-1/2 animate-pulse rounded"></div>
          </CardContent>
          <CardFooter className="flex justify-end pt-2">
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export { BookGrid };
