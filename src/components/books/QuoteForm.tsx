"use client";

import { type QuoteFormValues, quoteSchema } from "~/schemas/quote";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "~/components/ui/textarea";

interface QuoteFormProps {
  bookId: string;
  defaultValues?: Partial<QuoteFormValues>;
  onCancel: () => void;
  isEdit?: boolean;
  onSubmit: (values: QuoteFormValues) => void;
  isSubmitting: boolean;
}

export function QuoteForm({
  bookId,
  defaultValues,
  onCancel,
  isEdit = false,
  onSubmit,
  isSubmitting,
}: Readonly<QuoteFormProps>) {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      title: "",
      pageStart: undefined,
      pageEnd: undefined,
      text: "",
      bookId,
      ...defaultValues,
    },
  });

  const handleSubmit = (values: QuoteFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Quote title..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="pageStart"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Page</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Page number"
                    min={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value, 10) : "",
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pageEnd"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>To Page (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="End page"
                    min={1}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value, 10) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote Text</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the quote text..."
                  {...field}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "Update Quote" : "Add Quote"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
