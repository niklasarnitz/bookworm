import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Link from "next/link";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Toaster } from "~/components/ui/sonner";
import { UserAvatar } from "~/components/UserAvatar";
import { MobileNav } from "~/components/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Script to prevent theme flashing
const themeScript = `
  (function() {
    function getThemePreference() {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("bookworm-theme="))
        ?.split("=")[1];

      if (cookieValue && ["light", "dark", "system"].includes(cookieValue)) {
        return cookieValue;
      }
      return "system";
    }

    const theme = getThemePreference();

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }

    // Block page rendering until the theme is applied
    document.documentElement.style.visibility = "visible";
  })()
`;

export const metadata = {
  title: "BookWorm",
  description: "Track your book collection with ease",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" style={{ visibility: "hidden" }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={cn("font-sans", inter.variable)}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SessionProvider>
            <TRPCReactProvider>
              <div className="flex min-h-screen flex-col">
                <header className="border-b">
                  <Toaster />
                  <div className="container mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center gap-6">
                      <Link href="/" className="text-xl font-bold">
                        BookWorm
                      </Link>

                      {/* Desktop navigation */}
                      {session?.user && (
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
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <ThemeToggle />

                      {/* User avatar for desktop */}
                      <div className="hidden md:block">
                        {session?.user ? (
                          <UserAvatar user={session.user} />
                        ) : (
                          <Button asChild size="sm">
                            <Link href="/api/auth/signin">Sign in</Link>
                          </Button>
                        )}
                      </div>

                      {/* Mobile navigation button */}
                      <div className="md:hidden">
                        <MobileNav session={session} />
                      </div>
                    </div>
                  </div>
                </header>
                <main className="bg-background container mx-auto flex-1 p-4 md:p-8">
                  {children}
                </main>
                <footer className="border-t py-4">
                  <div className="text-muted-foreground container mx-auto text-center text-sm">
                    © {new Date().getFullYear()} BookWorm
                  </div>
                </footer>
              </div>
            </TRPCReactProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
