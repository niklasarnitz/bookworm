import { useCallback } from "react";
import type { useBookForm } from "~/components/books/bookForm/useBookForm";
import type { BookDetail } from "~/lib/book-metadata/types";
import type { Author } from "~/schemas/author";
import { useBooksPageStore } from "~/stores/booksPageStore/booksPageStore";

export const useBookFormSelectAmazonBook = (
  form: ReturnType<typeof useBookForm>["form"],
  authorFields: ReturnType<typeof useBookForm>["authors"],
  appendAuthor: ReturnType<typeof useBookForm>["appendAuthor"],
  removeAuthor: ReturnType<typeof useBookForm>["removeAuthor"],
  setShowNewAuthorInputs: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >,
  authors: Author[] | undefined,
) => {
  const { setShowAmazonSearch } = useBooksPageStore();

  const addAuthors = useCallback(
    (bookData: BookDetail, startIdx: number, batchSize: number) => {
      const endIdx = Math.min(startIdx + batchSize, bookData.authors.length);

      for (let i = startIdx; i < endIdx; i++) {
        const authorName = bookData.authors[i];

        const existingAuthor = authors?.find(
          (author) => author.name === authorName,
        );

        appendAuthor({ authorName, authorId: existingAuthor?.id, tag: "" });
        setShowNewAuthorInputs((prev) => ({
          ...prev,
          [i]: true,
        }));
      }

      // If there are more authors to process, schedule the next batch
      if (endIdx < bookData.authors.length) {
        setTimeout(() => addAuthors(bookData, endIdx, batchSize), 0);
      }
    },
    [appendAuthor, authors, setShowNewAuthorInputs],
  );

  return useCallback(
    (bookData: BookDetail) => {
      try {
        // Use requestAnimationFrame to ensure UI stays responsive during complex DOM updates
        requestAnimationFrame(() => {
          // Basic field updates that won't cause layout thrashing
          form.setValue("name", bookData.title);
          form.setValue("subtitle", bookData.subtitle ?? "");
          form.setValue("isbn", bookData.isbn ?? "");
          form.setValue("publisher", bookData.publisher ?? "");

          // Delay the more complex operations that might trigger heavy DOM updates
          setTimeout(() => {
            try {
              // Handle author updates in batches if there are many
              if (bookData.authors.length > 0) {
                // First remove existing authors
                const fieldsToRemove = authorFields.length;
                for (let i = 0; i < fieldsToRemove; i++) {
                  removeAuthor(0);
                }

                // Start adding authors in batches of 5 (adjust as needed)
                addAuthors(bookData, 0, 5);
              }

              // Finally update the cover URL in the next event loop turn
              setTimeout(() => {
                if (bookData.coverImageUrl) {
                  form.setValue("coverUrl", bookData.coverImageUrl);
                }

                // Finally close the dialog
                setShowAmazonSearch(false);
              }, 0);
            } catch (err) {
              console.error("Error processing author data:", err);
            }
          }, 10);
        });
      } catch (err) {
        console.error("Error in handleBookSelect:", err);
      }
    },
    [addAuthors, authorFields.length, form, removeAuthor, setShowAmazonSearch],
  );
};
