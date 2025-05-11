import Link from "next/link";
import React from "react";
import { CategoryManager } from "~/app/categories/_components/CategoryManager";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";

export default function CategoryPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Categories"
        description="Manage your book categories"
      />

      <Card>
        <CardContent className="pt-6">
          <CategoryManager />
          <Link href="/api/categories/tree">
            <Button className="mt-4">Generate Category Tree</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
