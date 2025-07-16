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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { createTvPhysicalItemSchema } from "~/schemas/tvShow";
import { videoFormatSchema } from "~/schemas/video";
import { useRouter } from "next/navigation";
import type { z } from "zod";

import type { VideoFormat } from "~/schemas/video";

type TvPhysicalItemFormData = z.infer<typeof createTvPhysicalItemSchema>;

interface TvPhysicalItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tvSeasonReleaseId: string;
  releaseTitle: string;
  item?: {
    id: string;
    format: VideoFormat;
    discName?: string | null;
    discNumber?: number | null;
    aspectRatio?: string | null;
    durationMinutes?: number | null;
  } | null;
}

export function TvPhysicalItemFormDialog({
  open,
  onOpenChange,
  tvSeasonReleaseId,
  releaseTitle,
  item,
}: TvPhysicalItemFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();

  const form = useForm<TvPhysicalItemFormData>({
    resolver: zodResolver(createTvPhysicalItemSchema),
    defaultValues: {
      tvSeasonReleaseId,
      format: "DVD",
      discName: item?.discName ?? "",
      discNumber: item?.discNumber ?? undefined,
      aspectRatio: item?.aspectRatio ?? "",
      durationMinutes: item?.durationMinutes ?? undefined,
    },
  });

  // Reset form when item data changes
  useEffect(() => {
    if (open) {
      form.reset({
        tvSeasonReleaseId,
        format: item?.format ?? "DVD",
        discName: item?.discName ?? "",
        discNumber: item?.discNumber ?? undefined,
        aspectRatio: item?.aspectRatio ?? "",
        durationMinutes: item?.durationMinutes ?? undefined,
      });
    }
  }, [open, item, form, tvSeasonReleaseId]);

  const createMutation = api.tvSeasonRelease.addPhysicalItem.useMutation({
    onSuccess: async () => {
      toast.success("Physical item created successfully");
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

  const updateMutation = api.tvSeasonRelease.updatePhysicalItem.useMutation({
    onSuccess: async () => {
      toast.success("Physical item updated successfully");
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

  const onSubmit = async (data: TvPhysicalItemFormData) => {
    setIsSubmitting(true);
    try {
      // Helper function to convert empty strings to undefined
      const emptyToUndefined = (value: string | undefined) => {
        const trimmed = value?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : undefined;
      };

      // Convert empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        discName: emptyToUndefined(data.discName),
        aspectRatio: emptyToUndefined(data.aspectRatio),
      };

      if (item) {
        // Edit mode
        await updateMutation.mutateAsync({
          id: item.id,
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

  const formatOptions = videoFormatSchema.options;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit Physical Item" : "Add Physical Item"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {item
              ? `Edit the physical item "${item.discName ?? item.format}" for "${releaseTitle}"`
              : `Add a new physical item for "${releaseTitle}"`}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formatOptions.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format.replace("_", " ")}
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
                name="discName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disc Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Season 1 Disc 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="discNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disc Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 1"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aspectRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 16:9, 4:3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 480"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : undefined);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  ? item
                    ? "Updating..."
                    : "Creating..."
                  : item
                    ? "Update Item"
                    : "Create Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
