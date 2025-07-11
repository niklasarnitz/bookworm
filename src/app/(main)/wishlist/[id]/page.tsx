"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { WishlistItemForm } from "~/components/wishlist/WishlistItemForm";
import { PageHeader } from "~/components/ui/page-header";
import { formatAuthors } from "~/components/wishlist/WishlistItemGrid";
import { ArrowRight } from "lucide-react";
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

interface WishlistItemDetailPageProps {
  params: {
    id: string;
  };
}

export default function WishlistItemDetailPage({
  params,
}: WishlistItemDetailPageProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  const { data: wishlistItem, isLoading: isLoadingItem } =
    api.wishlist.getById.useQuery({ id: params.id }, { enabled: !!params.id });

  const { data: authors, isLoading: isLoadingAuthors } =
    api.author.getAll.useQuery();
  const { data: series, isLoading: isLoadingSeries } =
    api.series.getAll.useQuery();

  const utils = api.useUtils();

  const moveToBooksMutation = api.wishlist.moveToBooks.useMutation({
    onSuccess: async (newBook) => {
      await utils.wishlist.getAll.invalidate();
      await utils.book.getAll.invalidate();
      router.refresh();
      toast.success("Moved to your book collection");
      router.push(`/books/${newBook.id}`);
    },
    onError: (error) => {
      toast.error(`Error moving item to books: ${error.message}`);
    },
  });

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      router.back();
    }
  };

  const handleMoveToBooks = () => {
    if (!wishlistItem) return;

    moveToBooksMutation.mutate({ id: wishlistItem.id });
    setShowMoveDialog(false);
  };

  if (isLoadingItem || isLoadingAuthors || isLoadingSeries) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader title="Wishlist Item" />
        <div className="flex h-40 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!wishlistItem) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader title="Item Not Found" />
        <div className="mt-6">
          <p>
            The wishlist item you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button className="mt-4" onClick={() => router.push("/wishlist")}>
            Back to Wishlist
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader title="Edit Wishlist Item" />
        <div className="mt-6">
          <WishlistItemForm
            initialData={wishlistItem}
            authors={authors?.authors || []}
            series={series?.series || []}
            onSuccess={handleEditSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title={wishlistItem.name}
        description={wishlistItem.subtitle ?? undefined}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/wishlist")}>
            Back
          </Button>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => setShowMoveDialog(true)}
          >
            <ArrowRight className="h-4 w-4" />
            Move to Books
          </Button>
        </div>
      </PageHeader>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left column - Cover image */}
        <div className="flex justify-center md:justify-start">
          <div className="h-64 w-48 overflow-hidden rounded-md border">
            {wishlistItem.coverUrl ? (
              <img
                src={wishlistItem.coverUrl}
                alt={`Cover of ${wishlistItem.name}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                <span className="text-muted-foreground text-sm">
                  No cover image
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Book details */}
        <div className="space-y-4 md:col-span-2">
          <div>
            <h3 className="text-muted-foreground text-sm font-medium">
              Authors
            </h3>
            <p>{formatAuthors(wishlistItem.wishlistItemAuthors)}</p>
          </div>

          {wishlistItem.series && (
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                Series
              </h3>
              <p>
                {wishlistItem.series.name}
                {wishlistItem.seriesNumber && ` #${wishlistItem.seriesNumber}`}
              </p>
            </div>
          )}

          {wishlistItem.isbn && (
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                ISBN
              </h3>
              <p>{wishlistItem.isbn}</p>
            </div>
          )}

          {wishlistItem.publisher && (
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                Publisher
              </h3>
              <p>{wishlistItem.publisher}</p>
            </div>
          )}

          {wishlistItem.pages && (
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">
                Pages
              </h3>
              <p>{wishlistItem.pages}</p>
            </div>
          )}

          <div>
            <h3 className="text-muted-foreground text-sm font-medium">
              Added on
            </h3>
            <p>{new Date(wishlistItem.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <AlertDialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Books?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move{" "}
              <span className="font-semibold">{wishlistItem.name}</span> from
              your wishlist to your book collection with today's date. The item
              will be removed from your wishlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMoveToBooks}
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
