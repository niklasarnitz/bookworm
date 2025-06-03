import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { BookSearchDialog } from "./BookSearchDialog";
import type { BookDetail } from "~/lib/book-metadata/types";
import { Search } from "lucide-react";

interface BookMetadataSearchProps {
  onBookSelect: (bookData: BookDetail) => void;
  isbn?: string | null;
  buttonLabel?: string;
}

/**
 * A component for searching and fetching book metadata from all available services
 */
export function BookMetadataSearch({
  onBookSelect,
  isbn,
  buttonLabel = "Search Metadata",
}: Readonly<BookMetadataSearchProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        disabled={!isbn}
        className="text-xs"
        aria-label={
          isbn
            ? "Search for book metadata using ISBN"
            : "ISBN required to search for metadata"
        }
      >
        <Search className="mr-1 h-3 w-3" />
        {buttonLabel}
      </Button>

      {isDialogOpen && (
        <BookSearchDialog
          onBookSelect={onBookSelect}
          onClose={handleCloseDialog}
          initialIdentifier={isbn ?? ""}
        />
      )}
    </>
  );
}
