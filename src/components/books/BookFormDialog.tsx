"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { BookForm } from "~/components/books/bookForm/BookForm";
import { useBooksPageStore } from "~/stores/booksPageStore/booksPageStore";
import type { Author } from "~/schemas/author";
import type { Series } from "~/schemas/series";

type BookFormDialogProps = {
  authors: Author[];
  series: Series[];
};

export function BookFormDialog({
  authors,
  series,
}: Readonly<BookFormDialogProps>) {
  const {
    isAddingBook,
    bookBeingEdited,
    scannedIsbn,
    setIsAddingBook,
    setBookBeingEdited,
    setShowAmazonSearch,
    setShowBarcodeScanner,
    setScannedIsbn,
  } = useBooksPageStore();

  const isEditing = !!bookBeingEdited?.id;

  const handleCloseDialog = () => {
    setIsAddingBook(false);
    setBookBeingEdited(undefined);
    setShowAmazonSearch(false);
    setShowBarcodeScanner(false);
    setScannedIsbn(undefined);
  };

  return (
    <Dialog
      open={isAddingBook || !!bookBeingEdited}
      onOpenChange={(open) => !open && handleCloseDialog()}
    >
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>
        <BookForm
          initialData={bookBeingEdited ?? undefined}
          authors={authors}
          series={series}
          onSuccess={handleCloseDialog}
          onCancel={handleCloseDialog}
          scannedIsbn={scannedIsbn}
        />
      </DialogContent>
    </Dialog>
  );
}
