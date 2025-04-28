import { type ReactNode } from "react";
import { requireAdmin } from "~/server/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This will redirect if the user is not an admin
  await requireAdmin();

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      {children}
    </div>
  );
}
