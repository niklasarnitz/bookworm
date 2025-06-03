import * as cheerio from "cheerio";
import {
  type BookDetail,
  type BookMetadataService,
  type BookSearchResult,
} from "./types";

/**
 * Helper function to get text content from an element
 * @param $element - Cheerio element
 * @returns Text content or empty string
 */
function getTextContent($element: cheerio.Cheerio<Element>): string {
  // @ts-expect-error - Cheerio typings are incorrect
  return $element.text().trim();
}

/**
 * Amazon book metadata service implementation
 */
export class AmazonBookService implements BookMetadataService {
  serviceId = "amazon";
  serviceName = "Amazon";
  baseUrl = "https://www.amazon.de";

  /**
   * Search for books on Amazon using ISBN
   * @param isbn - The ISBN number to search for
   * @returns An array of book search results
   */
  async searchByIdentifier(isbn: string): Promise<BookSearchResult[]> {
    try {
      console.log(`Searching Amazon for books with ISBN: ${isbn}`);
      const searchUrl = `${this.baseUrl}/s?k=${isbn}`;

      console.log(`Fetching from URL: ${searchUrl}`);
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9,de;q=0.8",
        },
      });

      if (!response.ok) {
        const errorMsg = `Failed to fetch Amazon search results: ${response.status}`;
        console.log(errorMsg);
        throw new Error(errorMsg);
      }

      console.log(
        `Successfully fetched search results, status: ${response.status}`,
      );
      const html = await response.text();
      console.log(`Received HTML content length: ${html.length} characters`);

      // Load HTML into cheerio
      const $ = cheerio.load(html);
      const results: BookSearchResult[] = [];

      // Select search result items
      const searchResultItems = $('div[data-component-type="s-search-result"]');
      console.log(`Found ${searchResultItems.length} search result items`);

      searchResultItems.each((index, element) => {
        if (results.length >= 10) return false; // Limit to 10 results

        const $item = $(element);

        // Using the specified CSS selectors
        const titleElement = $item.find(".s-line-clamp-2 span").first();
        const authorElement = $item
          .find(".a-size-base .a-row a.a-size-base")
          .first();
        const detailLinkElement = $item.find("a.s-line-clamp-2").first();

        // @ts-expect-error - Cheerio typings are incorrect
        const title = getTextContent(titleElement);
        // @ts-expect-error - Cheerio typings are incorrect
        const author = getTextContent(authorElement) || "Unknown Author";
        const detailUrlPath = detailLinkElement.attr("href");

        if (title && detailUrlPath) {
          const detailUrl = new URL(detailUrlPath, this.baseUrl).toString();

          const result = {
            title,
            author,
            detailUrl,
          };

          console.log(`Found book: "${result.title}" by ${result.author}`);
          console.log(`Detail URL: ${result.detailUrl}`);

          results.push(result);
        } else {
          console.log(
            `Skipping item #${index + 1} - missing title or detail URL`,
          );
          if (!title) console.log("No title found");
          if (!detailUrlPath) console.log("No detail URL found");
        }
      });

      console.log(
        `Search complete, found ${results.length} results for ISBN: ${isbn}`,
      );
      return results;
    } catch (error) {
      console.log(`Error searching Amazon books with ISBN ${isbn}:`, error);
      throw new Error("Failed to search Amazon books. Please try again later.");
    }
  }

  /**
   * Get detailed book information from an Amazon detail page
   * @param detailUrl - The Amazon detail page URL
   * @returns Detailed book information
   */
  async getBookDetail(detailUrl: string): Promise<BookDetail> {
    try {
      console.log(`Fetching book details from: ${detailUrl}`);

      const response = await fetch(detailUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9,de;q=0.8",
        },
      });

      if (!response.ok) {
        const errorMsg = `Failed to fetch Amazon book details: ${response.status}`;
        console.log(errorMsg);
        throw new Error(errorMsg);
      }

      console.log(
        `Successfully fetched book details, status: ${response.status}`,
      );
      const html = await response.text();
      console.log(`Received HTML content length: ${html.length} characters`);

      // Load HTML into cheerio
      const $ = cheerio.load(html);

      // Extract title using the specified CSS selector
      const titleElement = $("span.a-size-large").first();
      // @ts-expect-error - Cheerio typings are incorrect
      const title = getTextContent(titleElement) || "Unknown Title";
      console.log(`Extracted title: "${title}"`);

      let subtitle: string | undefined = undefined;
      // Check if the title contains a colon which often separates title and subtitle
      const titleParts = title.split(":");
      if (titleParts.length > 1) {
        subtitle = titleParts.slice(1).join(":").trim();
        console.log(`Extracted subtitle: "${subtitle}"`);
      }

      const mainTitle = titleParts[0]?.trim() ?? "Unknown Title";

      // Extract authors using the specified CSS selector
      const authorElements = $(".author a");
      const authors: string[] = [];

      authorElements.each((_, element) => {
        // @ts-expect-error - Cheerio typings are incorrect
        const authorName = getTextContent($(element));
        if (authorName) {
          authors.push(authorName);
        }
      });

      // Use default author if none found
      if (authors.length === 0) {
        authors.push("Unknown Author");
      }

      console.log("Authors:", authors.join(", "));

      // Extract cover image URL using the specified CSS selector
      const coverImageElement = $("img.a-stretch-vertical").first();
      let coverImageUrl: string | undefined = coverImageElement.attr("src");

      // Fallback to data-a-dynamic-image if src is not available
      if (!coverImageUrl) {
        const dynamicImageData = coverImageElement.attr("data-a-dynamic-image");
        if (dynamicImageData) {
          try {
            const imageData = JSON.parse(dynamicImageData) as Record<
              string,
              [number, number]
            >;
            // Get the first image URL (which should be the highest resolution)
            const urls = Object.keys(imageData);
            if (urls.length > 0) {
              coverImageUrl = urls[0];
            }
          } catch (e) {
            console.log("Error parsing cover image data:", e);
          }
        }
      }

      if (coverImageUrl) {
        console.log(`Extracted cover image URL: ${coverImageUrl}`);
      } else {
        console.log("No cover image URL found");
      }

      // Extract publisher using the specified CSS selector
      const publisherElement = $(
        "#rpi-attribute-book_details-publisher .a-spacing-none span",
      ).first();
      // @ts-expect-error - Cheerio typings are incorrect
      const publisher = getTextContent(publisherElement);

      if (publisher) {
        console.log(`Extracted publisher: ${publisher}`);
      } else {
        console.log("No publisher information found");
      }

      // Extract ISBN-13
      // Since no specific selector was provided, we'll look for text containing ISBN-13
      let isbn: string | undefined = undefined;

      // Method 1: Look for ISBN-13 in detail sections
      $("div.a-section").each((_, section) => {
        const $section = $(section);
        const text = $section.text();
        if (text.includes("ISBN-13")) {
          // Extract digits only from the text that contains ISBN-13
          const matches = /ISBN-13[:\s]*([0-9-]+)/.exec(text);
          if (matches?.[1]) {
            isbn = matches[1].replace(/[^0-9]/g, "");
            return false; // Break the loop once found
          }
        }
      });

      if (isbn) {
        console.log(`Extracted ISBN: ${isbn as unknown as string}`);
      } else {
        console.log("No ISBN information found");
      }

      const bookDetail: BookDetail = {
        title: mainTitle,
        subtitle,
        authors,
        coverImageUrl,
        publisher: publisher || undefined,
        isbn,
      };

      console.log(
        `Successfully extracted book details for "${mainTitle}" with ${authors.length} authors`,
      );
      return bookDetail;
    } catch (error) {
      console.log(
        `Error fetching Amazon book details from ${detailUrl}:`,
        error,
      );
      throw new Error(
        "Failed to fetch book details from Amazon. Please try again later.",
      );
    }
  }
}
