import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import type { useBookForm } from "~/components/books/bookForm/useBookForm";
import type { Book, BookCreate } from "~/schemas/book";
import { api } from "~/trpc/react";

export const useBookFormOnSubmit = (
  initialData: Book | undefined,
  form: ReturnType<typeof useBookForm>["form"],
  onSuccess?: () => void,
) => {
  const utils = api.useUtils();
  const router = useRouter();

  const { mutateAsync: createBook, isPending: isCreatingBook } =
    api.book.create.useMutation({
      onSuccess: async () => {
        await utils.book.getAll.invalidate();
        router.refresh();
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
        router.refresh();
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

  const onSubmit = useCallback(
    async (data: BookCreate) => {
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

        if (initialData?.id) {
          await updateBook({ ...finalData, id: initialData.id });
        } else {
          await createBook(finalData);
        }
      } catch (error) {
        toast.error("An error occurred while saving the book");
        console.error("Form submission error:", error);
      }
    },
    [createAuthor, createBook, createSeries, initialData?.id, updateBook],
  );

  return {
    onSubmit,
    isPending:
      isCreatingBook || isUpdatingBook || isCreatingAuthor || isCreatingSeries,
  };
};
