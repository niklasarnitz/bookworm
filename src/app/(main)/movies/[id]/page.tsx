import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Skeleton } from "~/components/ui/skeleton";
import { MovieDetails } from "~/components/movies/MovieDetails";

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function MovieContent({ id }: { id: string }) {
  try {
    const movie = await api.movie.getById({ id });
    return <MovieDetails movie={movie} />;
  } catch {
    notFound();
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-1">
                <Skeleton className="aspect-[2/3] w-full" />
              </div>
              <div className="space-y-4 md:col-span-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        }
      >
        <MovieContent id={id} />
      </Suspense>
    </div>
  );
}
