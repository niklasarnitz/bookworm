"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AuthorCreate, authorCreateSchema } from "~/schemas/author";
import { api, type RouterOutputs } from "~/trpc/react";
import { toast } from "sonner";
import { Edit, Plus } from "lucide-react";

type Author = RouterOutputs["author"]["getAll"]["authors"][number];

interface AuthorDialogProps {
  author?: Author; // If provided, we're editing an existing author
  trigger?: React.ReactNode; // Optional custom trigger
  triggerClassName?: string;
  onComplete?: () => void;
}

export function AuthorDialog({
  author,
  trigger,
  triggerClassName,
  onComplete,
}: Readonly<AuthorDialogProps>) {
  const [open, setOpen] = React.useState(false);

  const isEditing = !!author;

  const form = useForm<AuthorCreate>({
    resolver: zodResolver(authorCreateSchema),
    defaultValues: {
      name: author?.name ?? "",
    },
  });

  const utils = api.useUtils();

  const createMutation = api.author.create.useMutation({
    onSuccess: async () => {
      await utils.author.getAll.invalidate();
      toast.success("Author created successfully");
      handleComplete();
    },
    onError: (error) => {
      toast.error(`Error creating author: ${error.message}`);
    },
  });

  const updateMutation = api.author.update.useMutation({
    onSuccess: async () => {
      await utils.author.getAll.invalidate();
      toast.success("Author updated successfully");
      handleComplete();
    },
    onError: (error) => {
      toast.error(`Error updating author: ${error.message}`);
    },
  });

  const handleSubmit = (values: AuthorCreate) => {
    if (isEditing && author) {
      updateMutation.mutate({
        id: author.id,
        name: values.name,
      });
    } else {
      createMutation.mutate({
        name: values.name,
      });
    }
  };

  const handleComplete = () => {
    form.reset();
    setOpen(false);
    onComplete?.();
  };

  // Generate default trigger if none provided
  const defaultTrigger = isEditing ? (
    <Button variant="ghost" size="sm" className={triggerClassName}>
      <Edit className="mr-1 h-4 w-4" />
      <span className="sr-only sm:not-sr-only sm:inline-block">Edit</span>
    </Button>
  ) : (
    <Button className={`flex items-center gap-2 ${triggerClassName}`}>
      <Plus className="h-4 w-4" /> Add Author
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Author" : "Create New Author"}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    {isEditing ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <>{isEditing ? "Update" : "Create"}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
