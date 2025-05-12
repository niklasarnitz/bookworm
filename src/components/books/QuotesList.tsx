"use client";

import { useState } from "react";
import { type Quote } from "@prisma/client";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { QuoteForm } from "./QuoteForm";
import { QuoteItem } from "./QuoteItem";
import { type QuoteFormValues } from "~/schemas/quote";
import { api } from "~/trpc/react";

interface QuotesListProps {
  bookId: string;
  initialQuotes: Quote[];
  onQuotesChanged?: () => void;
}

export function QuotesList({
  bookId,
  initialQuotes,
  onQuotesChanged,
}: Readonly<QuotesListProps>) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Use tRPC mutations
  const createQuoteMutation = api.quote.create.useMutation({
    onSuccess: (newQuote) => {
      setQuotes((prev) => [...prev, newQuote]);
      setIsAddingQuote(false);
      toast.success("Quote added successfully");
      onQuotesChanged?.();
    },
    onError: () => {
      toast.error("Failed to add quote");
    },
  });

  const updateQuoteMutation = api.quote.update.useMutation({
    onSuccess: (updatedQuote) => {
      setQuotes((prev) =>
        prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q)),
      );
      setEditingQuoteId(null);
      toast.success("Quote updated successfully");
      onQuotesChanged?.();
    },
    onError: () => {
      toast.error("Failed to update quote");
    },
  });

  const deleteQuoteMutation = api.quote.delete.useMutation({
    onSuccess: (_, variables) => {
      setQuotes((prev) => prev.filter((q) => q.id !== variables.id));
      toast.success("Quote deleted successfully");
      onQuotesChanged?.();
    },
    onError: () => {
      toast.error("Failed to delete quote");
    },
  });

  const handleCreateQuote = (values: QuoteFormValues) => {
    createQuoteMutation.mutate(values);
  };

  const handleUpdateQuote = (values: QuoteFormValues) => {
    if (!editingQuoteId) return;
    updateQuoteMutation.mutate({ id: editingQuoteId, ...values });
  };

  const handleDeleteQuote = (quoteId: string) => {
    deleteQuoteMutation.mutate({ id: quoteId });
  };

  const handleEdit = (quoteId: string) => {
    setEditingQuoteId(quoteId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quotes</h2>
        {!isAddingQuote && (
          <Button
            onClick={() => setIsAddingQuote(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusCircle size={16} />
            <span>Add Quote</span>
          </Button>
        )}
      </div>

      {isAddingQuote && (
        <Card>
          <CardContent className="pt-6">
            <QuoteForm
              bookId={bookId}
              onCancel={() => setIsAddingQuote(false)}
              onSubmit={handleCreateQuote}
              isSubmitting={createQuoteMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {quotes.length === 0 && !isAddingQuote ? (
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
                    bookId={bookId}
                    defaultValues={quote}
                    onCancel={() => setEditingQuoteId(null)}
                    onSubmit={handleUpdateQuote}
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
                onDelete={handleDeleteQuote}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
