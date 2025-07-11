import Link from "next/link";
import React from "react";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { BookOpen } from "lucide-react";
import { CategoryManager } from "~/components/categories/CategoryManager";

export default function CategoryPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Categories" description="Manage your book categories">
        <Link href="/categories/books">
          <Button className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            View Books by Category
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <CategoryManager />
          <div className="mt-4 flex gap-2">
            <Link href="/api/categories/tree">
              <Button variant="outline">Generate Category Tree</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
