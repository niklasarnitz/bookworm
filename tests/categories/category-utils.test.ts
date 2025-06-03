import { expect, test } from "bun:test";
import { sortCategoriesByPath } from "~/lib/category-utils";

const categories: { path: string }[] = [
  {
    path: "1",
  },
  {
    path: "1.0.1",
  },
  {
    path: "1000",
  },
  {
    path: "20.1.1.34.4.5.6.1",
  },
  {
    path: "29992.12.234234234234.555",
  },
  {
    path: "5555555555",
  },
];

test("sortCategoriesByPath", () => {
  expect(sortCategoriesByPath(categories)).toMatchObject([
    {
      path: "1",
    },
    {
      path: "1.0.1",
    },
    {
      path: "20.1.1.34.4.5.6.1",
    },
    {
      path: "1000",
    },
    {
      path: "29992.12.234234234234.555",
    },
    {
      path: "5555555555",
    },
  ]);
});
