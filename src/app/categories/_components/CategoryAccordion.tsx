"use client";
import type React from "react";
import { CategoryItem } from "~/app/categories/_components/CategoryItem";
import type { RouterOutputs } from "~/trpc/react";

type CategoryWithChildren = RouterOutputs["category"]["getTree"][number];

export function CategoryAccordion({
  categories,
  expandedIds,
  toggleExpand,
  onEdit,
  onDelete,
  level = 0,
}: Readonly<{
  categories: CategoryWithChildren[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  onEdit: (category: CategoryWithChildren) => void;
  onDelete: (category: CategoryWithChildren) => void;
  level?: number;
}>) {
  if (!categories.length) return null;

  return (
    <div className="space-y-0.5 pl-0">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level}
        />
      ))}
    </div>
  );
}
