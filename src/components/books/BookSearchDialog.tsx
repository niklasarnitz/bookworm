import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type BookDetail } from "~/lib/book-metadata/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { type ServiceSearchResults } from "~/server/api/routers/bookMetadata";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface BookSearchDialogProps {
  onBookSelect: (bookData: BookDetail) => void;
  onClose: () => void;
  initialIdentifier?: string;
}

export function BookSearchDialog({
  onBookSelect,
  onClose,
  initialIdentifier = "",
}: Readonly<BookSearchDialogProps>) {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDetailUrl, setSelectedDetailUrl] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"search" | "select" | "detail">("search");
  const [autoSearchTriggered, setAutoSearchTriggered] = useState(false);

  // Use the new search all services query
  const searchAllQuery = api.bookMetadata.searchAllServices.useQuery(
    { identifier },
    { enabled: false, retry: false },
  );

  // Detail query when a specific book is selected
  const detailQuery = api.bookMetadata.getBookDetail.useQuery(
    {
      serviceId: selectedService ?? "",
      detailUrl: selectedDetailUrl ?? "",
    },
    { enabled: !!selectedService && !!selectedDetailUrl, retry: false },
  );

  // Count total results across all services
  const totalResultsCount =
    searchAllQuery.data?.reduce(
      (sum, service) => sum + service.results.length,
      0,
    ) ?? 0;

  // Auto search when initialIdentifier is provided
  useEffect(() => {
    if (initialIdentifier && !autoSearchTriggered) {
      setAutoSearchTriggered(true);
      void handleSearch();
    }
  }, [initialIdentifier]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    if (!identifier) {
      setError("Please enter an ISBN or other identifier to search");
      return;
    }

    try {
      setError(null);
      setStep("select");
      await searchAllQuery.refetch();

      if (searchAllQuery.error) {
        throw new Error(searchAllQuery.error.message);
      }

      if (
        !searchAllQuery.data ||
        searchAllQuery.data.every((service) => service.results.length === 0)
      ) {
        throw new Error("No results found in any of the services.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error searching for books";
      setError(errorMessage);
      setStep("search");
    }
  };

  const handleSelectBook = async (serviceId: string, detailUrl: string) => {
    try {
      setError(null);
      setSelectedService(serviceId);
      setSelectedDetailUrl(detailUrl);
      setStep("detail");

      // Wait for the query to complete
      await detailQuery.refetch();

      if (detailQuery.error) {
        throw new Error(detailQuery.error.message);
      }

      if (!detailQuery.data) {
        throw new Error("Failed to get book details.");
      }

      // Return the book data to the parent component
      onBookSelect(detailQuery.data);
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error getting book details";
      setError(errorMessage);
    }
  };

  // Render service results with accordions
  const renderServiceResults = (services: ServiceSearchResults[]) => {
    const servicesWithResults = services.filter(
      (service) => service.results.length > 0,
    );

    if (servicesWithResults.length === 0) {
      return (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No results found in any service
        </div>
      );
    }

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={servicesWithResults[0]?.serviceId}
      >
        {servicesWithResults.map((service) => (
          <AccordionItem key={service.serviceId} value={service.serviceId}>
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2">
                {service.serviceName}
                <Badge variant="secondary" className="ml-2">
                  {service.results.length}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {service.results.map((result, index) => (
                  <div
                    key={`${service.serviceId}-${index}`}
                    className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors"
                    onClick={() =>
                      void handleSelectBook(service.serviceId, result.detailUrl)
                    }
                  >
                    <div className="flex-grow">
                      <h3 className="font-medium">{result.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {result.author}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleSelectBook(
                          service.serviceId,
                          result.detailUrl,
                        );
                      }}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Search Book Metadata</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search Form */}
        {step === "search" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter ISBN or other identifier"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && identifier) {
                    void handleSearch();
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={!identifier || searchAllQuery.isLoading}
              >
                {searchAllQuery.isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Enter an ISBN or other identifier to search across all available
              sources.
            </p>
          </div>
        )}

        {/* Results List */}
        {step === "select" && searchAllQuery.data && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium">
                Found {totalResultsCount} results across{" "}
                {searchAllQuery.data.filter((s) => s.results.length > 0).length}{" "}
                services
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("search")}
              >
                Back to Search
              </Button>
            </div>

            {renderServiceResults(searchAllQuery.data)}

            {/* Service errors section */}
            {searchAllQuery.data?.filter((s) => s.error).length > 0 && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Some services encountered errors:
                  </p>
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-amber-700 dark:text-amber-400">
                  {searchAllQuery.data
                    .filter((s) => s.error)
                    .map((s) => (
                      <li key={s.serviceId}>
                        {s.serviceName}: {s.error}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Loading Detail */}
        {step === "detail" && detailQuery.isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm">Loading book details...</p>
          </div>
        )}

        {/* Loading Search Results */}
        {searchAllQuery.isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm">Searching across all services...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
