import type { Category } from "~/schemas/category";

export const getCategoryName = (
  category: Omit<Category, "children"> | undefined,
) => {
  if (category) {
    return `${category.path} ${category.name}`;
  }
  return "-";
};
