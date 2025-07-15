"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";
import { MovieMetadataSearch } from "./MovieMetadataSearch";
import type { MovieDetail } from "~/lib/movie-metadata/types";
import { createMovieSchema } from "~/schemas/video";
import type { z } from "zod";

interface MovieFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movie?: RouterOutputs["movie"]["getById"];
}

type FormData = z.infer<typeof createMovieSchema>;

export function MovieFormDialog({
  open,
  onOpenChange,
  movie,
}: MovieFormDialogProps) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: categories } = api.category.getByMediaType.useQuery({
    mediaType: "MOVIE",
  });

  const form = useForm<FormData>({
    resolver: zodResolver(createMovieSchema),
    defaultValues: {
      title: movie?.title ?? "",
      originalReleaseYear:
        movie?.originalReleaseYear ?? new Date().getFullYear(),
      plot: movie?.plot ?? "",
      posterUrl: movie?.posterUrl ?? "",
      categoryId: movie?.categoryId ?? undefined,
      tmdbId: movie?.tmdbId ?? "",
      imdbId: movie?.imdbId ?? "",
      watchedAt: movie?.watchedAt
        ? new Date(movie.watchedAt as unknown as string)
        : undefined,
    },
  });

  const downloadPosterMutation =
    api.movieMetadata.downloadTmdbPoster.useMutation();

  const createMutation = api.movie.create.useMutation({
    onSuccess: async () => {
      toast.success("Movie created successfully");
      await utils.movie.getAll.invalidate();
      router.refresh();
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = api.movie.update.useMutation({
    onSuccess: async () => {
      toast.success("Movie updated successfully");
      await utils.movie.getAll.invalidate();
      if (movie?.id) {
        await utils.movie.getById.invalidate({ id: movie.id });
      }
      router.refresh();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Reset form when movie changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        title: movie?.title ?? "",
        originalReleaseYear:
          movie?.originalReleaseYear ?? new Date().getFullYear(),
        plot: movie?.plot ?? "",
        posterUrl: movie?.posterUrl ?? "",
        categoryId: movie?.categoryId ?? undefined,
        tmdbId: movie?.tmdbId ?? "",
        imdbId: movie?.imdbId ?? "",
        watchedAt: movie?.watchedAt
          ? new Date(movie.watchedAt as unknown as string)
          : undefined,
      });
    }
  }, [open, movie, form]);

  const handleMovieMetadataSelect = async (movieData: MovieDetail) => {
    form.setValue("title", movieData.title);
    form.setValue("originalReleaseYear", movieData.releaseYear);
    form.setValue("plot", movieData.overview);
    form.setValue("tmdbId", movieData.tmdbId);
    form.setValue("imdbId", movieData.imdbId ?? "");

    // If there's a poster path from TMDB, download and upload it to MinIO
    if (movieData.posterPath) {
      try {
        toast.loading("Downloading movie poster...", { id: "poster-download" });

        const result = await downloadPosterMutation.mutateAsync({
          posterPath: movieData.posterPath,
        });

        if (result.success && result.posterUrl) {
          form.setValue("posterUrl", result.posterUrl);
          toast.success("Movie metadata and poster imported successfully", {
            id: "poster-download",
          });
        } else {
          form.setValue("posterUrl", movieData.posterUrl ?? "");
          toast.success("Movie metadata imported (poster download failed)", {
            id: "poster-download",
          });
        }
      } catch (error) {
        console.error("Error downloading poster:", error);
        form.setValue("posterUrl", movieData.posterUrl ?? "");
        toast.success("Movie metadata imported (poster download failed)", {
          id: "poster-download",
        });
      }
    } else {
      form.setValue("posterUrl", movieData.posterUrl ?? "");
      toast.success("Movie metadata imported successfully");
    }
  };

  const onSubmit = (data: FormData) => {
    const movieData = {
      ...data,
      categoryId:
        data.categoryId === "____no_category" ? undefined : data.categoryId,
    };

    if (movie?.id) {
      updateMutation.mutate({ id: movie.id, ...movieData });
    } else {
      createMutation.mutate(movieData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{movie ? "Edit Movie" : "Add Movie"}</DialogTitle>
          <DialogDescription>
            {movie
              ? "Update the movie information"
              : "Add a new movie to your collection"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter movie title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                    <div className="mt-8">
                      <MovieMetadataSearch
                        onMovieSelect={handleMovieMetadataSelect}
                        title={field.value}
                        buttonLabel="Import"
                      />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="originalReleaseYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Year *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 2023"
                      min="1800"
                      max={new Date().getFullYear() + 5}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || "")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="____no_category">
                        No category
                      </SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="posterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poster URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/poster.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter plot summary (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="watchedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Watched Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tmdbId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TMDB ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imdbId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMDB ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. tt1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
