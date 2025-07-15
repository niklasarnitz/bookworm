"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Film,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Disc,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { MovieFormDialog } from "./MovieFormDialog";
import { MediaReleaseFormDialog } from "./MediaReleaseFormDialog";
import { PhysicalItemFormDialog } from "./PhysicalItemFormDialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { RouterOutputs } from "~/trpc/react";

interface MovieDetailsProps {
  movie: RouterOutputs["movie"]["getById"];
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [isPhysicalItemDialogOpen, setIsPhysicalItemDialogOpen] =
    useState(false);
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>("");
  const [selectedReleaseName, setSelectedReleaseName] = useState<string>("");
  const [editingRelease, setEditingRelease] = useState<
    (typeof movie.releases)[0] | null
  >(null);
  const router = useRouter();
  const utils = api.useUtils();

  const deleteMutation = api.movie.delete.useMutation({
    onSuccess: () => {
      toast.success("Movie deleted successfully");
      router.push("/movies");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleWatchedMutation = api.movie.toggleWatched.useMutation({
    onSuccess: async () => {
      toast.success("Movie watched status updated");
      await utils.movie.getById.invalidate({ id: movie.id });
      await utils.movie.getAll.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteReleaseMutation = api.mediaRelease.delete.useMutation({
    onSuccess: async () => {
      toast.success("Release deleted successfully");
      await utils.movie.getById.invalidate({ id: movie.id });
      await utils.movie.getAll.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this movie? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate({ id: movie.id });
    }
  };

  const handleToggleWatched = () => {
    const newWatchedAt = movie.watchedAt ? undefined : new Date();
    toggleWatchedMutation.mutate({
      id: movie.id,
      watchedAt: newWatchedAt,
    });
  };

  const handleOpenReleaseDialog = (release?: (typeof movie.releases)[0]) => {
    setEditingRelease(release ?? null);
    setIsReleaseDialogOpen(true);
  };

  const handleDeleteRelease = (releaseId: string, releaseName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the release "${releaseName}"? This action cannot be undone and will also delete all associated physical items.`,
      )
    ) {
      deleteReleaseMutation.mutate({ id: releaseId });
    }
  };

  const formatVideoFormat = (format: string) => {
    switch (format) {
      case "BLURAY":
        return "Blu-ray";
      case "BLURAY_4K":
        return "4K Blu-ray";
      case "BLURAY_3D":
        return "3D Blu-ray";
      case "LASERDISC":
        return "LaserDisc";
      default:
        return format;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/movies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Movie Details</h1>
      </div>

      {/* Movie Info */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="rounded-lg object-cover object-center"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="text-muted-foreground h-16 w-16" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">{movie.title}</h2>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.originalReleaseYear}</span>
                </div>
                {movie.watchedAt && (
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>
                      Watched on{" "}
                      {new Date(
                        movie.watchedAt as unknown as string,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {movie.category && (
                  <Badge variant="secondary">{movie.category.name}</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={movie.watchedAt ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleWatched}
                  disabled={toggleWatchedMutation.isPending}
                >
                  {movie.watchedAt ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Watched
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Mark as Watched
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {movie.plot && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Plot</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.plot}
                </p>
              </div>
            )}

            {(movie.tmdbId ?? movie.imdbId) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">External Links</h3>
                <div className="flex gap-2">
                  {movie.tmdbId && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        TMDB
                      </a>
                    </Button>
                  )}
                  {movie.imdbId && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={`https://www.imdb.com/title/${movie.imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        IMDb
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Releases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Releases</h3>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => handleOpenReleaseDialog()}
          >
            <Plus className="h-4 w-4" />
            Add Release
          </Button>
        </div>

        {movie.releases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Film className="text-muted-foreground mb-4 h-12 w-12" />
              <h4 className="mb-2 text-lg font-semibold">No releases added</h4>
              <p className="text-muted-foreground mb-4">
                Add different releases and editions of this movie.
              </p>
              <Button
                className="gap-2"
                onClick={() => handleOpenReleaseDialog()}
              >
                <Plus className="h-4 w-4" />
                Add Release
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {movie.releases.map((release) => (
              <Card key={release.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {release.editionName ?? "Standard Edition"}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleOpenReleaseDialog(release)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSelectedReleaseId(release.id);
                          setSelectedReleaseName(
                            release.editionName ?? "Standard Edition",
                          );
                          setIsPhysicalItemDialogOpen(true);
                        }}
                      >
                        <Disc className="h-4 w-4" />
                        Add Item
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleDeleteRelease(
                            release.id,
                            release.editionName ?? "Standard Edition",
                          )
                        }
                        disabled={deleteReleaseMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {release.releaseDate && (
                    <p className="text-muted-foreground text-sm">
                      Released:{" "}
                      {new Date(release.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {(release.distributor ??
                    release.publisher ??
                    release.countryOfRelease) && (
                    <div className="grid gap-2 text-sm">
                      {release.distributor && (
                        <div>
                          <span className="font-medium">Distributor:</span>{" "}
                          {release.distributor}
                        </div>
                      )}
                      {release.publisher && (
                        <div>
                          <span className="font-medium">Publisher:</span>{" "}
                          {release.publisher}
                        </div>
                      )}
                      {release.countryOfRelease && (
                        <div>
                          <span className="font-medium">Country:</span>{" "}
                          {release.countryOfRelease}
                        </div>
                      )}
                    </div>
                  )}

                  {release.items.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium">Physical Items</h5>
                      <div className="grid gap-3">
                        {release.items.map((item) => (
                          <div
                            key={item.id}
                            className="space-y-2 rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {formatVideoFormat(item.format)}
                                {item.discName && ` - ${item.discName}`}
                              </div>
                              <div className="flex items-center gap-2">
                                {item.durationMinutes && (
                                  <span className="text-muted-foreground text-sm">
                                    {Math.floor(item.durationMinutes / 60)}h{" "}
                                    {item.durationMinutes % 60}m
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // For now, we'll just show an alert
                                    alert(
                                      "Physical item editing not yet implemented",
                                    );
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {item.aspectRatio && (
                              <div className="text-muted-foreground text-sm">
                                Aspect Ratio: {item.aspectRatio}
                              </div>
                            )}

                            {item.audioTracks.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">Audio:</span>
                                <div className="ml-2">
                                  {item.audioTracks.map((track) => (
                                    <div key={track.id}>
                                      {track.language} - {track.codec} (
                                      {track.channels})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.subtitles.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">Subtitles:</span>
                                <div className="ml-2">
                                  {item.subtitles.map((subtitle) => (
                                    <span key={subtitle.id} className="mr-2">
                                      {subtitle.language}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <MovieFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        movie={movie}
      />

      {/* Add Release Dialog */}
      <MediaReleaseFormDialog
        open={isReleaseDialogOpen}
        onOpenChange={(open) => {
          setIsReleaseDialogOpen(open);
          if (!open) setEditingRelease(null);
        }}
        movieId={movie.id}
        movieTitle={movie.title}
        release={editingRelease}
      />

      {/* Add Physical Item Dialog */}
      <PhysicalItemFormDialog
        open={isPhysicalItemDialogOpen}
        onOpenChange={(open) => {
          setIsPhysicalItemDialogOpen(open);
          if (!open) {
            setSelectedReleaseId("");
            setSelectedReleaseName("");
          }
        }}
        mediaReleaseId={selectedReleaseId}
        releaseName={selectedReleaseName}
        movieId={movie.id}
      />
    </div>
  );
}
