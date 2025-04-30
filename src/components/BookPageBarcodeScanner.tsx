"use client";

import { BarcodeScanner } from "~/components/books/BarcodeScanner";
import { useBooksPageStore } from "~/stores/booksPageStore/booksPageStore";

export const BookPageBarcodeScanner = () => {
  const {
    showBarcodeScanner,
    setScannedIsbn,
    setShowBarcodeScanner,
    setIsAddingBook,
    setShowAmazonSearch,
  } = useBooksPageStore();

  const handleBarcodeScanComplete = (isbn: string) => {
    setScannedIsbn(isbn);
    setShowBarcodeScanner(false);
    setIsAddingBook(true);
    setShowAmazonSearch(true);
  };

  if (!showBarcodeScanner) {
    return null;
  }

  return (
    <BarcodeScanner
      onScanComplete={handleBarcodeScanComplete}
      onClose={() => setShowBarcodeScanner(false)}
    />
  );
};
