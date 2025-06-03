import { expect, test } from "bun:test";
import { getCategoryName } from "~/helpers/getCategoryName";
import type { Category } from "~/schemas/category";

test("getCategoryName", () => {
  let category: Omit<Category, "children"> | undefined;

  expect(getCategoryName(category)).toBe("-");

  category = {
    _count: { books: 1 },
    createdAt: new Date(),
    id: "asdf",
    level: 3,
    name: "test",
    path: "1.4.3",
    parentId: null,
    sortOrder: 1,
    updatedAt: new Date(),
    userId: "asdf",
  };

  expect(getCategoryName(category)).toBe("1.4.3 test");
});
