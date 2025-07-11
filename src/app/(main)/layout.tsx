import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "~/contexts/ThemeContext";
import { Toaster } from "~/components/ui/sonner";
import { NavBar } from "~/components/NavBar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <Toaster />
              <div className="flex min-h-screen flex-col">
                <NavBar />
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
