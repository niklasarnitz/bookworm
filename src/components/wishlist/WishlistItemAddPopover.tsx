"use client";

import { useState } from "react";
import { ChevronDown, Plus, Scan, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useRouter } from "next/navigation";

export const WishlistItemAddPopover = () => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const router = useRouter();

  const handleAddWishlistItem = (type: "manual" | "isbn" | "barcode") => {
    // For now we'll just redirect to the add page, in the future this could
    // support import from Amazon like the book functionality does
    router.push("/wishlist/new");
    setShowAddMenu(false);
  };

  return (
    <Popover open={showAddMenu} onOpenChange={setShowAddMenu}>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="mr-1 h-4 w-4" />
          Add to Wishlist <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <div className="flex flex-col py-1">
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleAddWishlistItem("manual")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create from Scratch
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleAddWishlistItem("isbn")}
          >
            <Search className="mr-2 h-4 w-4" />
            Import via ISBN
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
