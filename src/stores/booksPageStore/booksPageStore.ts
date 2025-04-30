import { create } from "zustand";
import type { RouterOutputs } from "~/trpc/react";

type Book = RouterOutputs["book"]["getAll"]["books"][number];

type BookListStoreProperties = {
  isAddingBook: boolean;
  bookBeingEdited: Book | undefined;
  showAddMenu: boolean;
  showAmazonSearch: boolean;
  showBarcodeScanner: boolean;
  scannedIsbn: string | undefined;
};

type BooksListStoreActions = {
  setIsAddingBook: (isAddingBook: boolean) => void;
  setBookBeingEdited: (bookBeingEdited: Book | undefined) => void;
  setShowAddMenu: (showAddMenu: boolean) => void;
  setShowAmazonSearch: (showAmazonSearch: boolean) => void;
  setShowBarcodeScanner: (showBarcodeScanner: boolean) => void;
  setScannedIsbn: (scannedIsbn: string | undefined) => void;
};

type BookListStoreState = BookListStoreProperties & BooksListStoreActions;

export const useBooksPageStore = create<BookListStoreState>((set) => ({
  isAddingBook: false,
  bookBeingEdited: undefined as Book | undefined,
  showAddMenu: false,
  showAmazonSearch: false,
  showBarcodeScanner: false,
  scannedIsbn: undefined as string | undefined,
  setIsAddingBook: (isAddingBook: boolean) => set({ isAddingBook }),
  setBookBeingEdited: (bookBeingEdited: Book | undefined) =>
    set({ bookBeingEdited }),
  setShowAddMenu: (showAddMenu: boolean) => set({ showAddMenu }),
  setShowAmazonSearch: (showAmazonSearch: boolean) => set({ showAmazonSearch }),
  setShowBarcodeScanner: (showBarcodeScanner: boolean) =>
    set({ showBarcodeScanner }),
  setScannedIsbn: (scannedIsbn: string | undefined) => set({ scannedIsbn }),
}));
