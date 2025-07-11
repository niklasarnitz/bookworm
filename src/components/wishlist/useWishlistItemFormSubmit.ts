import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { type useWishlistItemForm } from "~/components/wishlist/useWishlistItemForm";
import type { WishlistItemCreate } from "~/schemas/wishlist";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/react";

type WishlistItem = RouterOutputs["wishlist"]["getById"];

export const useWishlistItemFormSubmit = (
  initialData: WishlistItem | undefined,
  form: ReturnType<typeof useWishlistItemForm>["form"],
  onSuccess?: () => void,
) => {
  const utils = api.useUtils();
  const router = useRouter();

  const { mutateAsync: createWishlistItem, isPending: isCreatingItem } =
    api.wishlist.create.useMutation({
      onSuccess: async () => {
        await utils.wishlist.getAll.invalidate();
        router.refresh();
        form.reset();
        toast.success("Wishlist item created successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to create wishlist item: ${error.message}`);
      },
    });

  const { mutateAsync: updateWishlistItem, isPending: isUpdatingItem } =
    api.wishlist.update.useMutation({
      onSuccess: async () => {
        await utils.wishlist.getAll.invalidate();
        router.refresh();
        if (initialData?.id) {
          await utils.wishlist.getById.invalidate({ id: initialData.id });
        }
        toast.success("Wishlist item updated successfully");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to update wishlist item: ${error.message}`);
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
    async (data: WishlistItemCreate) => {
      try {
        // Handle creating any new authors
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
          await updateWishlistItem({ ...finalData, id: initialData.id });
        } else {
          await createWishlistItem(finalData);
        }
      } catch (error) {
        toast.error("An error occurred while saving the wishlist item");
        console.error("Form submission error:", error);
      }
    },
    [
      createAuthor,
      createWishlistItem,
      createSeries,
      initialData?.id,
      updateWishlistItem,
    ],
  );

  return {
    onSubmit,
    isPending:
      isCreatingItem || isUpdatingItem || isCreatingAuthor || isCreatingSeries,
  };
};
