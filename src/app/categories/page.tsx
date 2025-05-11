import Link from "next/link";
import React from "react";
import { CategoryManager } from "~/app/categories/_components/CategoryManager";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function CategoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>Manage your book categories</CardDescription>
      </CardHeader>
      <CardContent>
        <CategoryManager />
        <Link href="/api/categories/tree">
          <Button className="mt-4">Generate Category Tree</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
