"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "title", label: "Title" },
  { value: "originalReleaseYear", label: "Release Year" },
  { value: "createdAt", label: "Date Added" },
] as const;

export function TvShowSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") ?? "title";
  const currentSortOrder = searchParams.get("sortOrder") ?? "asc";

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`/tv-shows?${params.toString()}`);
  };

  const currentSortLabel =
    sortOptions.find((option) => option.value === currentSortBy)?.label ??
    "Title";

  const getSortIcon = () => {
    if (currentSortOrder === "asc") {
      return <ArrowUp className="h-4 w-4" />;
    } else {
      return <ArrowDown className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          {currentSortLabel}
          {getSortIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {sortOptions.map((option) => (
          <div key={option.value}>
            <DropdownMenuItem
              onClick={() => handleSortChange(option.value, "asc")}
              className={
                currentSortBy === option.value && currentSortOrder === "asc"
                  ? "bg-accent"
                  : ""
              }
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              {option.label} (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange(option.value, "desc")}
              className={
                currentSortBy === option.value && currentSortOrder === "desc"
                  ? "bg-accent"
                  : ""
              }
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              {option.label} (Z-A)
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
