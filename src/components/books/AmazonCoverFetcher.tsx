import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

const AmazonCoverSchema = z.object({
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().url(),
});

type AmazonCover = z.infer<typeof AmazonCoverSchema>;

interface AmazonCoverResponse {
  success: boolean;
  covers?: AmazonCover[];
  error?: string;
}

interface AmazonCoverFetcherProps {
  isbn: string | null | undefined;
  onCoverSelect: (coverUrl: string) => void;
  onClose: () => void;
}

export function AmazonCoverFetcher({
  isbn,
  onCoverSelect,
  onClose,
}: Readonly<AmazonCoverFetcherProps>) {
  const [error, setError] = useState<string | null>(null);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number | null>(
    null,
  );

  const coversQuery = api.amazon.getCoverByIsbn.useQuery(
    { isbn: isbn ?? "" },
    {
      enabled: !!isbn,
      retry: false,
    },
  );

  const validateCovers = (data: unknown): AmazonCover[] => {
    if (!data || typeof data !== "object" || !("covers" in data)) {
      return [];
    }

    const response = data as AmazonCoverResponse;

    if (
      !response.success ||
      !response.covers ||
      !Array.isArray(response.covers)
    ) {
      return [];
    }

    return response.covers.filter((cover): cover is AmazonCover => {
      const result = AmazonCoverSchema.safeParse(cover);
      return result.success;
    });
  };

  const covers = validateCovers(coversQuery.data);

  const handleCoverSelect = (coverUrl: string, index: number) => {
    setSelectedCoverIndex(index);
    onCoverSelect(coverUrl);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Cover</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          {coversQuery.isLoading ? (
            <div className="flex justify-center p-8 text-center">
              <div>
                <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <p>Searching for covers...</p>
              </div>
            </div>
          ) : (
            <>
              {covers.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {covers.map((cover, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer overflow-hidden rounded border transition-colors ${
                        selectedCoverIndex === index
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "hover:bg-gray-50"
                      } ${selectedCoverIndex !== null && selectedCoverIndex !== index ? "opacity-50" : ""}`}
                      onClick={() => {
                        if (selectedCoverIndex === null) {
                          handleCoverSelect(cover.coverUrl, index);
                        }
                      }}
                    >
                      <div className="relative aspect-[3/4] w-full">
                        <img
                          src={cover.coverUrl}
                          alt={`Cover for ${cover.title}`}
                          className="h-full w-full object-contain"
                          onLoad={() => {
                            // Preload image when it's displayed in the grid
                            const preloadImg = new Image();
                            preloadImg.src = cover.coverUrl;
                          }}
                        />
                        {selectedCoverIndex === index && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                            <div className="rounded-full bg-white p-2">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-2 text-xs">
                        <p className="line-clamp-2 font-medium">
                          {cover.title}
                        </p>
                        <p className="line-clamp-1 text-gray-600">
                          {cover.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !error && (
                  <p className="py-8 text-center text-gray-500">
                    No covers found for this ISBN.
                  </p>
                )
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={selectedCoverIndex !== null}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
