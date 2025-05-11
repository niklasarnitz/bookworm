"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateQueryString } from "~/hooks/useCreateQueryString";

export function BookSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("query") ?? "",
  );

  const createQueryString = useCreateQueryString(searchParams);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?${createQueryString("query", searchValue)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
      <div className="relative flex-grow">
        <Input
          placeholder="Search book name, subtitle, author name, or ISBN..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pr-4"
        />
      </div>
      <Button type="submit" className="shrink-0">
        <Search className="mr-1 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
