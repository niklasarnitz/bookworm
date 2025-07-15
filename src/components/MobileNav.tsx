"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import type { Session } from "next-auth";
import { UserAvatar } from "~/components/UserAvatar";

interface MobileNavProps {
  session: Session | null;
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="bg-background fixed inset-0 z-50">
          <div className="container flex h-full flex-col">
            <div className="flex items-center justify-between border-b py-4">
              <Link
                href="/"
                className="text-xl font-bold"
                onClick={handleLinkClick}
              >
                MediaWorm
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {session?.user && (
              <div className="flex items-center border-b py-6">
                <UserAvatar user={session.user} />
                <div className="ml-4">
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-muted-foreground text-sm">
                    @{session.user.username}
                  </p>
                </div>
              </div>
            )}

            <nav className="flex flex-col space-y-4 py-6">
              {session?.user && (
                <>
                  <Link
                    href="/"
                    className={cn(
                      "border-l-4 px-2 py-2 text-lg",
                      pathname === "/"
                        ? "border-primary font-medium"
                        : "border-transparent",
                    )}
                    onClick={handleLinkClick}
                  >
                    Books
                  </Link>
                  <Link
                    href="/authors"
                    className={cn(
                      "border-l-4 px-2 py-2 text-lg",
                      pathname === "/authors"
                        ? "border-primary font-medium"
                        : "border-transparent",
                    )}
                    onClick={handleLinkClick}
                  >
                    Authors
                  </Link>
                  <Link
                    href="/series"
                    className={cn(
                      "border-l-4 px-2 py-2 text-lg",
                      pathname === "/series"
                        ? "border-primary font-medium"
                        : "border-transparent",
                    )}
                    onClick={handleLinkClick}
                  >
                    Series
                  </Link>
                  <Link
                    href="/movies"
                    className={cn(
                      "border-l-4 px-2 py-2 text-lg",
                      pathname === "/movies" || pathname.startsWith("/movies/")
                        ? "border-primary font-medium"
                        : "border-transparent",
                    )}
                    onClick={handleLinkClick}
                  >
                    Movies
                  </Link>
                  <Link
                    href="/categories"
                    className={cn(
                      "border-l-4 px-2 py-2 text-lg",
                      pathname === "/categories"
                        ? "border-primary font-medium"
                        : "border-transparent",
                    )}
                    onClick={handleLinkClick}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/statistics"
                    className={cn(
                      "border-l-4 px-2 py-2 text-lg",
                      pathname === "/statistics"
                        ? "border-primary font-medium"
                        : "border-transparent",
                    )}
                    onClick={handleLinkClick}
                  >
                    Statistics
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className={cn(
                        "text-primary border-l-4 px-2 py-2 text-lg",
                        pathname === "/admin"
                          ? "border-primary font-medium"
                          : "border-transparent",
                      )}
                      onClick={handleLinkClick}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className={cn(
                      "border-l-4 px-2 py-2 text-lg",
                      pathname === "/profile"
                        ? "border-primary font-medium"
                        : "border-transparent",
                    )}
                    onClick={handleLinkClick}
                  >
                    Profile
                  </Link>
                </>
              )}

              {!session?.user && (
                <Link
                  href="/api/auth/signin"
                  className="px-2 py-2 text-lg"
                  onClick={handleLinkClick}
                >
                  Sign in
                </Link>
              )}
            </nav>

            {session?.user && (
              <div className="mt-auto border-t py-4">
                <Link
                  href="/api/auth/signout"
                  className="text-destructive px-2 py-2 text-lg"
                  onClick={handleLinkClick}
                >
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
