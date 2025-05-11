"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  SortAsc,
  SortDesc,
  UserCircle2,
  Library,
  BookOpen,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface BookSortProps {
  className?: string;
}

export function BookSort({ className }: Readonly<BookSortProps>) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const getSortIcon = () => {
    switch (sortBy) {
      case "name":
        return sortOrder === "asc" ? (
          <ArrowDownAZ className="h-4 w-4" />
        ) : (
          <ArrowUpAZ className="h-4 w-4" />
        );
      case "author":
        return <UserCircle2 className="h-4 w-4" />;
      case "series":
        return <Library className="h-4 w-4" />;
      case "readDate":
        return <BookOpen className="h-4 w-4" />;
      case "createdAt":
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "name":
        return `Title (${sortOrder === "asc" ? "A to Z" : "Z to A"})`;
      case "author":
        return `Author (${sortOrder === "asc" ? "A to Z" : "Z to A"})`;
      case "series":
        return `Series (${sortOrder === "asc" ? "A to Z" : "Z to A"})`;
      case "readDate":
        return `Read Date (${sortOrder === "asc" ? "Oldest" : "Newest"})`;
      case "createdAt":
      default:
        return `Date Added (${sortOrder === "asc" ? "Oldest" : "Newest"})`;
    }
  };

  const handleSortChange = (newSortBy: string, newSortOrder?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);

    // If sort order is explicitly provided, use it
    if (newSortOrder) {
      params.set("sortOrder", newSortOrder);
    }
    // If user clicks on the same sort field, toggle order
    else if (sortBy === newSortBy) {
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    }
    // Otherwise, set default sort order based on field type
    else {
      // Set default sort order based on field type
      const isAlphabetical = ["name", "author", "series"].includes(newSortBy);
      params.set("sortOrder", isAlphabetical ? "asc" : "desc");
    }

    // Reset pagination when sorting changes
    if (params.has("page")) {
      params.delete("page");
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <span className="inline-flex items-center gap-1">
              {getSortIcon()}
              {getSortLabel()}
              {sortOrder === "desc" ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort Books By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => handleSortChange("createdAt")}
              className={sortBy === "createdAt" ? "bg-accent" : ""}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Date Added</span>
              {sortBy === "createdAt" && (
                <span className="ml-auto">
                  {sortOrder === "desc" ? "Newest" : "Oldest"}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange("name")}
              className={sortBy === "name" ? "bg-accent" : ""}
            >
              <ArrowDownAZ className="mr-2 h-4 w-4" />
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
              <UserCircle2 className="mr-2 h-4 w-4" />
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
            <DropdownMenuItem
              onClick={() => handleSortChange("readDate")}
              className={sortBy === "readDate" ? "bg-accent" : ""}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              <span>Read Date</span>
              {sortBy === "readDate" && (
                <span className="ml-auto">
                  {sortOrder === "desc" ? "Newest" : "Oldest"}
                </span>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => handleSortChange(sortBy, "asc")}>
              <ArrowDownAZ className="mr-2 h-4 w-4" />
              <span>Ascending Order</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange(sortBy, "desc")}>
              <ArrowUpAZ className="mr-2 h-4 w-4" />
              <span>Descending Order</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
