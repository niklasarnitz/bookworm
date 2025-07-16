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

interface TvShowFilterProps {
  categories: RouterOutputs["category"]["getAll"];
}

export function TvShowFilter({ categories }: TvShowFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createQueryString = useCreateQueryString(searchParams);

  const currentCategoryId = searchParams.get("categoryId");
  const noCategory = searchParams.get("noCategory") === "true";
  const hasPhysicalItems = searchParams.get("hasPhysicalItems");

  const handleFilterChange = (
    categoryId?: string,
    isNoCategory = false,
    physicalItemsFilter?: string,
  ) => {
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
    } else if (physicalItemsFilter !== undefined) {
      const params = new URLSearchParams(searchParams.toString());
      if (physicalItemsFilter === "") {
        params.delete("hasPhysicalItems");
      } else {
        params.set("hasPhysicalItems", physicalItemsFilter);
      }
      queryString = params.toString();
    } else {
      // Clear all filters
      const params = new URLSearchParams(searchParams.toString());
      params.delete("categoryId");
      params.delete("noCategory");
      params.delete("hasPhysicalItems");
      queryString = params.toString();
    }

    router.push(`/tv-shows?${queryString}`);
  };

  const getCurrentFilterLabel = () => {
    if (hasPhysicalItems === "true") return "With Physical Items";
    if (hasPhysicalItems === "false") return "Without Physical Items";
    if (noCategory) return "Uncategorized";
    if (currentCategoryId) {
      const category = categories.find((cat) => cat.id === currentCategoryId);
      return category?.name ?? "Unknown Category";
    }
    return "All Categories";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {getCurrentFilterLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleFilterChange()}
          className={
            !currentCategoryId && !noCategory && !hasPhysicalItems
              ? "bg-accent"
              : ""
          }
        >
          All Categories
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleFilterChange(undefined, true)}
          className={noCategory ? "bg-accent" : ""}
        >
          Uncategorized
        </DropdownMenuItem>

        {categories.length > 0 && <DropdownMenuSeparator />}

        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => handleFilterChange(category.id)}
            className={currentCategoryId === category.id ? "bg-accent" : ""}
          >
            {category.name}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Filter by Physical Items</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleFilterChange(undefined, false, "true")}
          className={hasPhysicalItems === "true" ? "bg-accent" : ""}
        >
          With Physical Items
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleFilterChange(undefined, false, "false")}
          className={hasPhysicalItems === "false" ? "bg-accent" : ""}
        >
          Without Physical Items
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleFilterChange(undefined, false, "")}
          className={!hasPhysicalItems ? "bg-accent" : ""}
        >
          All TV Shows
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
