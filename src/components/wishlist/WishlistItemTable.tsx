"use client";

import { useState } from "react";
import Link from "next/link";
import { api, type RouterOutputs } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatAuthors } from "./WishlistItemGrid";
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
import { Button } from "~/components/ui/button";
import { LinkTag } from "~/components/LinkTag";
import { Edit, MoreVertical, Trash, Copy, ArrowRight } from "lucide-react";

interface WishlistItemTableProps {
  wishlistItems: RouterOutputs["wishlist"]["getAll"]["wishlistItems"];
}

export function WishlistItemTable({ wishlistItems }: WishlistItemTableProps) {
  const router = useRouter();
  const [itemToDelete, setItemToDelete] = useState<
    RouterOutputs["wishlist"]["getAll"]["wishlistItems"][number] | null
  >(null);
  const [itemToMove, setItemToMove] = useState<
    RouterOutputs["wishlist"]["getAll"]["wishlistItems"][number] | null
  >(null);

  const utils = api.useUtils();

  const deleteMutation = api.wishlist.delete.useMutation({
    onSuccess: async () => {
      router.refresh();
      await utils.wishlist.getAll.invalidate();
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

  const handleEditItem = (
    item: RouterOutputs["wishlist"]["getAll"]["wishlistItems"][number],
  ) => {
    router.push(`/wishlist/${item.id}`);
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {wishlistItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <p className="text-muted-foreground py-6">
                    No wishlist items found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              wishlistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Link
                        href={`/wishlist/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        <p className="break-words hyphens-auto whitespace-normal">
                          {item.name}
                        </p>
                      </Link>
                    </div>
                    {item.subtitle && (
                      <p className="text-sm break-words hyphens-auto whitespace-normal text-gray-500">
                        {item.subtitle}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.wishlistItemAuthors.map((relation) => (
                      <LinkTag
                        key={relation.id}
                        href={`/wishlist?authorId=${relation.author.id}`}
                        color="secondary"
                      >
                        {relation.author.name}
                        {relation.tag && (
                          <span className="ml-1 text-xs">({relation.tag})</span>
                        )}
                      </LinkTag>
                    ))}
                  </TableCell>
                  <TableCell>
                    {item.series ? (
                      <LinkTag
                        href={`/wishlist?seriesId=${item.seriesId}`}
                        color="blue"
                      >
                        {item.series.name}
                        {item.seriesNumber && (
                          <span className="ml-1">#{item.seriesNumber}</span>
                        )}
                      </LinkTag>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{item.isbn || "-"}</TableCell>
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
    </div>
  );
}
