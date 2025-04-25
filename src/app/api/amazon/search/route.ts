import { searchBooksByIsbn } from "~/lib/amazon-scraper";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return NextResponse.json(
      { error: "ISBN parameter is required" },
      { status: 400 },
    );
  }

  try {
    const results = await searchBooksByIsbn(isbn);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error searching Amazon books:", error);
    return NextResponse.json(
      { error: "Failed to search for books" },
      { status: 500 },
    );
  }
}
