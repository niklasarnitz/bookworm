import React, { useState } from "react";

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
import { type BookCreate } from "~/schemas/book";
import { X, Plus, ChevronDown } from "lucide-react";
import { CoverUploader } from "../CoverUploader";
import { AmazonBookSearch } from "../AmazonBookSearch";
import { AmazonCoverFetcher } from "../AmazonCoverFetcher";
import { CategorySearch } from "../CategorySearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useBookForm } from "~/components/books/bookForm/useBookForm";
import type { RouterOutputs } from "~/trpc/react";

interface BookFormProps {
  initialData?: Partial<BookCreate & { id?: string }>;
  authors: RouterOutputs["author"]["getAll"] | undefined;
  series: RouterOutputs["series"]["getAll"] | undefined;
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
  const [showAddMenu, setShowAddMenu] = useState(false);

  const {
    handleCoverImageUpload,
    handleRemoveCover,
    onInvalid,
    onSubmit,
    handleBookSelect,
    handleCoverSelect,
    isEditing,
    toggleNewAuthorInput,
    toggleNewSeriesInput,
    setShowAmazonSearch,
    appendAuthor,
    removeAuthor,
    authorFields,
    showNewAuthorInputs,
    showNewSeriesInput,
    setShowCoverFetcher,
    form,
    isPending,
    isProcessingCover,
    showAmazonSearch,
    showCoverFetcher,
  } = useBookForm(initialData, onSuccess);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        {!isEditing && (
          <div className="relative">
            <Popover open={showAddMenu} onOpenChange={setShowAddMenu}>
              <PopoverTrigger asChild>
                <Button className="flex items-center gap-1" variant="outline">
                  Add Book <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <div className="flex flex-col py-1">
                  <button
                    className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => {
                      setShowAddMenu(false);
                      setShowAmazonSearch(true);
                    }}
                  >
                    Import via ISBN
                  </button>
                  <button
                    className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100"
                    onClick={() => setShowAddMenu(false)}
                  >
                    Create from Scratch
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel htmlFor="book-title">Title</FormLabel>
                <FormControl>
                  <Input id="book-title" placeholder="Book title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel htmlFor="book-subtitle">Subtitle</FormLabel>
                <FormControl>
                  <Input
                    id="book-subtitle"
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
                <FormLabel htmlFor="book-isbn">ISBN</FormLabel>
                <FormControl>
                  <Input
                    id="book-isbn"
                    placeholder="ISBN (optional)"
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
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="book-publisher">Publisher</FormLabel>
                <FormControl>
                  <Input
                    id="book-publisher"
                    placeholder="Publisher (optional)"
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
            name="pages"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="book-pages">Pages</FormLabel>
                <FormControl>
                  <Input
                    id="book-pages"
                    type="number"
                    placeholder="Number of pages (optional)"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? null
                          : parseInt(e.target.value, 10);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <FormLabel id="authors-section-label">Authors</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAuthor({ authorId: "", tag: "" })}
              aria-label="Add another author"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Author
            </Button>
          </div>

          {authorFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border p-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Author {index + 1}</h4>
                {authorFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAuthor(index)}
                    aria-label={`Remove author ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex w-full flex-col md:flex-row md:items-end md:gap-2">
                <div className="flex-1">
                  {!showNewAuthorInputs[index] ? (
                    <FormField
                      control={form.control}
                      name={`bookAuthors.${index}.authorId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`author-select-${index}`}>
                            Select Author
                          </FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                              name={`author-select-${index}`}
                            >
                              <SelectTrigger
                                id={`author-select-${index}`}
                                className="w-full"
                              >
                                <SelectValue placeholder="Select an author" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="placeholder">
                                  Select an author
                                </SelectItem>
                                {authors?.authors.map((author) => (
                                  <SelectItem key={author.id} value={author.id}>
                                    {author.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                          <FormLabel htmlFor={`author-name-${index}`}>
                            New Author Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              id={`author-name-${index}`}
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
                  className="mt-2 md:mt-0 md:mb-[2px]"
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
                    <FormLabel htmlFor={`author-tag-${index}`}>
                      Tag (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        id={`author-tag-${index}`}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FormLabel id="series-section-label">Series</FormLabel>
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
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) => field.onChange(value || null)}
                        name="series-select"
                      >
                        <SelectTrigger id="series-select" className="w-full">
                          <SelectValue placeholder="Select a series (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {series?.series.map((series) => (
                            <SelectItem key={series.id} value={series.id}>
                              {series.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel htmlFor="new-series-name">
                      New Series Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="new-series-name"
                        placeholder="Enter new series name"
                        {...field}
                      />
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
                <FormLabel htmlFor="series-number">Series Number</FormLabel>
                <FormControl>
                  <Input
                    id="series-number"
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

          <FormField
            control={form.control}
            name="coverUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel>Book Cover</FormLabel>
                <FormControl>
                  <CoverUploader
                    onImageUpload={handleCoverImageUpload}
                    defaultImageUrl={field.value ?? undefined}
                    isbn={form.watch("isbn")}
                    onFetchFromAmazon={() => setShowCoverFetcher(true)}
                    onRemoveCover={handleRemoveCover}
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
              <FormItem className="md:col-span-1">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategorySearch
                    value={field.value ?? undefined}
                    onChange={(value) => field.onChange(value)}
                    placeholder="Select a category (optional)"
                  />
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
                  {isEditing ? "Updating..." : "Saving..."}
                </span>
              ) : (
                <>{isEditing ? "Update Book" : "Add Book"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
      {showAmazonSearch && (
        <AmazonBookSearch
          onBookSelect={handleBookSelect}
          onClose={() => setShowAmazonSearch(false)}
        />
      )}

      {showCoverFetcher && form.watch("isbn") && (
        <AmazonCoverFetcher
          isbn={form.watch("isbn")}
          onCoverSelect={handleCoverSelect}
          onClose={() => setShowCoverFetcher(false)}
        />
      )}
      {isProcessingCover && (
        <div className="bg-opacity-50 fixed inset-0 z-[60] flex items-center justify-center bg-black">
          <div className="rounded-lg bg-white p-4 text-center">
            <div className="border-primary mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p>Processing cover image...</p>
          </div>
        </div>
      )}
    </div>
  );
}
