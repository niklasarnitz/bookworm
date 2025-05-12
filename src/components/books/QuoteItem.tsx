"use client";

import { type Quote } from "@prisma/client";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Pencil, Trash2, Quote as QuoteIcon } from "lucide-react";
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

interface QuoteItemProps {
  quote: Quote;
  onEdit: (quoteId: string) => void;
  onDelete: (quoteId: string) => void;
}

export function QuoteItem({
  quote,
  onEdit,
  onDelete,
}: Readonly<QuoteItemProps>) {
  const pageRange = quote.pageEnd
    ? `${quote.pageStart}-${quote.pageEnd}`
    : quote.pageStart;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            {quote.title && (
              <h3 className="text-lg font-semibold">{quote.title}</h3>
            )}
            <div className="text-muted-foreground mb-3 flex items-center gap-1 text-sm">
              <QuoteIcon size={14} />
              <span>Page {pageRange}</span>
            </div>
            <p className="italic">{quote.text}</p>
          </div>
          <div className="ml-4 flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(quote.id)}
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
                  <AlertDialogAction onClick={() => onDelete(quote.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
