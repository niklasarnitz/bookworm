import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { z } from "zod";
import type { AmazonBookDetail } from "~/lib/amazon-scraper";
import { AmazonBookDetailSchema } from "~/lib/amazon-scraper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const AmazonBookSearchResultSchema = z.object({
  title: z.string(),
  author: z.string(),
  detailUrl: z.string().url(),
});

type AmazonBookSearchResult = z.infer<typeof AmazonBookSearchResultSchema>;

interface AmazonSearchResponse {
  success: boolean;
  results?: AmazonBookSearchResult[];
  error?: string;
}

interface AmazonDetailResponse {
  success: boolean;
  bookDetail?: AmazonBookDetail;
  error?: string;
}

interface AmazonBookSearchProps {
  onBookSelect: (bookData: AmazonBookDetail) => void;
  onClose: () => void;
}

export function AmazonBookSearch({
  onBookSelect,
  onClose,
}: Readonly<AmazonBookSearchProps>) {
  const [isbn, setIsbn] = useState("");
  const [selectedBookUrl, setSelectedBookUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"search" | "select" | "detail">("search");

  const searchQuery = api.amazon.searchByIsbn.useQuery(
    { isbn },
    {
      enabled: false,
      retry: false,
    },
  );

  const detailQuery = api.amazon.getBookDetail.useQuery(
    { detailUrl: selectedBookUrl ?? "" },
    {
      enabled: !!selectedBookUrl,
      retry: false,
    },
  );

  const validateSearchResults = (data: unknown): AmazonBookSearchResult[] => {
    if (!data || typeof data !== "object" || !("results" in data)) {
      return [];
    }

    const response = data as AmazonSearchResponse;

    if (
      !response.success ||
      !response.results ||
      !Array.isArray(response.results)
    ) {
      return [];
    }

    return response.results.filter(
      (result): result is AmazonBookSearchResult => {
        const validationResult = AmazonBookSearchResultSchema.safeParse(result);
        return validationResult.success;
      },
    );
  };

  const validateBookDetail = (data: unknown): AmazonBookDetail | null => {
    if (!data || typeof data !== "object" || !("bookDetail" in data)) {
      return null;
    }

    const response = data as AmazonDetailResponse;

    if (!response.success || !response.bookDetail) {
      return null;
    }

    const validationResult = AmazonBookDetailSchema.safeParse(
      response.bookDetail,
    );
    return validationResult.success ? response.bookDetail : null;
  };

  const searchResults = validateSearchResults(searchQuery.data);
  const bookDetail = validateBookDetail(detailQuery.data);

  const handleSearch = () => {
    if (!isbn.trim()) {
      setError("Please enter an ISBN");
      return;
    }

    setError(null);
    searchQuery
      .refetch()
      .then((result) => {
        const validResults = validateSearchResults(result.data);
        if (validResults.length > 0) {
          setStep("select");
        } else {
          setError("No books found with this ISBN");
        }
      })
      .catch((err) => {
        setError("An error occurred while searching for the book");
        console.error("Error searching for book:", err);
      });
  };

  const handleBookSelect = (detailUrl: string) => {
    setSelectedBookUrl(detailUrl);
    setStep("detail");
  };

  const handleConfirmSelection = () => {
    if (bookDetail) {
      onBookSelect(bookDetail);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === "search" && "Search Book by ISBN"}
            {step === "select" && "Select Book"}
            {step === "detail" && "Confirm Book Details"}
          </DialogTitle>
        </DialogHeader>

        <div>
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {step === "search" && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="isbn"
                  className="mb-2 block text-sm font-medium"
                >
                  Enter ISBN
                </label>
                <Input
                  id="isbn"
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="e.g., 9783765591150"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSearch}
                  disabled={searchQuery.isFetching}
                >
                  {searchQuery.isFetching ? "Searching..." : "Search"}
                </Button>
              </div>
            </>
          )}

          {step === "select" && searchResults.length > 0 && (
            <>
              <p className="mb-4 text-sm">
                Found {searchResults.length} results. Please select a book:
              </p>
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((book, index) => (
                  <div
                    key={index}
                    className="mb-2 cursor-pointer rounded border p-3 hover:bg-gray-50"
                    onClick={() => handleBookSelect(book.detailUrl)}
                  >
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep("search")}>
                  Back
                </Button>
              </div>
            </>
          )}

          {step === "detail" && bookDetail && (
            <>
              <div>
                <h3 className="text-lg font-semibold">{bookDetail.title}</h3>
                {bookDetail.subtitle && (
                  <p className="text-gray-600">{bookDetail.subtitle}</p>
                )}
                <p className="mt-2">
                  <span className="font-medium">Authors:</span>{" "}
                  {bookDetail.authors.join(", ")}
                </p>
                {bookDetail.publisher && (
                  <p>
                    <span className="font-medium">Publisher:</span>{" "}
                    {bookDetail.publisher}
                  </p>
                )}
                {bookDetail.isbn && (
                  <p>
                    <span className="font-medium">ISBN:</span> {bookDetail.isbn}
                  </p>
                )}
                {bookDetail.coverImageUrl && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={bookDetail.coverImageUrl}
                      alt={bookDetail.title}
                      className="max-h-60 object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep("select")}>
                  Back
                </Button>
                <Button onClick={handleConfirmSelection}>Use This Book</Button>
              </div>
            </>
          )}

          {(detailQuery.isLoading || searchQuery.isFetching) && (
            <div className="flex justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
