import { api } from "~/trpc/server";

export const GET = async () => {
  const categories = await api.category.getAll();

  const returnValue = categories
    .map((category) => {
      const indentation = "  ".repeat(category.level * 2);

      return `${indentation}${category.path} ${category.name}`;
    })
    .join("\n");

  return new Response(returnValue, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
