"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Tv, Plus, Eye, Check, Disc } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Pagination } from "~/components/ui/pagination";
import type { RouterOutputs } from "~/trpc/react";
import { TvShowFormDialog } from "~/components/tvShows/TvShowFormDialog";

interface TvShowGridProps {
  tvShows: RouterOutputs["tvShow"]["getAll"]["tvShows"];
  total: number;
  currentPage: number;
  totalPages: number;
}

export function TvShowGrid({
  tvShows,
  total,
  currentPage,
  totalPages,
}: TvShowGridProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {tvShows.length} of {total} TV shows
        </p>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add TV Show
        </Button>
      </div>

      {tvShows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tv className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No TV shows found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first TV show to the collection.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add TV Show
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tvShows.map((tvShow) => {
              const totalSeasons = tvShow.seasons.length;
              const watchedSeasons = tvShow.seasons.filter(
                (season) => season.watchedAt,
              ).length;
              const ownedReleasesCount = tvShow.seasons.reduce(
                (total, season) => total + season.releases.length,
                0,
              );

              return (
                <Link key={tvShow.id} href={`/tv-shows/${tvShow.id}`}>
                  <Card className="hover:bg-muted/50 overflow-hidden transition-colors">
                    <CardHeader className="p-0">
                      <div className="bg-muted relative aspect-[2/3]">
                        {tvShow.posterUrl ? (
                          <Image
                            src={tvShow.posterUrl}
                            alt={tvShow.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Tv className="text-muted-foreground h-12 w-12" />
                          </div>
                        )}

                        {/* Watched indicator */}
                        {watchedSeasons === totalSeasons &&
                          totalSeasons > 0 && (
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

                        {/* Season count */}
                        {totalSeasons > 0 && (
                          <div className="absolute right-2 bottom-2 rounded-full bg-purple-500 px-2 py-1 text-xs text-white shadow-md">
                            {totalSeasons} seasons
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold">
                        {tvShow.title}
                      </h3>

                      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {tvShow.originalReleaseYear}
                      </div>

                      {watchedSeasons > 0 && (
                        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                          <Eye className="h-4 w-4" />
                          {watchedSeasons} of {totalSeasons} seasons watched
                        </div>
                      )}

                      {tvShow.category && (
                        <Badge variant="secondary" className="mb-2">
                          {tvShow.category.name}
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

      <TvShowFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
