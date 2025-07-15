"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Category } from "~/schemas/category";
import { CategoryAccordion } from "~/components/categories/CategoryAccordion";

type CategoryTreeProps = {
  onEdit?: (category: Category) => void;
};

export function CategoryTree({ onEdit }: Readonly<CategoryTreeProps>) {
  const { data: categories = [], refetch } = api.category.getTree.useQuery();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: async () => {
      await refetch();
      toast.success("Category deleted successfully");
      setCategoryToDelete(null);
    },
    onError: (error) => {
      toast.error(`Error deleting category: ${error.message}`);
    },
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (category: Category) => {
    if (onEdit) {
      onEdit(category);
    }
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      deleteCategory.mutate({ id: categoryToDelete.id });
    }
  };

  if (!categories.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No categories found</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Click &quot;Add Category&quot; to create your first category
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="rounded-md border">
          <div className="p-2">
            <CategoryAccordion
              categories={categories}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              onEdit={handleEdit}
              onDelete={setCategoryToDelete}
            />
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category{" "}
              <span className="font-semibold">{categoryToDelete?.name}</span>.
              {categoryToDelete?._count?.books ? (
                <span className="mt-2 block text-red-500">
                  This category has books assigned to it and cannot be deleted.
                  Please reassign or remove the books first.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={
                deleteCategory.isPending || !!categoryToDelete?._count?.books
              }
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteCategory.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
