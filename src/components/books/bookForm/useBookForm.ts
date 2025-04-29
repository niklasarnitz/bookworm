import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  type SubmitErrorHandler,
} from "react-hook-form";
import { toast } from "sonner";
import type { AmazonBookDetail } from "~/lib/amazon-scraper";
import { bookCreateSchema, type BookCreate } from "~/schemas/book";
import { api } from "~/trpc/react";

export const useBookForm = (
  initialData?: Partial<BookCreate & { id?: string }>,
  onSuccess?: () => void,
) => {
  // API utils
  const utils = api.useUtils();

  // State
  const [showNewAuthorInputs, setShowNewAuthorInputs] = useState<
    Record<number, boolean>
  >({});
  const [showNewSeriesInput, setShowNewSeriesInput] = useState(false);
  const [showAmazonSearch, setShowAmazonSearch] = useState(false);
  const [showCoverFetcher, setShowCoverFetcher] = useState(false);

  const [isProcessingCover, setIsProcessingCover] = useState(false);

  const isEditing = !!initialData?.id;

  // Form
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
      coverUrl: null,
      categoryId: undefined,
      publisher: "",
      pages: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bookAuthors",
  });

  // Mutations
  const { mutateAsync: createBook, isPending: isCreatingBook } =
    api.book.create.useMutation({
      onSuccess: async () => {
        await utils.book.getAll.invalidate();
        form.reset();
        toast.success("Book created successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to create book: ${error.message}`);
      },
    });

  const { mutateAsync: updateBook, isPending: isUpdatingBook } =
    api.book.update.useMutation({
      onSuccess: async () => {
        await utils.book.getAll.invalidate();
        if (initialData?.id) {
          await utils.book.getById.invalidate({ id: initialData.id });
        }
        toast.success("Book updated successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to update book: ${error.message}`);
      },
    });

  const { mutateAsync: createAuthor, isPending: isCreatingAuthor } =
    api.author.create.useMutation({
      onSuccess: async () => {
        await utils.author.getAll.invalidate();
      },
      onError: (error) => {
        toast.error(`Failed to create author: ${error.message}`);
      },
    });

  const { mutateAsync: createSeries, isPending: isCreatingSeries } =
    api.series.create.useMutation({
      onSuccess: async () => {
        await utils.series.getAll.invalidate();
      },
      onError: (error) => {
        toast.error(`Failed to create series: ${error.message}`);
      },
    });

  // Callbacks
  const handleCoverImageUpload = (url: string) => {
    form.setValue("coverUrl", url);
  };

  const handleRemoveCover = () => {
    form.setValue("coverUrl", null);
  };

  const toggleNewAuthorInput = (index: number) => {
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

  const handleBookSelect = (bookData: AmazonBookDetail) => {
    form.setValue("name", bookData.title);
    form.setValue("subtitle", bookData.subtitle ?? "");
    form.setValue("isbn", bookData.isbn ?? "");

    if (bookData.authors.length > 0) {
      while (fields.length > 0) {
        remove(0);
      }

      bookData.authors.forEach((authorName, index) => {
        append({ authorName, authorId: "", tag: "" });
        setShowNewAuthorInputs((prev) => ({ ...prev, [index]: true }));
      });
    }

    if (bookData.coverImageUrl) {
      form.setValue("coverUrl", bookData.coverImageUrl);
    }

    setShowAmazonSearch(false);
  };

  // Handle cover selection with proper loading state management
  const handleCoverSelect = async (coverUrl: string) => {
    try {
      setIsProcessingCover(true);
      // We don't need to preload here, as the CoverUploader component will handle the image processing
      form.setValue("coverUrl", coverUrl);
      setShowCoverFetcher(false);
    } catch (error) {
      console.error("Failed to handle cover selection:", error);
      toast.error("Failed to process the selected cover");
    } finally {
      // Short delay to ensure state changes are applied in the right order
      setTimeout(() => {
        setIsProcessingCover(false);
      }, 100);
    }
  };

  const onSubmit = async (data: BookCreate) => {
    try {
      const newAuthors = await Promise.all(
        data.bookAuthors
          .filter((ba) => !ba.authorId && ba.authorName)
          .map(async (ba) => {
            const result = await createAuthor({
              name: ba.authorName!,
            });
            return {
              originalAuthor: ba,
              newAuthorId: result.id,
            };
          }),
      );

      const processedBookAuthors = data.bookAuthors
        .map((ba) => {
          if (ba.authorId) {
            // Existing author - keep as is
            return {
              authorId: ba.authorId,
              tag: ba.tag,
            };
          }

          const newAuthor = newAuthors.find(
            (na) => na.originalAuthor.authorName === ba.authorName,
          );

          if (newAuthor) {
            return {
              authorId: newAuthor.newAuthorId,
              tag: ba.tag,
            };
          }

          return { authorId: "", tag: ba.tag };
        })
        .filter((ba) => ba.authorId);

      let finalSeriesId = data.seriesId;
      if (!data.seriesId && data.newSeriesName) {
        const newSeries = await createSeries({
          name: data.newSeriesName,
        });
        finalSeriesId = newSeries.id;
      }

      const finalData = {
        ...data,
        bookAuthors: processedBookAuthors,
        seriesId: finalSeriesId,
      };

      if (isEditing && initialData?.id) {
        await updateBook({ ...finalData, id: initialData.id });
      } else {
        await createBook(finalData);
      }
    } catch (error) {
      toast.error("An error occurred while saving the book");
      console.error("Form submission error:", error);
    }
  };

  const onInvalid: SubmitErrorHandler<BookCreate> = (errors) => {
    const firstError = Object.values(errors)[0];
    const errorMessage =
      firstError?.message ?? "Please check the form for errors";
    toast.error(errorMessage);
  };

  return {
    handleCoverImageUpload,
    handleRemoveCover,
    onSubmit,
    onInvalid,
    toggleNewAuthorInput,
    isEditing,
    toggleNewSeriesInput,
    handleBookSelect,
    handleCoverSelect,
    setShowAmazonSearch,
    form,
    appendAuthor: append,
    removeAuthor: remove,
    authorFields: fields,
    showNewAuthorInputs,
    showNewSeriesInput,
    isPending:
      isCreatingBook || isUpdatingBook || isCreatingAuthor || isCreatingSeries,
    setShowCoverFetcher,
    showAmazonSearch,
    showCoverFetcher,
    isProcessingCover,
  };
};
