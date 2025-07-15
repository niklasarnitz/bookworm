"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Search, Filter, X } from "lucide-react";
import { Label } from "~/components/ui/label";
import Link from "next/link";
import { CategorySearch } from "./CategorySearch";
import { AuthorSearch } from "./AuthorSearch";
import { SeriesSearch } from "./SeriesSearch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { api } from "~/trpc/react";
import { useCreateQueryString } from "~/hooks/useCreateQueryString";

export interface BookFilterProps {
  className?: string;
}

export function BookFilter({ className }: Readonly<BookFilterProps>) {
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

  const selectedCategoryId = searchParams.get("categoryId") ?? undefined;
  const { data: categoryPath } = api.category.getPath.useQuery(
    { id: selectedCategoryId ?? "" },
    { enabled: !!selectedCategoryId },
  );

  const createQueryString = useCreateQueryString(searchParams);

  useEffect(() => {
    let count = 0;
    if (searchParams.has("query")) count++;
    if (searchParams.has("authorId")) count++;
    if (searchParams.has("seriesId")) count++;
    if (searchParams.has("categoryId")) count++;
    if (searchParams.has("noCover")) count++;
    if (searchParams.has("noCategory")) count++;
    if (searchParams.has("onlyRead")) count++;
    setActiveFilters(count);

    // Set active accordion items based on active filters
    const items: string[] = [];
    if (searchParams.has("authorId")) items.push("author");
    if (searchParams.has("seriesId")) items.push("series");
    if (searchParams.has("categoryId")) items.push("category");
    if (
      searchParams.has("noCover") ||
      searchParams.has("noCategory") ||
      searchParams.has("onlyRead")
    )
      items.push("special");
    setActiveAccordionItems(items);
  }, [searchParams]);

  const handleCheckboxChange = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has(name)) {
      params.delete(name);
    } else {
      params.set(name, "true");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleFilterChange = (type: string, value: string | undefined) => {
    router.push(`/?${createQueryString(type, value)}`);
  };

  const clearAllFilters = () => {
    router.push("/");
  };

  const selectedAuthor = searchParams.has("authorId")
    ? authorsData?.authors.find((a) => a.id === searchParams.get("authorId"))
        ?.name
    : undefined;

  const selectedSeries = searchParams.has("seriesId")
    ? seriesData?.series.find((s) => s.id === searchParams.get("seriesId"))
        ?.name
    : undefined;

  const selectedCategory =
    categoryPath && categoryPath.length > 0
      ? categoryPath[categoryPath.length - 1]?.name
      : undefined;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="mr-1 h-3 w-3" /> Clear All Filters
          </Button>
        )}

        <Button
          variant={filterOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <Filter className="mr-1 h-3 w-3" />
          Filters
          {activeFilters > 0 && (
            <span className="bg-primary-foreground text-primary ml-1 rounded-full px-1.5 py-0.5 text-xs">
              {activeFilters}
            </span>
          )}
        </Button>

        {/* Show active filters as badges */}
        {searchParams.has("authorId") &&
          (authorsData?.authors.length ?? 0) > 0 && (
            <div className="border-primary/20 bg-primary/10 text-primary dark:bg-primary/20 flex items-center rounded-full border px-2 py-1 text-xs">
              <span className="mr-1">Author:</span>
              <span className="font-medium">{selectedAuthor ?? "Unknown"}</span>
              <Link
                href={`/?${createQueryString("authorId", "")}`}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </Link>
            </div>
          )}

        {searchParams.has("seriesId") &&
          (seriesData?.series.length ?? 0) > 0 && (
            <div className="border-secondary/20 bg-secondary/10 text-secondary-foreground dark:bg-secondary/20 flex items-center rounded-full border px-2 py-1 text-xs">
              <span className="mr-1">Series:</span>
              <span className="font-medium">{selectedSeries ?? "Unknown"}</span>
              <Link
                href={`/?${createQueryString("seriesId", "")}`}
                className="ml-1"
              >
                <X className="h-3 w-3" />
              </Link>
            </div>
          )}

        {searchParams.has("categoryId") && selectedCategory && (
          <div className="border-accent/20 bg-accent/10 text-accent-foreground dark:bg-accent/20 flex items-center rounded-full border px-2 py-1 text-xs">
            <span className="mr-1">Category:</span>
            <span className="font-medium">{selectedCategory}</span>
            <Link
              href={`/?${createQueryString("categoryId", "")}`}
              className="ml-1"
            >
              <X className="h-3 w-3" />
            </Link>
          </div>
        )}

        {searchParams.has("noCover") && (
          <div className="border-muted bg-muted/50 text-muted-foreground flex items-center rounded-full border px-2 py-1 text-xs">
            <span className="font-medium">Without Cover</span>
            <Link
              href={`/?${createQueryString("noCover", "")}`}
              className="ml-1"
            >
              <X className="h-3 w-3" />
            </Link>
          </div>
        )}

        {searchParams.has("noCategory") && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20 flex items-center rounded-full border px-2 py-1 text-xs">
            <span className="font-medium">Without Category</span>
            <Link
              href={`/?${createQueryString("noCategory", "")}`}
              className="ml-1"
            >
              <X className="h-3 w-3" />
            </Link>
          </div>
        )}

        {searchParams.has("query") && (
          <div className="border-muted bg-muted/50 text-muted-foreground flex items-center rounded-full border px-2 py-1 text-xs">
            <span className="mr-1">Search:</span>
            <span className="font-medium">{searchParams.get("query")}</span>
            <Link href={`/?${createQueryString("query", "")}`} className="ml-1">
              <X className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Filter panel with search fields - only shown when filterOpen is true */}
      {filterOpen && (
        <div className="bg-card rounded-lg border p-4">
          <Accordion
            type="multiple"
            value={activeAccordionItems}
            onValueChange={setActiveAccordionItems}
            className="w-full"
          >
            <AccordionItem value="author" className="border-b">
              <AccordionTrigger>
                <span className="flex items-center">
                  Author
                  {searchParams.has("authorId") && (
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 ml-2 rounded-full px-1.5 py-0.5 text-xs">
                      Active
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 py-1">
                  <AuthorSearch
                    value={searchParams.get("authorId") ?? undefined}
                    onChange={(author) =>
                      handleFilterChange("authorId", author?.id)
                    }
                    placeholder="Search and select an author..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="series" className="border-b">
              <AccordionTrigger>
                <span className="flex items-center">
                  Series
                  {searchParams.has("seriesId") && (
                    <span className="bg-secondary/10 text-secondary-foreground dark:bg-secondary/20 ml-2 rounded-full px-1.5 py-0.5 text-xs">
                      Active
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 py-1">
                  <SeriesSearch
                    value={searchParams.get("seriesId") ?? undefined}
                    onChange={(series) =>
                      handleFilterChange("seriesId", series?.id)
                    }
                    placeholder="Search and select a series..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="category" className="border-b">
              <AccordionTrigger>
                <span className="flex items-center">
                  Category
                  {searchParams.has("categoryId") && (
                    <span className="bg-accent/10 text-accent-foreground dark:bg-accent/20 ml-2 rounded-full px-1.5 py-0.5 text-xs">
                      Active
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 py-1">
                  <CategorySearch
                    value={searchParams.get("categoryId") ?? undefined}
                    onChange={(value) =>
                      handleFilterChange("categoryId", value)
                    }
                    placeholder="Search and select a category..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="special" className="border-b-0">
              <AccordionTrigger>
                <span className="flex items-center">
                  Special Filters
                  {(searchParams.has("noCover") ||
                    searchParams.has("noCategory") ||
                    searchParams.has("onlyRead")) && (
                    <span className="bg-muted text-muted-foreground ml-2 rounded-full px-1.5 py-0.5 text-xs">
                      Active
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 py-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noCover"
                      checked={searchParams.has("noCover")}
                      onCheckedChange={() => handleCheckboxChange("noCover")}
                    />
                    <Label htmlFor="noCover" className="text-sm">
                      Books without covers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noCategory"
                      checked={searchParams.has("noCategory")}
                      onCheckedChange={() => handleCheckboxChange("noCategory")}
                    />
                    <Label htmlFor="noCategory" className="text-sm">
                      Books without categories
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onlyRead"
                      checked={searchParams.has("onlyRead")}
                      onCheckedChange={() => handleCheckboxChange("onlyRead")}
                    />
                    <Label htmlFor="onlyRead" className="text-sm">
                      Only read books
                    </Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
