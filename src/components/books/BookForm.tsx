import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { type BookCreate, bookCreateSchema } from "~/schemas/book";
import { api } from "~/trpc/react";
import { X, Plus } from "lucide-react";
import { CoverUploader } from "./CoverUploader";

interface BookFormProps {
  initialData?: Partial<BookCreate & { id?: string }>;
  authors: { id: string; name: string }[];
  series: { id: string; name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookForm({
  initialData,
  authors,
  series,
  onSuccess,
  onCancel,
}: Readonly<BookFormProps>) {
  const utils = api.useUtils();
  const [showNewAuthorInputs, setShowNewAuthorInputs] = useState<
    Record<number, boolean>
  >({});
  const [showNewSeriesInput, setShowNewSeriesInput] = useState(false);

  // Transform initialData to match our new schema
  const transformedInitialData =
    initialData && "authorId" in initialData
      ? {
          ...initialData,
          bookAuthors: initialData.authorId
            ? [
                {
                  authorId: initialData.authorId as string,
                  tag: null,
                },
              ]
            : [],
        }
      : initialData;

  const form = useForm<BookCreate>({
    resolver: zodResolver(bookCreateSchema),
    defaultValues: transformedInitialData ?? {
      name: "",
      subtitle: "",
      isbn: "",
      bookAuthors: [{ authorId: "", tag: "" }],
      seriesId: "",
      newSeriesName: "",
      seriesNumber: null,
      coverUrl: "",
    },
  });

  // Set up field array for multiple authors
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bookAuthors",
  });

  // Handle image upload
  const handleCoverImageUpload = (url: string) => {
    form.setValue("coverUrl", url);
  };

  const createMutation = api.book.create.useMutation({
    onSuccess: () => {
      void utils.book.getAll.invalidate();
      form.reset();
      onSuccess?.();
    },
  });

  const updateMutation = api.book.update.useMutation({
    onSuccess: () => {
      void utils.book.getAll.invalidate();
      if (initialData?.id) {
        void utils.book.getById.invalidate({ id: initialData.id });
      }
      onSuccess?.();
    },
  });

  const createAuthorMutation = api.author.create.useMutation({
    onSuccess: () => {
      void utils.author.getAll.invalidate();
    },
  });

  const createSeriesMutation = api.series.create.useMutation({
    onSuccess: () => {
      void utils.series.getAll.invalidate();
    },
  });

  const isEditing = !!initialData?.id;

  const onSubmit = async (data: BookCreate) => {
    // Process authors first - create any new authors
    const newAuthors = await Promise.all(
      data.bookAuthors
        .filter((ba) => !ba.authorId && ba.authorName)
        .map(async (ba) => {
          const result = await createAuthorMutation.mutateAsync({
            name: ba.authorName!,
          });
          return {
            originalAuthor: ba,
            newAuthorId: result.id,
          };
        }),
    );

    // Update bookAuthors with newly created author IDs
    const processedBookAuthors = data.bookAuthors
      .map((ba) => {
        if (ba.authorId) {
          // Existing author - keep as is
          return {
            authorId: ba.authorId,
            tag: ba.tag,
          };
        }

        // Look for newly created author
        const newAuthor = newAuthors.find(
          (na) => na.originalAuthor.authorName === ba.authorName,
        );

        if (newAuthor) {
          return {
            authorId: newAuthor.newAuthorId,
            tag: ba.tag,
          };
        }

        // This should not happen if validation is working
        return { authorId: "", tag: ba.tag };
      })
      .filter((ba) => ba.authorId); // Remove any invalid entries

    // Handle creation of new series if needed
    let finalSeriesId = data.seriesId;
    if (!data.seriesId && data.newSeriesName) {
      const newSeries = await createSeriesMutation.mutateAsync({
        name: data.newSeriesName,
      });
      finalSeriesId = newSeries.id;
    }

    // Prepare final data
    const finalData = {
      ...data,
      bookAuthors: processedBookAuthors,
      seriesId: finalSeriesId,
    };

    if (isEditing && initialData?.id) {
      updateMutation.mutate({ ...finalData, id: initialData.id });
    } else {
      createMutation.mutate(finalData);
    }
  };

  const toggleNewAuthorInput = (index: number) => {
    setShowNewAuthorInputs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    // Reset the field
    if (!showNewAuthorInputs[index]) {
      // Switching to "Create New" - clear authorId
      form.setValue(`bookAuthors.${index}.authorId`, undefined);
    } else {
      // Switching to "Select Existing" - clear authorName
      form.setValue(`bookAuthors.${index}.authorName`, undefined);
    }
  };

  const toggleNewSeriesInput = () => {
    setShowNewSeriesInput(!showNewSeriesInput);
    if (showNewSeriesInput) {
      // Switching to "Select Existing" - clear newSeriesName
      form.setValue("newSeriesName", undefined);
    } else {
      // Switching to "Create New" - clear seriesId
      form.setValue("seriesId", null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Book" : "Add New Book"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Authors</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ authorId: "", tag: "" })}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Author
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-2 rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Author {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex w-full items-end gap-2">
                    <div className="flex-1">
                      {!showNewAuthorInputs[index] ? (
                        <FormField
                          control={form.control}
                          name={`bookAuthors.${index}.authorId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Author</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full rounded border p-2"
                                  {...field}
                                >
                                  <option value="">Select an author</option>
                                  {authors.map((author) => (
                                    <option key={author.id} value={author.id}>
                                      {author.name}
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name={`bookAuthors.${index}.authorName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Author Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter author name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mb-[2px]"
                      onClick={() => toggleNewAuthorInput(index)}
                    >
                      {showNewAuthorInputs[index]
                        ? "Select Existing"
                        : "Create New"}
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`bookAuthors.${index}.tag`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. herausgeber, editor, etc."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Series</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleNewSeriesInput}
                >
                  {showNewSeriesInput ? "Select Existing" : "Create New"}
                </Button>
              </div>

              {!showNewSeriesInput ? (
                <FormField
                  control={form.control}
                  name="seriesId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <select
                          className="w-full rounded border p-2"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === "" ? null : e.target.value;
                            field.onChange(value);
                          }}
                        >
                          <option value="">None</option>
                          {series.map((series) => (
                            <option key={series.id} value={series.id}>
                              {series.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="newSeriesName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter new series name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="seriesNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Series number (optional)"
                      {...field}
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      disabled={!form.watch("seriesId") && !showNewSeriesInput}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Replace cover URL input with our image uploader */}
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Cover</FormLabel>
                  <FormControl>
                    <CoverUploader
                      onImageUpload={handleCoverImageUpload}
                      defaultImageUrl={field.value ?? undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="flex justify-between px-0">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  createAuthorMutation.isPending ||
                  createSeriesMutation.isPending
                }
              >
                {isEditing ? "Update Book" : "Add Book"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
