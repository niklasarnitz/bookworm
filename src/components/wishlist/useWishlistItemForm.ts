import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import {
  wishlistItemCreateSchema,
  type WishlistItemCreate,
} from "~/schemas/wishlist";
import type { RouterOutputs } from "~/trpc/react";

type WishlistItem = RouterOutputs["wishlist"]["getById"];

export const useWishlistItemForm = ({
  initialData,
}: {
  initialData?: WishlistItem;
}) => {
  const form = useForm<WishlistItemCreate>({
    resolver: zodResolver(wishlistItemCreateSchema),
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
