"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SortAsc,
  ChevronDown,
  CalendarDays,
  AlignLeft,
  Users,
  Library,
} from "lucide-react";

interface WishlistSortProps {
  className?: string;
}

export function WishlistSort({ className }: Readonly<WishlistSortProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const getSortLabel = () => {
    switch (sortBy) {
      case "name":
        return "Title";
      case "author":
        return "Author";
      case "series":
        return "Series";
      case "createdAt":
      default:
        return "Date Added";
    }
  };

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);

    // If user is changing to a different sort field
    if (newSortBy !== sortBy) {
      // Set default sort order based on field type
      const isAlphabetical = ["name", "author", "series"].includes(newSortBy);
      params.set("sortOrder", isAlphabetical ? "asc" : "desc");
    }
    // If user clicks on the same sort field, toggle order
    else {
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    }

    // Reset pagination when sorting changes
    if (params.has("page")) {
      params.delete("page");
    }

    router.push(`/wishlist?${params.toString()}`);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <SortAsc className="h-3.5 w-3.5" />
            <span>Sort: {getSortLabel()}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => handleSortChange("createdAt")}
            className={sortBy === "createdAt" ? "bg-accent" : ""}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Date Added</span>
            {sortBy === "createdAt" && (
              <span className="ml-auto">
                {sortOrder === "asc" ? "Oldest first" : "Newest first"}
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortChange("name")}
            className={sortBy === "name" ? "bg-accent" : ""}
          >
            <AlignLeft className="mr-2 h-4 w-4" />
            <span>Title</span>
            {sortBy === "name" && (
              <span className="ml-auto">
                {sortOrder === "asc" ? "A to Z" : "Z to A"}
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortChange("author")}
            className={sortBy === "author" ? "bg-accent" : ""}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Author</span>
            {sortBy === "author" && (
              <span className="ml-auto">
                {sortOrder === "asc" ? "A to Z" : "Z to A"}
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortChange("series")}
            className={sortBy === "series" ? "bg-accent" : ""}
          >
            <Library className="mr-2 h-4 w-4" />
            <span>Series</span>
            {sortBy === "series" && (
              <span className="ml-auto">
                {sortOrder === "asc" ? "A to Z" : "Z to A"}
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
