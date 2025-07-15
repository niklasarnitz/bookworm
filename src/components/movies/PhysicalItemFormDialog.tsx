"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { z } from "zod";
import { videoFormatSchema } from "~/schemas/video";
import { useRouter } from "next/navigation";

// Schema for the form that includes audio tracks and subtitles for UI purposes
// But will be split when submitting to backend
const createPhysicalItemWithDetailsSchema = z.object({
  mediaReleaseId: z.string().min(1, "Media release ID is required"),
  format: videoFormatSchema,
  discName: z.string().optional(),
  discNumber: z.number().int().positive().optional(),
  aspectRatio: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  audioTracks: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
      codec: z.string().min(1, "Codec is required"),
      channels: z.string().min(1, "Channels is required"),
    }),
  ),
  subtitles: z.array(
    z.object({
      language: z.string().min(1, "Language is required"),
    }),
  ),
});

type PhysicalItemFormData = z.infer<typeof createPhysicalItemWithDetailsSchema>;

interface PhysicalItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaReleaseId: string;
  releaseName: string;
  movieId: string;
  physicalItem?: {
    id: string;
    format: string;
    discName?: string | null;
    discNumber?: number | null;
    aspectRatio?: string | null;
    durationMinutes?: number | null;
    audioTracks?: Array<{
      id: string;
      language: string;
      codec: string;
      channels: string;
    }>;
    subtitles?: Array<{
      id: string;
      language: string;
    }>;
  } | null;
}

const videoFormatLabels = {
  DVD: "DVD",
  BLURAY: "Blu-ray",
  BLURAY_4K: "4K Blu-ray",
  BLURAY_3D: "3D Blu-ray",
  LASERDISC: "LaserDisc",
  VHS: "VHS",
  VCD: "VCD",
} as const;

export function PhysicalItemFormDialog({
  open,
  onOpenChange,
  mediaReleaseId,
  releaseName,
  movieId,
  physicalItem,
}: PhysicalItemFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();

  const form = useForm<PhysicalItemFormData>({
    resolver: zodResolver(createPhysicalItemWithDetailsSchema),
    defaultValues: {
      mediaReleaseId,
      format:
        (physicalItem?.format as
          | "DVD"
          | "BLURAY"
          | "BLURAY_4K"
          | "BLURAY_3D"
          | "LASERDISC"
          | "VHS"
          | "VCD") ?? "DVD",
      discName: physicalItem?.discName ?? "",
      discNumber: physicalItem?.discNumber ?? undefined,
      aspectRatio: physicalItem?.aspectRatio ?? "",
      durationMinutes: physicalItem?.durationMinutes ?? undefined,
      audioTracks:
        physicalItem?.audioTracks?.map((track) => ({
          language: track.language,
          codec: track.codec,
          channels: track.channels,
        })) ?? [],
      subtitles:
        physicalItem?.subtitles?.map((subtitle) => ({
          language: subtitle.language,
        })) ?? [],
    },
  });

  // Reset form when mediaReleaseId changes
  useEffect(() => {
    console.log(
      "PhysicalItemFormDialog: mediaReleaseId changed:",
      mediaReleaseId,
    );
    if (mediaReleaseId) {
      form.reset({
        mediaReleaseId,
        format:
          (physicalItem?.format as
            | "DVD"
            | "BLURAY"
            | "BLURAY_4K"
            | "BLURAY_3D"
            | "LASERDISC"
            | "VHS"
            | "VCD") ?? "DVD",
        discName: physicalItem?.discName ?? "",
        discNumber: physicalItem?.discNumber ?? undefined,
        aspectRatio: physicalItem?.aspectRatio ?? "",
        durationMinutes: physicalItem?.durationMinutes ?? undefined,
        audioTracks:
          physicalItem?.audioTracks?.map((track) => ({
            language: track.language,
            codec: track.codec,
            channels: track.channels,
          })) ?? [],
        subtitles:
          physicalItem?.subtitles?.map((subtitle) => ({
            language: subtitle.language,
          })) ?? [],
      });
    }
  }, [mediaReleaseId, physicalItem, form]);

  const {
    fields: audioFields,
    append: appendAudio,
    remove: removeAudio,
  } = useFieldArray({
    control: form.control,
    name: "audioTracks",
  });

  const {
    fields: subtitleFields,
    append: appendSubtitle,
    remove: removeSubtitle,
  } = useFieldArray({
    control: form.control,
    name: "subtitles",
  });

  const addPhysicalItemMutation =
    api.mediaRelease.addPhysicalItem.useMutation();
  const addAudioTrackMutation = api.mediaRelease.addAudioTrack.useMutation();
  const addSubtitleMutation = api.mediaRelease.addSubtitle.useMutation();

  const onSubmit = async (data: PhysicalItemFormData) => {
    setIsSubmitting(true);
    console.log("Submitting physical item form:", data);
    console.log("Form validation errors:", form.formState.errors);
    console.log("Current form values:", form.getValues());

    try {
      // Clean up the data - remove audioTracks and subtitles for the physical item creation
      // Also filter out empty strings and convert them to undefined
      const cleanedData = {
        mediaReleaseId: data.mediaReleaseId,
        format: data.format,
        discName:
          data.discName && data.discName.trim() !== ""
            ? data.discName.trim()
            : undefined,
        discNumber: data.discNumber,
        aspectRatio:
          data.aspectRatio && data.aspectRatio.trim() !== ""
            ? data.aspectRatio.trim()
            : undefined,
        durationMinutes: data.durationMinutes,
      };

      console.log("Creating physical item with data:", cleanedData);
      // Create the physical item first
      const physicalItem =
        await addPhysicalItemMutation.mutateAsync(cleanedData);
      console.log("Physical item created:", physicalItem);

      // Add audio tracks if any
      if (data.audioTracks && data.audioTracks.length > 0) {
        console.log("Adding audio tracks:", data.audioTracks);
        for (const audioTrack of data.audioTracks) {
          if (audioTrack.language && audioTrack.codec && audioTrack.channels) {
            const track = await addAudioTrackMutation.mutateAsync({
              physicalItemId: physicalItem.id,
              ...audioTrack,
            });
            console.log("Audio track added:", track);
          }
        }
      }

      // Add subtitles if any
      if (data.subtitles && data.subtitles.length > 0) {
        console.log("Adding subtitles:", data.subtitles);
        for (const subtitle of data.subtitles) {
          if (subtitle.language) {
            const sub = await addSubtitleMutation.mutateAsync({
              physicalItemId: physicalItem.id,
              ...subtitle,
            });
            console.log("Subtitle added:", sub);
          }
        }
      }

      toast.success("Physical item created successfully");
      form.reset();
      onOpenChange(false);
      // Invalidate the movie data to refresh the releases
      await utils.movie.getAll.invalidate();
      await utils.movie.getById.invalidate({ id: movieId });
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error creating physical item:", error);
      toast.error("Failed to create physical item");
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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {physicalItem ? "Edit Physical Item" : "Add Physical Item"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {physicalItem
              ? `Edit the physical item for "${releaseName}".`
              : `Add a physical disc or media item to "${releaseName}". Audio tracks and subtitles are optional and can be added later.`}
          </p>
        </DialogHeader>

        <Form {...form}>
          {}
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => console.error(e))}
            className="space-y-6"
          >
            {/* Basic Item Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(videoFormatLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
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
                          <Input
                            placeholder="e.g., Main Feature, Bonus Disc"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="discNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disc Number</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
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
                          <Input placeholder="e.g., 16:9, 2.35:1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio Tracks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Audio Tracks (Optional)
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendAudio({ language: "", codec: "", channels: "" })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Track
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {audioFields.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No audio tracks added. You can skip this section or add
                    audio track details for this disc.
                  </p>
                ) : (
                  audioFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid items-end gap-4 md:grid-cols-4"
                    >
                      <FormField
                        control={form.control}
                        name={`audioTracks.${index}.language`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl>
                              <Input placeholder="English" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`audioTracks.${index}.codec`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codec</FormLabel>
                            <FormControl>
                              <Input placeholder="DTS-HD" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`audioTracks.${index}.channels`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channels</FormLabel>
                            <FormControl>
                              <Input placeholder="5.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAudio(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Subtitles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Subtitles (Optional)
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendSubtitle({ language: "" })}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Subtitle
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subtitleFields.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No subtitles added. You can skip this section or add
                    subtitle languages for this disc.
                  </p>
                ) : (
                  subtitleFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid items-end gap-4 md:grid-cols-2"
                    >
                      <FormField
                        control={form.control}
                        name={`subtitles.${index}.language`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl>
                              <Input placeholder="English" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSubtitle(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Physical Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
