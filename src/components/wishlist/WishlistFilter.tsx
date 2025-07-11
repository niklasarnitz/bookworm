"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useCreateQueryString } from "~/hooks/useCreateQueryString";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SearchIcon, X, Filter, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { AuthorSearch } from "~/components/books/AuthorSearch";
import { SeriesSearch } from "~/components/books/SeriesSearch";

interface WishlistFilterProps {
  className?: string;
}

export function WishlistFilter({ className }: Readonly<WishlistFilterProps>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("query") ?? "",
  );
  const [activeFilters, setActiveFilters] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>(
    [],
  );

  const { data: authorsData } = api.author.getAll.useQuery();
  const { data: seriesData } = api.series.getAll.useQuery();

  const createQueryString = useCreateQueryString(searchParams);

  useEffect(() => {
    let count = 0;
    if (searchParams.has("query")) count++;
    if (searchParams.has("authorId")) count++;
    if (searchParams.has("seriesId")) count++;
    setActiveFilters(count);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/wishlist?${createQueryString("query", searchValue)}`);
  };

  const handleToggleFilter = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has(name)) {
      params.delete(name);
    } else {
      params.set(name, "true");
    }
    router.push(`/wishlist?${params.toString()}`);
  };

  const handleFilterChange = (type: string, value: string | undefined) => {
    router.push(`/wishlist?${createQueryString(type, value)}`);
  };

  const clearAllFilters = () => {
    router.push("/wishlist");
  };

  const selectedAuthor = searchParams.has("authorId")
    ? authorsData?.authors.find((a) => a.id === searchParams.get("authorId"))
        ?.name
    : undefined;

  const selectedSeries = searchParams.has("seriesId")
    ? seriesData?.series.find((s) => s.id === searchParams.get("seriesId"))
        ?.name
    : undefined;

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          type="search"
          placeholder="Search wishlist..."
          className="bg-background pl-8"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>

      <div className="sm:hidden">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilters > 0 && (
            <span className="bg-primary text-primary-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
              {activeFilters}
            </span>
          )}
          <ChevronRight
            className={`ml-auto h-4 w-4 transition-transform ${
              filterOpen ? "rotate-90" : ""
            }`}
          />
        </Button>
      </div>

      <div className={`space-y-4 ${filterOpen ? "block" : "hidden"} sm:block`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filters</h3>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-0 text-xs text-blue-500"
              >
                Clear all
              </Button>
            )}
          </div>

          <Accordion
            type="multiple"
            value={activeAccordionItems}
            onValueChange={setActiveAccordionItems}
            className="w-full"
          >
            <AccordionItem value="author">
              <AccordionTrigger className="text-sm">Author</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <AuthorSearch
                    value={
                      searchParams.get("authorId")
                        ? {
                            id: searchParams.get("authorId")!,
                            name: selectedAuthor || "",
                          }
                        : undefined
                    }
                    onChange={(author) =>
                      handleFilterChange("authorId", author?.id)
                    }
                    placeholder="Filter by author..."
                  />
                  {searchParams.has("authorId") && (
                    <button
                      onClick={() => handleFilterChange("authorId", undefined)}
                      className="text-muted-foreground hover:text-foreground mt-2 flex items-center text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear author filter
                    </button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="series">
              <AccordionTrigger className="text-sm">Series</AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <SeriesSearch
                    value={
                      searchParams.get("seriesId")
                        ? {
                            id: searchParams.get("seriesId")!,
                            name: selectedSeries || "",
                          }
                        : undefined
                    }
                    onChange={(series) =>
                      handleFilterChange("seriesId", series?.id)
                    }
                    placeholder="Filter by series..."
                  />
                  {searchParams.has("seriesId") && (
                    <button
                      onClick={() => handleFilterChange("seriesId", undefined)}
                      className="text-muted-foreground hover:text-foreground mt-2 flex items-center text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear series filter
                    </button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
