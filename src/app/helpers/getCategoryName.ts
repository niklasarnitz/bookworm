import type { RouterOutputs } from "~/trpc/react";

type MultiplePathsResponse = RouterOutputs["category"]["getMultiplePaths"];

export const getCategoryName = (
  categories: MultiplePathsResponse | undefined,
  categoryId: string | null | undefined,
) => {
  if (!categoryId) return "-";

  const category = categories?.[categoryId];

  if (category) {
    return `${category.path} ${category.name}`;
  }
  return "- ";
};
