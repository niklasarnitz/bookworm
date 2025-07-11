"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SubmitErrorHandler } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { AuthorSearch } from "~/components/books/AuthorSearch";
import { SeriesSearch } from "~/components/books/SeriesSearch";
import { ImageUploader } from "~/components/books/ImageUploader";
import { X, Plus } from "lucide-react";
import { useWishlistItemForm } from "~/components/wishlist/useWishlistItemForm";
import { useWishlistItemFormSubmit } from "./useWishlistItemFormSubmit";
import type { WishlistItemCreate } from "~/schemas/wishlist";
import type { Author } from "~/schemas/author";
import type { Series } from "~/schemas/series";
import type { RouterOutputs } from "~/trpc/react";

type WishlistItem = RouterOutputs["wishlist"]["getById"];

interface WishlistItemFormProps {
  initialData?: WishlistItem;
  authors: Author[];
  series: Series[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WishlistItemForm({
  initialData,
  authors,
  series,
  onSuccess,
  onCancel,
}: Readonly<WishlistItemFormProps>) {
  const [showNewAuthorInputs, setShowNewAuthorInputs] = useState<
    Record<number, boolean>
  >({});
  const [showNewSeriesInput, setShowNewSeriesInput] = useState(false);

  const {
    form,
    appendAuthor,
    authors: authorFields,
    removeAuthor,
  } = useWishlistItemForm({
    initialData,
  });

  const { onSubmit, isPending } = useWishlistItemFormSubmit(
    initialData,
    form,
    onSuccess,
  );

  const onInvalid: SubmitErrorHandler<WishlistItemCreate> = useCallback(
    (errors) => {
      console.error("Form validation errors:", errors);
      const firstError = Object.values(errors)[0];
      const errorMessage =
        firstError?.message ?? "Please check the form for errors";
      toast.error(errorMessage);
    },
    [],
  );

  const toggleNewAuthorInput = useCallback(
    (index: number) => {
      setShowNewAuthorInputs((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));

      if (!showNewAuthorInputs[index]) {
        // Switching to "Create New" - clear authorId
        form.setValue(`bookAuthors.${index}.authorId`, undefined);
      } else {
        // Switching to "Select Existing" - clear authorName
        form.setValue(`bookAuthors.${index}.authorName`, undefined);
      }
    },
    [form, showNewAuthorInputs],
  );

  const toggleNewSeriesInput = useCallback(() => {
    setShowNewSeriesInput(!showNewSeriesInput);

    if (showNewSeriesInput) {
      // Switching to "Select Existing" - clear newSeriesName
      form.setValue("newSeriesName", undefined);
    } else {
      // Switching to "Create New" - clear seriesId
      form.setValue("seriesId", null);
    }
  }, [form, showNewSeriesInput]);

  const handleCoverImageUpload = (url: string) => {
    form.setValue("coverUrl", url);
  };

  const handleRemoveCover = () => {
    form.setValue("coverUrl", null);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Book title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Book subtitle (optional)"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <FormLabel className="text-sm font-medium">Authors</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendAuthor({ authorId: "", tag: "" })}
                className="h-7 px-2"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Author
              </Button>
            </div>

            <div className="space-y-3">
              {authorFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-wrap items-start space-y-2 md:flex-nowrap md:space-y-0 md:space-x-2"
                >
                  <div className="w-full md:w-3/4">
                    {showNewAuthorInputs[index] ? (
                      <FormField
                        control={form.control}
                        name={`bookAuthors.${index}.authorName`}
                        render={({ field: authorNameField }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="New author name"
                                  {...authorNameField}
                                  value={authorNameField.value ?? ""}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleNewAuthorInput(index)}
                                  className="absolute top-1/2 right-1 h-6 -translate-y-1/2 px-2 text-xs"
                                >
                                  Select existing
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name={`bookAuthors.${index}.authorId`}
                        render={({ field: authorIdField }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <AuthorSearch
                                  value={
                                    authorIdField.value
                                      ? authors.find(
                                          (a) => a.id === authorIdField.value,
                                        ) || {
                                          id: authorIdField.value,
                                          name:
                                            initialData?.wishlistItemAuthors[
                                              index
                                            ]?.author.name || "",
                                        }
                                      : undefined
                                  }
                                  onChange={(author) =>
                                    form.setValue(
                                      `bookAuthors.${index}.authorId`,
                                      author?.id,
                                    )
                                  }
                                  placeholder="Select an author"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleNewAuthorInput(index)}
                                  className="absolute top-1/2 right-1 h-6 -translate-y-1/2 px-2 text-xs"
                                >
                                  Create new
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-full md:w-32">
                      <FormField
                        control={form.control}
                        name={`bookAuthors.${index}.tag`}
                        render={({ field: tagField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Role (optional)"
                                {...tagField}
                                value={tagField.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {authorFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAuthor(index)}
                        className="h-9 px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ISBN (optional)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-full md:w-1/2">
              {showNewSeriesInput ? (
                <FormField
                  control={form.control}
                  name="newSeriesName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="New series name"
                            {...field}
                            value={field.value ?? ""}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggleNewSeriesInput}
                            className="absolute top-1/2 right-1 h-6 -translate-y-1/2 px-2 text-xs"
                          >
                            Select existing
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="seriesId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <SeriesSearch
                            value={
                              field.value
                                ? series.find((s) => s.id === field.value) || {
                                    id: field.value,
                                    name: initialData?.series?.name || "",
                                  }
                                : undefined
                            }
                            onChange={(series) =>
                              form.setValue("seriesId", series?.id || null)
                            }
                            placeholder="Select a series (optional)"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggleNewSeriesInput}
                            className="absolute top-1/2 right-1 h-6 -translate-y-1/2 px-2 text-xs"
                          >
                            Create new
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <FormField
              control={form.control}
              name="seriesNumber"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem className="w-full md:w-1/3">
                  <FormLabel>Series Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 1, 2.5 (optional)"
                      type="number"
                      step="any"
                      {...field}
                      value={value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(val ? parseFloat(val) : null);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Position in the series (can include decimals)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pages"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem className="w-full md:w-1/3">
                  <FormLabel>Pages</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Number of pages (optional)"
                      type="number"
                      {...field}
                      value={value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange(val ? parseInt(val, 10) : null);
                      }}
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
                <FormItem className="w-full md:w-1/3">
                  <FormLabel>Publisher</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Publisher (optional)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="coverUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-start space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <div className="flex h-40 w-28 items-center justify-center border">
                      {field.value ? (
                        <div className="relative h-full w-full">
                          <img
                            src={field.value}
                            alt="Cover preview"
                            className="h-full w-full object-contain"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveCover}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No cover
                        </span>
                      )}
                    </div>
                    <ImageUploader onUploadComplete={handleCoverImageUpload} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  {initialData?.id ? "Updating..." : "Saving..."}
                </span>
              ) : (
                <>{initialData?.id ? "Update Item" : "Add to Wishlist"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
