"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CategoryTree } from "./CategoryTree";
import type { Category } from "~/schemas/category";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryManager() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    (CategoryFormValues & { id: string }) | null
  >(null);

  const { data: categories, refetch: refetchCategories } =
    api.category.getTree.useQuery();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      parentId: null,
    },
  });

  const createCategory = api.category.create.useMutation({
    onSuccess: async () => {
      await refetchCategories();
      toast.success("Category created successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating category: ${error.message}`);
    },
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: async () => {
      await refetchCategories();
      toast.success("Category updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating category: ${error.message}`);
    },
  });

  const resetForm = () => {
    form.reset({ name: "", parentId: null });
    setEditingCategory(null);
    setOpenDialog(false);
  };

  const handleSubmit = (values: CategoryFormValues) => {
    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        name: values.name,
        parentId: values.parentId,
      });
    } else {
      createCategory.mutate({
        name: values.name,
        parentId: values.parentId ?? undefined,
      });
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      parentId: category.parentId,
    });
    form.reset({
      name: category.name,
      parentId: category.parentId,
    });
    setOpenDialog(true);
  };

  return (
    <>
      <div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="mt-4">
        <CategoryTree onEdit={handleOpenEdit} />
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) => field.onChange(value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Top Level)</SelectItem>
                          {categories?.map((category) => (
                            <CategoryOptionGroup
                              key={category.id}
                              category={category}
                              currentEditId={editingCategory?.id}
                              level={0}
                            />
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createCategory.isPending || updateCategory.isPending
                  }
                >
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// For displaying the category tree options in the select input
function CategoryOptionGroup({
  category,
  currentEditId,
  level = 0,
}: Readonly<{
  category: Category;
  currentEditId?: string;
  level: number;
}>) {
  // Don't show the category being edited or its children as parent options
  if (category.id === currentEditId) return null;

  return (
    <>
      <SelectItem
        value={category.id}
        disabled={category.id === currentEditId}
        className="pl-[calc(0.75rem+var(--indent))]"
        style={{ "--indent": `${level * 1}rem` } as React.CSSProperties}
      >
        {category.path} {category.name}
      </SelectItem>
      {category.children?.map((child) => (
        <CategoryOptionGroup
          key={child.id}
          category={child}
          currentEditId={currentEditId}
          level={level + 1}
        />
      ))}
    </>
  );
}
