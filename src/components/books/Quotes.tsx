"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { type QuoteFormValues } from "~/schemas/quote";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { QuoteForm } from "./QuoteForm";
import { QuoteItem } from "./QuoteItem";
import type { Book } from "~/schemas/book";

interface QuotesProps {
  book: Book;
}

export function Quotes({ book }: Readonly<QuotesProps>) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Fetch quotes for this book
  const quotesQuery = api.quote.getBookQuotes.useQuery(
    { bookId: book.id },
    { suspense: false },
  );

  // Mutations for creating, updating, and deleting quotes
  const createQuoteMutation = api.quote.create.useMutation({
    onSuccess: async () => {
      await quotesQuery.refetch();
      setIsAdding(false);
      toast.success("Quote added successfully");
    },
    onError: () => {
      toast.error("Failed to add quote");
    },
  });

  const updateQuoteMutation = api.quote.update.useMutation({
    onSuccess: async () => {
      await quotesQuery.refetch();
      setEditingQuoteId(null);
      toast.success("Quote updated successfully");
    },
    onError: () => {
      toast.error("Failed to update quote");
    },
  });

  const deleteQuoteMutation = api.quote.delete.useMutation({
    onSuccess: async () => {
      await quotesQuery.refetch();
      toast.success("Quote deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete quote");
    },
  });

  const handleSubmitCreate = (values: QuoteFormValues) => {
    createQuoteMutation.mutate(values);
  };

  const handleSubmitUpdate = (values: QuoteFormValues) => {
    if (editingQuoteId) {
      updateQuoteMutation.mutate({ id: editingQuoteId, ...values });
    }
  };

  const handleDelete = (quoteId: string) => {
    deleteQuoteMutation.mutate({ id: quoteId });
  };

  const handleEdit = (quoteId: string) => {
    setEditingQuoteId(quoteId);
  };

  const quotes = quotesQuery.data?.quotes ?? [];

  return (
    <div className="mt-6 space-y-4">
      <Separator className="my-4" />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quotes</h2>
        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1"
          >
            <PlusCircle size={16} />
            Add Quote
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardContent className="pt-6">
            <QuoteForm
              bookId={book.id}
              onCancel={() => setIsAdding(false)}
              onSubmit={handleSubmitCreate}
              isSubmitting={createQuoteMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {quotesQuery.isLoading ? (
        <div className="py-8 text-center">Loading quotes...</div>
      ) : quotes.length === 0 && !isAdding ? (
        <div className="text-muted-foreground py-8 text-center">
          No quotes added yet. Add your first quote to remember important
          passages from this book.
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) =>
            editingQuoteId === quote.id ? (
              <Card key={quote.id}>
                <CardContent className="pt-6">
                  <QuoteForm
                    bookId={book.id}
                    defaultValues={quote}
                    onCancel={() => setEditingQuoteId(null)}
                    onSubmit={handleSubmitUpdate}
                    isEdit
                    isSubmitting={updateQuoteMutation.isPending}
                  />
                </CardContent>
              </Card>
            ) : (
              <QuoteItem
                key={quote.id}
                quote={quote}
                onEdit={handleEdit}
                onDelete={handleDelete}
                book={book}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
