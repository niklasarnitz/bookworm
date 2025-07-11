import Link from "next/link";
import { MobileNav } from "~/components/MobileNav";
import { ThemeToggle } from "~/components/ThemeToggle";
import { UserAvatar } from "~/components/UserAvatar";
import { auth } from "~/server/auth";

export async function NavBar() {
  const session = await auth();

  // Don't render the navbar if user is not logged in
  if (!session?.user) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            BookWorm
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            <Link href="/" className="hover:underline">
              Books
            </Link>
            <Link href="/authors" className="hover:underline">
              Authors
            </Link>
            <Link href="/series" className="hover:underline">
              Series
            </Link>
            <Link href="/categories" className="hover:underline">
              Categories
            </Link>
            <Link href="/statistics" className="hover:underline">
              Statistics
            </Link>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-primary font-medium hover:underline"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden md:block">
            <UserAvatar user={session.user} />
          </div>

          <div className="md:hidden">
            <MobileNav session={session} />
          </div>
        </div>
      </div>
    </header>
  );
}
