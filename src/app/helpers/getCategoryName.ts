import type { RouterOutputs } from "~/trpc/react";

type Category = RouterOutputs["book"]["getAll"][number]["category"];

export const getCategoryName = (category: Category | undefined) => {
  if (category) {
    return `${category.path} ${category.name}`;
  }
  return "- ";
};
