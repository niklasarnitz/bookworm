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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type AuthorCreate, authorCreateSchema } from "~/schemas/author";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type Author = {
  id: string;
  name: string;
  _count?: { books: number };
};

export function AuthorManager() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  const { data: authors = [], refetch: refetchAuthors } =
    api.author.getAll.useQuery();

  const form = useForm<AuthorCreate>({
    resolver: zodResolver(authorCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = api.author.create.useMutation({
    onSuccess: async () => {
      await refetchAuthors();
      toast.success("Author created successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating author: ${error.message}`);
    },
  });

  const updateMutation = api.author.update.useMutation({
    onSuccess: async () => {
      await refetchAuthors();
      toast.success("Author updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating author: ${error.message}`);
    },
  });

  const resetForm = () => {
    form.reset({ name: "" });
    setEditingAuthor(null);
    setOpenDialog(false);
  };

  const handleSubmit = (values: AuthorCreate) => {
    if (editingAuthor) {
      updateMutation.mutate({
        id: editingAuthor.id,
        name: values.name,
      });
    } else {
      createMutation.mutate({
        name: values.name,
      });
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEdit = (author: Author) => {
    setEditingAuthor(author);
    form.reset({ name: author.name });
    setOpenDialog(true);
  };

  // Create a custom event listener to handle edit requests from the AuthorTable
  React.useEffect(() => {
    const handleEditEvent = (event: Event) => {
      const customEvent = event as CustomEvent<Author>;
      handleOpenEdit(customEvent.detail);
    };

    window.addEventListener("edit-author", handleEditEvent as EventListener);
    return () => {
      window.removeEventListener(
        "edit-author",
        handleEditEvent as EventListener,
      );
    };
  }, []);

  return (
    <>
      <Button onClick={handleOpenCreate} className="flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add Author
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? "Edit Author" : "Create New Author"}
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
                      <Input placeholder="Author name" autoFocus {...field} />
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
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      {editingAuthor ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <>{editingAuthor ? "Update" : "Create"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
