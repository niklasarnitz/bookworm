"use client";

import React, { useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { CategorySearch } from "~/components/books/CategorySearch";
import {
  Trash2,
  Edit,
  Plus,
  ChevronRight,
  Folder,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

type CategoryWithChildren = RouterOutputs["category"]["getTree"][number];

export default function CategoryPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    parentId?: string | null;
  } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | undefined>();

  const { data: categoryTree, refetch: refetchCategories } =
    api.category.getTree.useQuery();

  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully");
      void refetchCategories();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating category: ${error.message}`);
    },
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully");
      void refetchCategories();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating category: ${error.message}`);
    },
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully");
      void refetchCategories();
    },
    onError: (error) => {
      toast.error(`Error deleting category: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setParentId(undefined);
    setEditingCategory(null);
    setOpenDialog(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (category: CategoryWithChildren) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      parentId: category.parentId,
    });
    setName(category.name);
    setParentId(category.parentId ?? undefined);
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        name,
        parentId: parentId ?? null,
      });
    } else {
      createCategory.mutate({
        name,
        parentId: parentId,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category? Books in this category will be uncategorized.",
      )
    ) {
      deleteCategory.mutate({ id });
    }
  };

  const toggleExpandCategory = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (
    categories: CategoryWithChildren[],
    level = 0,
  ) => {
    if (!categories || categories.length === 0) return null;

    return (
      <ul className="pl-4">
        {categories.map((category) => {
          if (!category) return null;

          const isExpanded = expandedCategories.has(category?.id ?? "");
          const hasChildren = (category?.children?.length ?? 0) > 0;

          return (
            <li key={category.id} className="mt-1">
              <div className="flex items-center gap-1">
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleExpandCategory(category.id)}
                  >
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </Button>
                ) : (
                  <div className="w-6" />
                )}

                {isExpanded ? (
                  <FolderOpen className="mr-1 h-4 w-4 text-yellow-500" />
                ) : (
                  <Folder className="mr-1 h-4 w-4 text-blue-500" />
                )}

                <span className="font-medium" title={`${category.path}`}>
                  {category.path} - {category.name}
                </span>

                <div className="ml-auto flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleOpenEdit(category)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {isExpanded &&
                renderCategoryTree(category.children ?? [], level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage your book categories</CardDescription>
          </div>

          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </CardHeader>

        <CardContent>
          <div className="mt-4">
            {categoryTree && categoryTree.length > 0 ? (
              renderCategoryTree(categoryTree)
            ) : (
              <p className="text-muted-foreground">
                No categories yet. Create your first category to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details of this category."
                : "Create a new category for your books."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="parent">Parent Category (Optional)</Label>
              <CategorySearch
                value={parentId}
                onChange={(value) => {
                  // Prevent parent being set to itself
                  if (editingCategory && value === editingCategory.id) {
                    toast.error("A category cannot be its own parent");
                    return;
                  }
                  setParentId(value);
                }}
                placeholder="No parent (top level)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
