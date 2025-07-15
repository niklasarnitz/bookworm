"use client";
import type React from "react";
import { CategoryItem } from "~/components/categories/CategoryItem";
import type { Category } from "~/schemas/category";

export function CategoryAccordion({
  categories,
  expandedIds,
  toggleExpand,
  onEdit,
  onDelete,
  level = 0,
}: Readonly<{
  categories: Category[];
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
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
