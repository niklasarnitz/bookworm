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
import { type AuthorCreate, authorCreateSchema } from "~/schemas/author";

export default function AuthorsPage() {
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);

  const { data: authors = [] } = api.author.getAll.useQuery();
  const utils = api.useUtils();

  const form = useForm<AuthorCreate>({
    resolver: zodResolver(authorCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = api.author.create.useMutation({
    onSuccess: () => {
      void utils.author.getAll.invalidate();
      form.reset();
    },
  });

  const updateMutation = api.author.update.useMutation({
    onSuccess: () => {
      void utils.author.getAll.invalidate();
      setEditingAuthorId(null);
      form.reset();
    },
  });

  const deleteMutation = api.author.delete.useMutation({
    onSuccess: () => {
      void utils.author.getAll.invalidate();
    },
  });

  const onSubmit = async (data: AuthorCreate) => {
    if (editingAuthorId) {
      updateMutation.mutate({ ...data, id: editingAuthorId });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditAuthor = (author: { id: string; name: string }) => {
    form.reset({ name: author.name });
    setEditingAuthorId(author.id);
  };

  const handleCancelEdit = () => {
    setEditingAuthorId(null);
    form.reset();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Authors</h1>
        <Button onClick={() => window.history.back()}>Back</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingAuthorId ? "Edit Author" : "Add Author"}
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
                          <Input placeholder="Author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    {editingAuthorId && (
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
                      className={editingAuthorId ? "ml-auto" : ""}
                    >
                      {editingAuthorId ? "Update" : "Add"}
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
              <CardTitle>Author List</CardTitle>
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
                    {authors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No authors found
                        </TableCell>
                      </TableRow>
                    ) : (
                      authors.map((author) => (
                        <TableRow key={author.id}>
                          <TableCell>{author.name}</TableCell>
                          <TableCell>{author._count?.books ?? 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAuthor(author)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={author._count?.books > 0}
                                onClick={() => {
                                  if (author._count?.books > 0) {
                                    alert(
                                      "Cannot delete author with associated books",
                                    );
                                    return;
                                  }
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this author?",
                                    )
                                  ) {
                                    deleteMutation.mutate({ id: author.id });
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
