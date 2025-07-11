"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { WishlistItemForm } from "~/components/wishlist/WishlistItemForm";
import { PageHeader } from "~/components/ui/page-header";

export default function NewWishlistItemPage() {
  const router = useRouter();
  const { data: authors, isLoading: isLoadingAuthors } =
    api.author.getAll.useQuery();
  const { data: series, isLoading: isLoadingSeries } =
    api.series.getAll.useQuery();

  const handleSuccess = () => {
    router.push("/wishlist");
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingAuthors || isLoadingSeries) {
    return (
      <div className="container mx-auto p-4">
        <PageHeader title="Add to Wishlist" />
        <div className="flex h-40 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Add to Wishlist">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </PageHeader>

      <div className="mt-6">
        <WishlistItemForm
          authors={authors?.authors ?? []}
          series={series?.series ?? []}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
