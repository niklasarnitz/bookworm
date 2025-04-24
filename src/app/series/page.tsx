"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type SeriesCreate, seriesCreateSchema } from "~/schemas/series";

export default function SeriesPage() {
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);

  const { data: series = [] } = api.series.getAll.useQuery();
  const utils = api.useUtils();

  const form = useForm<SeriesCreate>({
    resolver: zodResolver(seriesCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = api.series.create.useMutation({
    onSuccess: () => {
      void utils.series.getAll.invalidate();
      form.reset();
    },
  });

  const updateMutation = api.series.update.useMutation({
    onSuccess: () => {
      void utils.series.getAll.invalidate();
      setEditingSeriesId(null);
      form.reset();
    },
  });

  const deleteMutation = api.series.delete.useMutation({
    onSuccess: () => {
      void utils.series.getAll.invalidate();
    },
  });

  const onSubmit = async (data: SeriesCreate) => {
    if (editingSeriesId) {
      updateMutation.mutate({ ...data, id: editingSeriesId });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditSeries = (series: { id: string; name: string }) => {
    form.reset({ name: series.name });
    setEditingSeriesId(series.id);
  };

  const handleCancelEdit = () => {
    setEditingSeriesId(null);
    form.reset();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Series</h1>
        <Button onClick={() => window.history.back()}>Back</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSeriesId ? "Edit Series" : "Add Series"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Series name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    {editingSeriesId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={editingSeriesId ? "ml-auto" : ""}
                    >
                      {editingSeriesId ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Series List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Books</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {series.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No series found
                        </TableCell>
                      </TableRow>
                    ) : (
                      series.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item._count?.books ?? 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSeries(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={item._count?.books > 0}
                                onClick={() => {
                                  if (item._count?.books > 0) {
                                    alert(
                                      "Cannot delete series with associated books",
                                    );
                                    return;
                                  }
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this series?",
                                    )
                                  ) {
                                    deleteMutation.mutate({ id: item.id });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
