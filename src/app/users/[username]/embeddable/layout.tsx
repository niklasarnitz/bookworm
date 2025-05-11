import "~/styles/globals.css";

// Root layout for embeddable content that ignores all parent layouts
export const metadata = {
  title: "Embedded Content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            width: 100%;
            height: 100%;
            background: transparent;
            overflow-x: hidden;
          }
          /* Make tables and content responsive in iframe */
          table {
            width: 100%;
            font-size: 0.9rem;
          }
          @media (max-width: 500px) {
            table {
              font-size: 0.8rem;
            }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}