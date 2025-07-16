"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { createTvSeasonReleaseSchema } from "~/schemas/tvShow";
import { useRouter } from "next/navigation";
import type { z } from "zod";

type TvSeasonReleaseFormData = z.infer<typeof createTvSeasonReleaseSchema>;

interface TvSeasonReleaseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tvSeasonId: string;
  seasonTitle: string;
  release?: {
    id: string;
    editionName?: string | null;
    releaseDate?: Date | null;
    countryOfRelease?: string | null;
    upc?: string | null;
    publisherNumber?: string | null;
    asin?: string | null;
    distributor?: string | null;
    publisher?: string | null;
  } | null;
}

export function TvSeasonReleaseFormDialog({
  open,
  onOpenChange,
  tvSeasonId,
  seasonTitle,
  release,
}: TvSeasonReleaseFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();

  const form = useForm<TvSeasonReleaseFormData>({
    resolver: zodResolver(createTvSeasonReleaseSchema),
    defaultValues: {
      tvSeasonId,
      editionName: release?.editionName ?? "",
      releaseDate: release?.releaseDate ?? undefined,
      countryOfRelease: release?.countryOfRelease ?? "",
      upc: release?.upc ?? "",
      publisherNumber: release?.publisherNumber ?? "",
      asin: release?.asin ?? "",
      distributor: release?.distributor ?? "",
      publisher: release?.publisher ?? "",
    },
  });

  // Reset form when release data changes
  useEffect(() => {
    if (open) {
      form.reset({
        tvSeasonId,
        editionName: release?.editionName ?? "",
        releaseDate: release?.releaseDate ?? undefined,
        countryOfRelease: release?.countryOfRelease ?? "",
        upc: release?.upc ?? "",
        publisherNumber: release?.publisherNumber ?? "",
        asin: release?.asin ?? "",
        distributor: release?.distributor ?? "",
        publisher: release?.publisher ?? "",
      });
    }
  }, [open, release, form, tvSeasonId]);

  const createMutation = api.tvSeasonRelease.create.useMutation({
    onSuccess: async () => {
      toast.success("Season release created successfully");
      form.reset();
      onOpenChange(false);
      // Invalidate and refetch TV show data
      await utils.tvShow.getById.invalidate();
      await utils.tvShow.getAll.invalidate();
      // Refresh the page to show updated data
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const updateMutation = api.tvSeasonRelease.update.useMutation({
    onSuccess: async () => {
      toast.success("Season release updated successfully");
      form.reset();
      onOpenChange(false);
      // Invalidate and refetch TV show data
      await utils.tvShow.getById.invalidate();
      await utils.tvShow.getAll.invalidate();
      // Refresh the page to show updated data
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: TvSeasonReleaseFormData) => {
    setIsSubmitting(true);
    try {
      // Helper function to convert empty strings to undefined
      const emptyToUndefined = (value: string | undefined) => {
        const trimmed = value?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : undefined;
      };

      // Convert empty strings to undefined for optional fields
      // This is especially important for unique fields like upc and asin
      const cleanedData = {
        ...data,
        editionName: emptyToUndefined(data.editionName),
        countryOfRelease: emptyToUndefined(data.countryOfRelease),
        upc: emptyToUndefined(data.upc),
        publisherNumber: emptyToUndefined(data.publisherNumber),
        asin: emptyToUndefined(data.asin),
        distributor: emptyToUndefined(data.distributor),
        publisher: emptyToUndefined(data.publisher),
      };

      if (release) {
        // Edit mode
        await updateMutation.mutateAsync({
          id: release.id,
          ...cleanedData,
        });
      } else {
        // Create mode
        await createMutation.mutateAsync(cleanedData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {release ? "Edit Season Release" : "Add Season Release"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {release
              ? `Edit the release "${release.editionName ?? "Standard Edition"}" for "${seasonTitle}"`
              : `Add a new release or edition for "${seasonTitle}"`}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="editionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edition Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Complete Series, Special Edition"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Release Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : undefined;
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="distributor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distributor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Universal Pictures"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Warner Bros." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="countryOfRelease"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of Release</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., United States, United Kingdom"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="upc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPC</FormLabel>
                    <FormControl>
                      <Input placeholder="Universal Product Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publisherNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Internal publisher code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ASIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Amazon Standard ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? release
                    ? "Updating..."
                    : "Creating..."
                  : release
                    ? "Update Release"
                    : "Create Release"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
