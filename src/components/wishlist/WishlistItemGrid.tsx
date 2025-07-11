"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type RouterOutputs } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
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
import { Button } from "~/components/ui/button";
import { BookCover } from "~/components/books/BookCover";
import { LinkTag } from "~/components/LinkTag";
import { Edit, MoreVertical, Trash, Copy, ArrowRight } from "lucide-react";

type WishlistItem =
  RouterOutputs["wishlist"]["getAll"]["wishlistItems"][number];

interface WishlistItemGridProps {
  wishlistItems: WishlistItem[];
}

export function formatAuthors(
  itemAuthorRelations: { id: string; author: { id: string; name: string } }[],
): string {
  return itemAuthorRelations.map((relation) => relation.author.name).join(", ");
}

export function WishlistItemGrid({ wishlistItems }: WishlistItemGridProps) {
  const utils = api.useUtils();
  const router = useRouter();
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);
  const [itemToMove, setItemToMove] = useState<WishlistItem | null>(null);

  const deleteMutation = api.wishlist.delete.useMutation({
    onSuccess: async () => {
      await utils.wishlist.getAll.invalidate();
      router.refresh();
      toast.success("Item deleted successfully");
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting item: ${error.message}`);
      setItemToDelete(null);
    },
  });

  const moveToBooksMutation = api.wishlist.moveToBooks.useMutation({
    onSuccess: async (newBook) => {
      await utils.wishlist.getAll.invalidate();
      await utils.book.getAll.invalidate();
      router.refresh();
      toast.success("Moved to your book collection");
      setItemToMove(null);
      router.push(`/books/${newBook.id}`);
    },
    onError: (error) => {
      toast.error(`Error moving item to books: ${error.message}`);
      setItemToMove(null);
    },
  });

  const handleEditItem = (item: WishlistItem) => {
    router.push(`/wishlist/${item.id}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlistItems.length === 0 ? (
          <div className="text-muted-foreground col-span-full py-10 text-center">
            No wishlist items found
          </div>
        ) : (
          wishlistItems.map((item) => (
            <Card
              key={item.id}
              className="flex h-full flex-col overflow-hidden"
            >
              <Link href={`/wishlist/${item.id}`} className="flex-grow">
                <div className="bg-muted/30 relative flex h-64 items-center justify-center">
                  <div className="h-full w-full">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={`Cover of ${item.name}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-center">
                          <p className="text-muted-foreground text-sm">
                            No cover
                          </p>
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-0">
                  <h3 className="mt-1 line-clamp-2 font-semibold hover:underline">
                    {item.name}
                  </h3>
                  {item.subtitle && (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {item.subtitle}
                    </p>
                  )}
                </CardHeader>
              </Link>
              <CardContent className="mt-auto">
                <p className="text-muted-foreground line-clamp-1 text-sm">
                  {formatAuthors(item.wishlistItemAuthors)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.series && (
                    <LinkTag
                      href={`/wishlist?seriesId=${item.seriesId}`}
                      color="blue"
                    >
                      {item.series.name}
                      {item.seriesNumber && (
                        <span className="ml-1">#{item.seriesNumber}</span>
                      )}
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
                      <DropdownMenuItem onClick={() => setItemToMove(item)}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span>Move to Books</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `${item.name} by ${formatAuthors(item.wishlistItemAuthors)}`,
                          );
                          toast.success("Item data copied to clipboard");
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy Data</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditItem(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setItemToDelete(item)}
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
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the wishlist item{" "}
              <span className="font-semibold">{itemToDelete?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  deleteMutation.mutate({ id: itemToDelete.id });
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

      {/* Move to books confirmation dialog */}
      <AlertDialog
        open={!!itemToMove}
        onOpenChange={(open) => !open && setItemToMove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Books?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move{" "}
              <span className="font-semibold">{itemToMove?.name}</span> from
              your wishlist to your book collection with today's date. The item
              will be removed from your wishlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToMove) {
                  moveToBooksMutation.mutate({ id: itemToMove.id });
                }
              }}
              disabled={moveToBooksMutation.isPending}
            >
              {moveToBooksMutation.isPending ? "Moving..." : "Move to Books"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
