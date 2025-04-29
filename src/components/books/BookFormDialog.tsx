"use client";

import { type Book } from "~/schemas/book";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { BookForm } from "~/components/books/bookForm/BookForm";
import type { RouterOutputs } from "~/trpc/react";

interface BookFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Book & { id?: string }>;
  authors: RouterOutputs["author"]["getAll"] | undefined;
  series: RouterOutputs["series"]["getAll"] | undefined;
  onSuccess?: () => void;
  title?: string;
}

export function BookFormDialog({
  isOpen,
  onClose,
  initialData,
  authors,
  series,
  onSuccess,
  title,
}: Readonly<BookFormDialogProps>) {
  const isEditing = !!initialData?.id;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {title ?? (isEditing ? "Edit Book" : "Add New Book")}
          </DialogTitle>
        </DialogHeader>
        <BookForm
          initialData={initialData}
          authors={authors}
          series={series}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
