import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { bookCreateSchema, type Book, type BookCreate } from "~/schemas/book";

export const useBookForm = ({ initialData }: { initialData?: Book }) => {
  const form = useForm<BookCreate>({
    resolver: zodResolver(bookCreateSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bookAuthors",
  });

  return {
    form,
    authors: fields,
    appendAuthor: append,
    removeAuthor: remove,
  };
};
