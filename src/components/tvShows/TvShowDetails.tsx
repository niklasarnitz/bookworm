"use client";

import { useState } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import {
  Calendar,
  Tv,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Disc,
} from "lucide-react";
import { TvShowFormDialog } from "./TvShowFormDialog";
import { TvSeasonFormDialog } from "./TvSeasonFormDialog";
import { TvSeasonReleaseFormDialog } from "./TvSeasonReleaseFormDialog";
import { TvShowSkeleton } from "./TvShowSkeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TvShowDetailsProps {
  tvShowId: string;
}

export function TvShowDetails({ tvShowId }: TvShowDetailsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const [selectedSeasonTitle, setSelectedSeasonTitle] = useState<string>("");
  const utils = api.useUtils();

  const { data: tvShow, isLoading } = api.tvShow.getById.useQuery({
    id: tvShowId,
  });

  const deleteMutation = api.tvShow.delete.useMutation({
    onSuccess: () => {
      toast.success("TV show deleted successfully");
      router.push("/tv-shows");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleSeasonWatchedMutation = api.tvSeason.toggleWatched.useMutation({
    onSuccess: () => {
      void utils.tvShow.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <TvShowSkeleton />;
  }

  if (!tvShow) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Tv className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">TV Show not found</h3>
          <p className="text-muted-foreground">
            The TV show you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to view it.
          </p>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this TV show? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate({ id: tvShowId });
    }
  };

  const handleToggleSeasonWatched = (seasonId: string, watchedAt?: Date) => {
    toggleSeasonWatchedMutation.mutate({
      id: seasonId,
      watchedAt: watchedAt ? undefined : new Date(),
    });
  };

  const handleOpenReleaseDialog = (seasonId: string, seasonTitle: string) => {
    setSelectedSeasonId(seasonId);
    setSelectedSeasonTitle(seasonTitle);
    setIsReleaseDialogOpen(true);
  };

  const watchedSeasons = tvShow.seasons.filter(
    (season) => season.watchedAt,
  ).length;
  const totalSeasons = tvShow.seasons.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        {/* Poster */}
        <div className="bg-muted relative aspect-[2/3] w-48 flex-shrink-0 overflow-hidden rounded-lg">
          {tvShow.posterUrl ? (
            <Image
              src={tvShow.posterUrl}
              alt={tvShow.title}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Tv className="text-muted-foreground h-12 w-12" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{tvShow.title}</h1>
              <div className="text-muted-foreground mt-2 flex items-center gap-4 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {tvShow.originalReleaseYear}
                </div>
                {totalSeasons > 0 && (
                  <div className="flex items-center gap-2">
                    <Tv className="h-5 w-5" />
                    {totalSeasons} seasons
                  </div>
                )}
                {watchedSeasons > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {watchedSeasons} of {totalSeasons} watched
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {tvShow.category && (
            <Badge variant="secondary">{tvShow.category.name}</Badge>
          )}

          {tvShow.plot && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Plot</h3>
              <p className="text-muted-foreground leading-relaxed">
                {tvShow.plot}
              </p>
            </div>
          )}

          <div className="text-muted-foreground flex gap-4 text-sm">
            {tvShow.tmdbId && <span>TMDB: {tvShow.tmdbId}</span>}
            {tvShow.imdbId && <span>IMDB: {tvShow.imdbId}</span>}
          </div>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="seasons" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
          </TabsList>
          <Button onClick={() => setIsSeasonDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Season
          </Button>
        </div>

        <TabsContent value="seasons" className="space-y-4">
          {tvShow.seasons.length === 0 ? (
            <div className="py-12 text-center">
              <Tv className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No seasons found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding the first season.
              </p>
              <Button
                onClick={() => setIsSeasonDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Season
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tvShow.seasons.map((season) => (
                <Card
                  key={season.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        Season {season.seasonNumber}
                        {season.title && `: ${season.title}`}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleSeasonWatched(
                            season.id,
                            season.watchedAt
                              ? new Date(season.watchedAt)
                              : undefined,
                          )
                        }
                        className="h-8 w-8 p-0"
                      >
                        {season.watchedAt ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {season.releaseYear && (
                      <div className="text-muted-foreground text-sm">
                        Released: {season.releaseYear}
                      </div>
                    )}
                    {season.episodeCount && (
                      <div className="text-muted-foreground text-sm">
                        Episodes: {season.episodeCount}
                      </div>
                    )}
                    {season.releases.length > 0 && (
                      <div className="text-muted-foreground text-sm">
                        Physical releases: {season.releases.length}
                      </div>
                    )}
                    {season.watchedAt && (
                      <div className="text-sm text-green-600">
                        Watched:{" "}
                        {new Date(season.watchedAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleOpenReleaseDialog(
                            season.id,
                            `Season ${season.seasonNumber}${season.title ? `: ${season.title}` : ""}`,
                          )
                        }
                        className="w-full gap-2"
                      >
                        <Disc className="h-4 w-4" />
                        Add Physical Release
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TvShowFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tvShow={tvShow}
      />

      <TvSeasonFormDialog
        open={isSeasonDialogOpen}
        onOpenChange={setIsSeasonDialogOpen}
        tvShowId={tvShowId}
      />

      <TvSeasonReleaseFormDialog
        open={isReleaseDialogOpen}
        onOpenChange={setIsReleaseDialogOpen}
        tvSeasonId={selectedSeasonId}
        seasonTitle={selectedSeasonTitle}
      />
    </div>
  );
}
