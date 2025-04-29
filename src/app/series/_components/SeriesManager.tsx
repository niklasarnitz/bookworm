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
import { type SeriesCreate, seriesCreateSchema } from "~/schemas/series";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type Series = {
  id: string;
  name: string;
  _count?: { books: number };
};

export function SeriesManager() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  const { data: series = [], refetch: refetchSeries } =
    api.series.getAll.useQuery();

  const form = useForm<SeriesCreate>({
    resolver: zodResolver(seriesCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = api.series.create.useMutation({
    onSuccess: async () => {
      await refetchSeries();
      toast.success("Series created successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating series: ${error.message}`);
    },
  });

  const updateMutation = api.series.update.useMutation({
    onSuccess: async () => {
      await refetchSeries();
      toast.success("Series updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating series: ${error.message}`);
    },
  });

  const resetForm = () => {
    form.reset({ name: "" });
    setEditingSeries(null);
    setOpenDialog(false);
  };

  const handleSubmit = (values: SeriesCreate) => {
    if (editingSeries) {
      updateMutation.mutate({
        id: editingSeries.id,
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

  const handleOpenEdit = (series: Series) => {
    setEditingSeries(series);
    form.reset({ name: series.name });
    setOpenDialog(true);
  };

  // Create a custom event listener to handle edit requests from the SeriesTable
  React.useEffect(() => {
    const handleEditEvent = (event: Event) => {
      const customEvent = event as CustomEvent<Series>;
      handleOpenEdit(customEvent.detail);
    };

    window.addEventListener("edit-series", handleEditEvent as EventListener);
    return () => {
      window.removeEventListener(
        "edit-series",
        handleEditEvent as EventListener,
      );
    };
  }, []);

  return (
    <>
      <Button onClick={handleOpenCreate} className="flex items-center gap-2">
        <Plus className="h-4 w-4" /> Add Series
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingSeries ? "Edit Series" : "Create New Series"}
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
                      <Input placeholder="Series name" autoFocus {...field} />
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
                      {editingSeries ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <>{editingSeries ? "Update" : "Create"}</>
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
