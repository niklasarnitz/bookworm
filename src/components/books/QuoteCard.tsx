"use client";

import { useState } from "react";
import { type Quote } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2, Quote as QuoteIcon } from "lucide-react";
import { QuoteForm } from "./QuoteForm";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { type QuoteFormValues } from "~/schemas/quote";

interface QuoteCardProps {
  quote: Quote;
  onQuoteUpdated?: (quote: Quote) => void;
  onQuoteDeleted?: (quoteId: string) => void;
}

export function QuoteCard({
  quote,
  onQuoteUpdated,
  onQuoteDeleted,
}: Readonly<QuoteCardProps>) {
  const [isEditing, setIsEditing] = useState(false);

  // Use tRPC mutations instead of fetch
  const updateQuoteMutation = api.quote.update.useMutation({
    onSuccess: (updatedQuote) => {
      setIsEditing(false);
      toast.success("Quote updated successfully");
      if (onQuoteUpdated) onQuoteUpdated(updatedQuote);
    },
    onError: () => {
      toast.error("Failed to update quote");
    },
  });

  const deleteQuoteMutation = api.quote.delete.useMutation({
    onSuccess: () => {
      toast.success("Quote deleted successfully");
      if (onQuoteDeleted) onQuoteDeleted(quote.id);
    },
    onError: () => {
      toast.error("Failed to delete quote");
    },
  });

  const handleSubmit = (values: QuoteFormValues) => {
    updateQuoteMutation.mutate({
      id: quote.id,
      ...values,
    });
  };

  const handleDelete = () => {
    deleteQuoteMutation.mutate({ id: quote.id });
  };

  const pageRange = quote.pageEnd
    ? `${quote.pageStart}-${quote.pageEnd}`
    : quote.pageStart;

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <QuoteForm
            bookId={quote.bookId}
            defaultValues={quote}
            onCancel={() => setIsEditing(false)}
            onSubmit={handleSubmit}
            isEdit
            isSubmitting={updateQuoteMutation.isPending}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            {quote.title && (
              <CardTitle className="text-lg">{quote.title}</CardTitle>
            )}
            <CardDescription className="mt-1 flex items-center gap-1">
              <QuoteIcon size={14} />
              <span>Page {pageRange}</span>
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={16} />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this quote? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteQuoteMutation.isPending}
                  >
                    {deleteQuoteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground italic">
          &quot;{quote.text}&quot;
        </div>
      </CardContent>
    </Card>
  );
}
