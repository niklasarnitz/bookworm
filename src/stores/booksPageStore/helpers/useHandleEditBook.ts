import { useCallback } from "react";
import { useBooksPageStore } from "~/stores/booksPageStore/booksPageStore";
import type { RouterOutputs } from "~/trpc/react";

type Book = RouterOutputs["book"]["getAll"]["books"][number];

export const useHandleEditBook = () => {
  const { setIsAddingBook, setBookBeingEdited } = useBooksPageStore();

  return useCallback(
    (book: Book) => {
      setBookBeingEdited(book);
      setIsAddingBook(false);
    },
    [setBookBeingEdited, setIsAddingBook],
  );
};
