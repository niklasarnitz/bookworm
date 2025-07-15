"use client";

import { Filter } from "lucide-react";
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
import { useCreateQueryString } from "~/hooks/useCreateQueryString";
import type { RouterOutputs } from "~/trpc/react";

interface MovieFilterProps {
  categories: RouterOutputs["category"]["getAll"];
}

export function MovieFilter({ categories }: MovieFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createQueryString = useCreateQueryString(searchParams);

  const currentCategoryId = searchParams.get("categoryId");
  const noCategory = searchParams.get("noCategory") === "true";

  const handleFilterChange = (categoryId?: string, isNoCategory = false) => {
    let queryString = "";

    if (isNoCategory) {
      queryString = createQueryString("noCategory", "true");
      // Remove categoryId if it exists
      const params = new URLSearchParams(queryString);
      params.delete("categoryId");
      queryString = params.toString();
    } else if (categoryId) {
      queryString = createQueryString("categoryId", categoryId);
      // Remove noCategory if it exists
      const params = new URLSearchParams(queryString);
      params.delete("noCategory");
      queryString = params.toString();
    } else {
      // Clear all filters
      const params = new URLSearchParams(searchParams.toString());
      params.delete("categoryId");
      params.delete("noCategory");
      queryString = params.toString();
    }

    router.push(`/movies?${queryString}`);
  };

  const getFilterLabel = () => {
    if (noCategory) return "No Category";
    if (currentCategoryId) {
      const category = categories.find((c) => c.id === currentCategoryId);
      return category?.name ?? "Unknown Category";
    }
    return "All Categories";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {getFilterLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleFilterChange()}
          className={!currentCategoryId && !noCategory ? "bg-muted" : ""}
        >
          All Categories
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleFilterChange(undefined, true)}
          className={noCategory ? "bg-muted" : ""}
        >
          No Category
        </DropdownMenuItem>

        {categories.length > 0 && <DropdownMenuSeparator />}

        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => handleFilterChange(category.id)}
            className={currentCategoryId === category.id ? "bg-muted" : ""}
          >
            {category.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
