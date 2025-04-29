import React from "react";
import { AuthorTable } from "~/app/authors/_components/AuthorTable";
import { AuthorDialog } from "~/app/authors/_components/AuthorDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function AuthorsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Authors</CardTitle>
            <CardDescription>Manage your book authors</CardDescription>
          </div>

          <div className="ml-auto">
            <AuthorDialog />
          </div>
        </CardHeader>

        <CardContent>
          <div className="mt-4">
            <AuthorTable />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
