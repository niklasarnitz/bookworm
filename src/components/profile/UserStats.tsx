"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import type { RouterOutputs } from "~/trpc/react";

interface UserStatsProps {
  data:
    | {
        counts?: {
          books: number;
          authors: number;
          series: number;
          categories: number;
        };
        recentBooks: RouterOutputs["userProfile"]["getStats"]["recentBooks"];
        topAuthors: RouterOutputs["userProfile"]["getStats"]["topAuthors"];
      }
    | undefined;
  isLoading: boolean;
  userId: string;
}

export default function UserStats({ data, isLoading, userId }: UserStatsProps) {
  if (isLoading ?? !data) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 w-16" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Recently Added Books</CardTitle>
          <CardDescription>
            The latest books you&apos;ve added to your library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentBooks.length > 0 ? (
              data.recentBooks.map((book) => (
                <div key={book.id} className="flex items-start gap-4">
                  <div>
                    <h4 className="text-base font-semibold">{book.name}</h4>
                    <p className="text-muted-foreground text-sm">
                      {book.bookAuthors.map((ba) => ba.author.name).join(", ")}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Added{" "}
                      {formatDistanceToNow(new Date(book.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No books have been added yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Authors</CardTitle>
          <CardDescription>
            Authors with the most books in your library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topAuthors.length > 0 ? (
              data.topAuthors.map((author) => (
                <div
                  key={author.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{author.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {author._count.books}{" "}
                      {author._count.books === 1 ? "book" : "books"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No authors found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collection Summary</CardTitle>
          <CardDescription>Overview of your library collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Books</span>
              <span className="font-medium">{data.counts?.books ?? 0}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Authors</span>
              <span className="font-medium">{data.counts?.authors ?? 0}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Series</span>
              <span className="font-medium">{data.counts?.series ?? 0}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Categories</span>
              <span className="font-medium">
                {data.counts?.categories ?? 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
