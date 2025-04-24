import "~/styles/globals.css";

import { Inter } from "next/font/google";
import Link from "next/link";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Book Tracker",
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
    <html lang="en">
      <body className={cn("font-sans", inter.variable)}>
        <SessionProvider>
          <TRPCReactProvider>
            <div className="flex min-h-screen flex-col">
              <header className="border-b">
                <div className="container mx-auto flex items-center justify-between p-4">
                  <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-bold">
                      Book Tracker
                    </Link>

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
                      </nav>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {session?.user ? (
                      <div className="flex items-center gap-4">
                        <span className="hidden md:inline">
                          {session.user.name}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/api/auth/signout">Sign out</Link>
                        </Button>
                      </div>
                    ) : (
                      <Button asChild size="sm">
                        <Link href="/api/auth/signin">Sign in</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </header>
              <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                {children}
              </main>
              <footer className="border-t py-4">
                <div className="container mx-auto text-center text-sm text-gray-500">
                  © {new Date().getFullYear()} BookWorm
                </div>
              </footer>
            </div>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
