import { Suspense } from "react";
import { api } from "~/trpc/server";
import { Skeleton } from "~/components/ui/skeleton";
import type { MovieSearch as MovieSearchType } from "~/schemas/video";
import { MovieSearch } from "~/components/movies/MovieSearch";
import { MovieFilter } from "~/components/movies/MovieFilter";
import { MovieSort } from "~/components/movies/MovieSort";
import { MovieGrid } from "~/components/movies/MovieGrid";

interface MoviesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): MovieSearchType {
  const query =
    typeof searchParams.query === "string" ? searchParams.query : undefined;
  const categoryId =
    typeof searchParams.categoryId === "string"
      ? searchParams.categoryId
      : undefined;
  const noCategory = searchParams.noCategory === "true";
  const sortBy =
    typeof searchParams.sortBy === "string" &&
    ["title", "originalReleaseYear", "createdAt"].includes(searchParams.sortBy)
      ? (searchParams.sortBy as "title" | "originalReleaseYear" | "createdAt")
      : "title";
  const sortOrder =
    searchParams.sortOrder === "desc" ? ("desc" as const) : ("asc" as const);
  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const pageSize =
    typeof searchParams.pageSize === "string"
      ? parseInt(searchParams.pageSize)
      : 12;

  return {
    query,
    categoryId,
    noCategory,
    sortBy,
    sortOrder,
    pagination: { page, pageSize },
  };
}

async function MoviesContent({
  searchParams,
}: {
  searchParams: MovieSearchType;
}) {
  const [moviesData, categories] = await Promise.all([
    api.movie.getAll(searchParams),
    api.category.getByMediaType({ mediaType: "MOVIE" }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <MovieSearch />
          <MovieFilter categories={categories} />
        </div>
        <MovieSort />
      </div>

      <MovieGrid
        movies={moviesData.movies}
        total={moviesData.total}
        currentPage={moviesData.currentPage}
        totalPages={moviesData.totalPages}
      />
    </div>
  );
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const parsedParams = parseSearchParams(await searchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
        <p className="text-muted-foreground">Manage your movie collection</p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        }
      >
        <MoviesContent searchParams={parsedParams} />
      </Suspense>
    </div>
  );
}
