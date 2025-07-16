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
import { TvShowMetadataSearch } from "./TvShowMetadataSearch";
import type { TvShowDetail } from "~/lib/tv-show-metadata/types";
import { createTvShowSchema } from "~/schemas/tvShow";
import type { z } from "zod";

interface TvShowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tvShow?: RouterOutputs["tvShow"]["getById"];
}

type FormData = z.infer<typeof createTvShowSchema>;

export function TvShowFormDialog({
  open,
  onOpenChange,
  tvShow,
}: TvShowFormDialogProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<FormData>({
    resolver: zodResolver(createTvShowSchema),
    defaultValues: {
      title: "",
      originalReleaseYear: new Date().getFullYear(),
      plot: "",
      posterUrl: "",
      tmdbId: "",
      imdbId: "",
      categoryId: "",
    },
  });

  const { data: categories } = api.category.getByMediaType.useQuery({
    mediaType: "TV_SHOW",
  });

  const createMutation = api.tvShow.create.useMutation({
    onSuccess: () => {
      toast.success("TV show created successfully");
      form.reset();
      onOpenChange(false);
      void utils.tvShow.getAll.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = api.tvShow.update.useMutation({
    onSuccess: () => {
      toast.success("TV show updated successfully");
      onOpenChange(false);
      void utils.tvShow.getAll.invalidate();
      void utils.tvShow.getById.invalidate();
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const downloadPosterMutation =
    api.tvShowMetadata.downloadTmdbPoster.useMutation();

  const handleTvShowMetadataSelect = async (tvShowData: TvShowDetail) => {
    form.setValue("title", tvShowData.name);
    form.setValue("originalReleaseYear", tvShowData.firstAirYear);
    form.setValue("plot", tvShowData.overview);
    form.setValue("tmdbId", tvShowData.tmdbId);
    form.setValue("imdbId", tvShowData.imdbId ?? "");

    // If there's a poster path from TMDB, download and upload it to MinIO
    if (tvShowData.posterPath) {
      try {
        toast.loading("Downloading TV show poster...", {
          id: "poster-download",
        });

        const result = await downloadPosterMutation.mutateAsync({
          posterPath: tvShowData.posterPath,
        });

        if (result.success && result.posterUrl) {
          form.setValue("posterUrl", result.posterUrl);
          toast.success("TV show metadata and poster imported successfully", {
            id: "poster-download",
          });
        } else {
          form.setValue("posterUrl", tvShowData.posterUrl ?? "");
          toast.success("TV show metadata imported (poster download failed)", {
            id: "poster-download",
          });
        }
      } catch (error) {
        console.error("Error downloading poster:", error);
        form.setValue("posterUrl", tvShowData.posterUrl ?? "");
        toast.success("TV show metadata imported (poster download failed)", {
          id: "poster-download",
        });
      }
    } else {
      form.setValue("posterUrl", tvShowData.posterUrl ?? "");
      toast.success("TV show metadata imported successfully");
    }
  };

  useEffect(() => {
    if (tvShow && typeof tvShow === "object" && "title" in tvShow) {
      form.reset({
        title: tvShow.title,
        originalReleaseYear: tvShow.originalReleaseYear,
        plot: tvShow.plot ?? "",
        posterUrl: tvShow.posterUrl ?? "",
        tmdbId: tvShow.tmdbId ?? "",
        imdbId: tvShow.imdbId ?? "",
        categoryId: tvShow.categoryId ?? "____no_category",
      });
    } else {
      form.reset({
        title: "",
        originalReleaseYear: new Date().getFullYear(),
        plot: "",
        posterUrl: "",
        tmdbId: "",
        imdbId: "",
        categoryId: "",
      });
    }
  }, [tvShow, form, open]);

  const onSubmit = (data: FormData) => {
    const tvShowData = {
      ...data,
      categoryId:
        data.categoryId === "____no_category" ? undefined : data.categoryId,
    };

    if (tvShow && typeof tvShow === "object" && "id" in tvShow) {
      updateMutation.mutate({
        id: tvShow.id,
        ...tvShowData,
      });
    } else {
      createMutation.mutate(tvShowData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tvShow ? "Edit TV Show" : "Add TV Show"}</DialogTitle>
          <DialogDescription>
            {tvShow
              ? "Update the TV show information"
              : "Add a new TV show to your collection"}
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
                        <Input placeholder="Enter TV show title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                    <div className="mt-8">
                      <TvShowMetadataSearch
                        onTvShowSelect={handleTvShowMetadataSelect}
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
                {isLoading
                  ? "Saving..."
                  : tvShow
                    ? "Update TV Show"
                    : "Add TV Show"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
