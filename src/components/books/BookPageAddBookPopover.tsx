"use client";

import { ChevronDown, Plus, Scan, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useBooksPageStore } from "~/stores/booksPageStore/booksPageStore";

export const BookPageAddBookPopover = () => {
  const {
    showAddMenu,
    setShowAddMenu,
    setScannedIsbn,
    setIsAddingBook,
    setBookBeingEdited,
    setShowAmazonSearch,
    setShowBarcodeScanner,
  } = useBooksPageStore();

  const handleAddBook = (type: "manual" | "isbn" | "barcode") => {
    setScannedIsbn(undefined); // Reset any previously scanned ISBN

    if (type === "isbn") {
      setIsAddingBook(true);
      setBookBeingEdited(undefined);
      setShowAmazonSearch(true);
      setShowBarcodeScanner(false);
    } else if (type === "barcode") {
      // Don't open the form dialog immediately for barcode scanning
      setIsAddingBook(false);
      setBookBeingEdited(undefined);
      setShowAmazonSearch(false);
      setShowBarcodeScanner(true);
    } else {
      setIsAddingBook(true);
      setBookBeingEdited(undefined);
      setShowAmazonSearch(false);
      setShowBarcodeScanner(false);
    }

    setShowAddMenu(false);
  };

  return (
    <Popover open={showAddMenu} onOpenChange={setShowAddMenu}>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="mr-1 h-4 w-4" />
          Add Book <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <div className="flex flex-col py-1">
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleAddBook("manual")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create from Scratch
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleAddBook("isbn")}
          >
            <Search className="mr-2 h-4 w-4" />
            Import via ISBN
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleAddBook("barcode")}
          >
            <Scan className="mr-2 h-4 w-4" />
            Scan Barcode
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
