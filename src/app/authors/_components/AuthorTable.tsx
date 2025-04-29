"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
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
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "~/components/ui/pagination";
import { useDebounce } from "use-debounce";
import { AuthorDialog } from "./AuthorDialog";

type Author = {
  id: string;
  name: string;
  _count?: { books: number };
};

export function AuthorTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce<string>(searchQuery, 500);
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 10;

  const { data, isLoading, refetch } = api.author.getAll.useQuery({
    query: debouncedSearchQuery ?? undefined,
    pagination: {
      page: currentPage,
      pageSize,
    },
  });

  // Prefetch the next page
  api.author.getAll.useQuery(
    {
      query: debouncedSearchQuery ?? undefined,
      pagination: {
        page: (data?.pagination.page ?? 1) + 1,
        pageSize,
      },
    },
    {
      enabled: !!data?.pagination?.hasMore,
      staleTime: 30 * 1000, // Consider data valid for 30 seconds
    },
  );

  const authors = data?.authors ?? [];
  const pagination = data?.pagination;

  const deleteMutation = api.author.delete.useMutation({
    onSuccess: async () => {
      await refetch();
      toast.success("Author deleted successfully");
      setAuthorToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting author: ${error.message}`);
      setAuthorToDelete(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (authorToDelete) {
      deleteMutation.mutate({ id: authorToDelete.id });
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    if (searchQuery) {
      params.set("query", searchQuery);
    } else {
      params.delete("query");
    }

    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    // Reset to page 1 when search changes
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (e.target.value) {
      params.set("query", e.target.value);
    } else {
      params.delete("query");
    }

    router.push(`?${params.toString()}`);
  };

  // Initialize search input from URL params
  useEffect(() => {
    const queryParam = searchParams.get("query");
    if (queryParam && queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [searchParams, searchQuery]);

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
                  <TableRow key={`skeleton-row-${idx}`}>
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
            {pagination?.totalCount ?? 0}{" "}
            {pagination?.totalCount === 1 ? "author" : "authors"} found
          </span>
        </div>
        <div className="flex w-full items-center space-x-2 sm:w-auto">
          <Input
            placeholder="Search authors..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full sm:max-w-[250px]"
          />
        </div>
      </div>

      {authors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border py-10">
          <p className="text-muted-foreground">No authors found</p>
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
                {authors.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell className="font-medium">{author.name}</TableCell>
                    <TableCell>
                      {author._count?.books ? (
                        <Badge variant="outline">
                          {author._count.books}{" "}
                          {author._count.books === 1 ? "book" : "books"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <AuthorDialog author={author} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-100 hover:text-red-700"
                        onClick={() => setAuthorToDelete(author)}
                        disabled={
                          author._count?.books ? author._count.books > 0 : false
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
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <AlertDialog
        open={!!authorToDelete}
        onOpenChange={(open) => !open && setAuthorToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the author{" "}
              <span className="font-semibold">{authorToDelete?.name}</span>.
              {authorToDelete?._count?.books ? (
                <span className="mt-2 block text-red-500">
                  This author has books assigned to them and cannot be deleted.
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
                (authorToDelete?._count?.books ?? 0) > 0
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
