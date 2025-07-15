"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Film, Plus, Eye, Check, Disc } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Pagination } from "~/components/ui/pagination";
import type { RouterOutputs } from "~/trpc/react";
import { MovieFormDialog } from "~/components/movies/MovieFormDialog";

interface MovieGridProps {
  movies: RouterOutputs["movie"]["getAll"]["movies"];
  total: number;
  currentPage: number;
  totalPages: number;
}

export function MovieGrid({
  movies,
  total,
  currentPage,
  totalPages,
}: MovieGridProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {movies.length} of {total} movies
        </p>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Movie
        </Button>
      </div>

      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Film className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No movies found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first movie to the collection.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Movie
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => {
              const ownedReleasesCount = movie.releases.length;
              const isWatched = !!movie.watchedAt;

              return (
                <Link key={movie.id} href={`/movies/${movie.id}`}>
                  <Card className="hover:bg-muted/50 overflow-hidden transition-colors">
                    <CardHeader className="p-0">
                      <div className="bg-muted relative aspect-[2/3]">
                        {movie.posterUrl ? (
                          <Image
                            src={movie.posterUrl}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Film className="text-muted-foreground h-12 w-12" />
                          </div>
                        )}

                        {/* Watched indicator */}
                        {isWatched && (
                          <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1 text-white shadow-md">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        {/* Owned releases counter */}
                        {ownedReleasesCount > 0 && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-blue-500 px-2 py-1 text-xs text-white shadow-md">
                            <Disc className="h-3 w-3" />
                            <span>{ownedReleasesCount}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold">
                        {movie.title}
                      </h3>

                      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {movie.originalReleaseYear}
                      </div>

                      {movie.watchedAt && (
                        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                          <Eye className="h-4 w-4" />
                          Watched{" "}
                          {new Date(
                            movie.watchedAt as unknown as string,
                          ).toLocaleDateString()}
                        </div>
                      )}

                      {movie.category && (
                        <Badge variant="secondary" className="mb-2">
                          {movie.category.name}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}

      <MovieFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
