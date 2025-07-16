"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateQueryString } from "~/hooks/useCreateQueryString";

export function TvShowSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createQueryString = useCreateQueryString(searchParams);
  const [searchValue, setSearchValue] = useState(
    searchParams.get("query") ?? "",
  );

  const handleSearch = (value: string) => {
    const newQueryString = createQueryString("query", value);
    router.push(`/tv-shows?${newQueryString}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchValue);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    handleSearch("");
  };

  return (
    <div className="relative max-w-sm flex-1">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder="Search TV shows..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-9"
      />
      {searchValue && (
        <button
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
        >
          ×
        </button>
      )}
    </div>
  );
}
