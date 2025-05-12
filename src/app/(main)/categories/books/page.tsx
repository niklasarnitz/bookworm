import React from "react";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import Link from "next/link";
import { CategoryBooksList } from "../_components/CategoryBooksList";
import { ChevronLeft } from "lucide-react";

export default function CategoryBooksPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center">
        <Link href="/categories">
          <Button variant="outline" size="sm" className="mr-2">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Categories
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Categories and Books"
        description="View all your books organized by categories"
      />

      <Card>
        <CardContent className="pt-6">
          <CategoryBooksList />
        </CardContent>
      </Card>
    </div>
  );
}
