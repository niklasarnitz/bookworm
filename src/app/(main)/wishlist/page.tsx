"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCreateQueryString } from "~/hooks/useCreateQueryString";
import { useViewMode } from "~/hooks/useViewMode";
import { BookCover } from "~/components/books/BookCover";
import { WishlistItemGrid } from "~/components/wishlist/WishlistItemGrid";
import { WishlistItemTable } from "~/components/wishlist/WishlistItemTable";
import { WishlistFilter } from "~/components/wishlist/WishlistFilter";
import { WishlistSort } from "~/components/wishlist/WishlistSort";
import { WishlistItemAddPopover } from "~/components/wishlist/WishlistItemAddPopover";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { Grid, Table, BookOpen } from "lucide-react";
import { Pagination } from "~/components/ui/pagination";

export default function WishlistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createQueryString = useCreateQueryString(searchParams);
  const [viewMode, setViewMode] = useViewMode();

  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "12");

  const { data, isLoading } = api.wishlist.getAll.useQuery({
    query: searchParams.get("query") ?? undefined,
    authorId: searchParams.get("authorId") ?? undefined,
    seriesId: searchParams.get("seriesId") ?? undefined,
    sortBy: (searchParams.get("sortBy") as any) ?? undefined,
    sortOrder: (searchParams.get("sortOrder") as any) ?? undefined,
    pagination: {
      page,
      pageSize,
    },
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    let count = 0;
    if (searchParams.has("query")) count++;
    if (searchParams.has("authorId")) count++;
    if (searchParams.has("seriesId")) count++;
    setActiveFilterCount(count);
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    router.push(`/wishlist?${createQueryString("page", String(page))}`);
  };

  const handleViewModeToggle = () => {
    const newMode = viewMode === "grid" ? "table" : "grid";
    setViewMode(newMode);
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Wishlist"
        description="Books you want to buy or read in the future"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <WishlistItemAddPopover />
          <Button
            variant="outline"
            size="icon"
            onClick={handleViewModeToggle}
            title={`Switch to ${viewMode === "grid" ? "table" : "grid"} view`}
          >
            {viewMode === "grid" ? <Table size={16} /> : <Grid size={16} />}
          </Button>
        </div>
      </PageHeader>

      <div className="mt-4 mb-6 flex flex-col space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-4">
        <WishlistFilter className="md:w-64" />
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {activeFilterCount > 0 && (
                <span className="text-muted-foreground mr-2 text-sm">
                  {data?.pagination.totalItems ?? 0} results
                </span>
              )}
            </div>
            <WishlistSort className="ml-auto" />
          </div>

          {isLoading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-[350px] space-y-2">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <Skeleton className="h-[500px] w-full" />
            )
          ) : (
            <>
              {viewMode === "grid" ? (
                <WishlistItemGrid wishlistItems={data?.wishlistItems || []} />
              ) : (
                <WishlistItemTable wishlistItems={data?.wishlistItems || []} />
              )}

              {data?.pagination.totalPages && data.pagination.totalPages > 1 ? (
                <Pagination
                  totalPages={data.pagination.totalPages}
                  currentPage={data.pagination.currentPage}
                  onPageChange={handlePageChange}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
