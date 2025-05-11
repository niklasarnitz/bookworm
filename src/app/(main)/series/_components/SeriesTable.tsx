"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import { Trash } from "lucide-react";
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
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Pagination } from "~/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { SeriesDialog } from "./SeriesDialog";
import type { Series } from "~/schemas/series";

export function SeriesTable() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") ?? "",
  );
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 10;

  const { data, isLoading, refetch } = api.series.getAll.useQuery({
    query: searchQuery,
    pagination: {
      page: currentPage,
      pageSize,
    },
  });

  const seriesList = data?.series ?? [];
  const pagination = data?.pagination;

  const deleteMutation = api.series.delete.useMutation({
    onSuccess: async () => {
      await refetch();
      toast.success("Series deleted successfully");
      setSeriesToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting series: ${error.message}`);
      setSeriesToDelete(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (seriesToDelete) {
      deleteMutation.mutate({ id: seriesToDelete.id });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set("query", searchQuery);
    } else {
      params.delete("query");
    }

    // Reset to page 1 when searching
    params.delete("page");

    router.push(`/series?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-full max-w-[250px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Books</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5)
                .fill(0)
                .map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-5 w-full max-w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-[70px]" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <span className="text-muted-foreground text-sm">
            {pagination?.totalCount ?? 0} series found
          </span>
        </div>
        <form
          onSubmit={handleSearch}
          className="flex w-full items-center space-x-2 sm:w-auto"
        >
          <Input
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-[250px]"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      {seriesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border py-10">
          <p className="text-muted-foreground">No series found</p>
          {searchQuery && (
            <p className="text-muted-foreground mt-1 text-sm">
              Try adjusting your search query
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Books</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seriesList.map((series) => (
                  <TableRow key={series.id}>
                    <TableCell className="font-medium">{series.name}</TableCell>
                    <TableCell>
                      {series._count?.books ? (
                        <Badge variant="outline">
                          {series._count.books}{" "}
                          {series._count.books === 1 ? "book" : "books"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <SeriesDialog series={series} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => setSeriesToDelete(series)}
                        disabled={
                          series._count?.books ? series._count.books > 0 : false
                        }
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:inline-block">
                          Delete
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
            />
          )}
        </>
      )}

      <AlertDialog
        open={!!seriesToDelete}
        onOpenChange={(open) => !open && setSeriesToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the series{" "}
              <span className="font-semibold">{seriesToDelete?.name}</span>.
              {seriesToDelete?._count?.books ? (
                <span className="mt-2 block text-red-500">
                  This series has books assigned to it and cannot be deleted.
                  Please reassign or remove the books first.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={
                deleteMutation.isPending ||
                (seriesToDelete?._count?.books ?? 0) > 0
              }
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
