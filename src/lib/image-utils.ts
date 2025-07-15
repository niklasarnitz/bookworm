import {
  minioClient,
  MINIO_BUCKET_NAME,
  ensureBucketExists,
  getObjectUrl,
} from "~/lib/minio-client";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// Image optimization settings for movie posters
const IMAGE_MAX_WIDTH = 500;
const IMAGE_MAX_HEIGHT = 750;
const IMAGE_QUALITY = 85;

/**
 * Downloads an image from a URL and uploads it to MinIO
 * @param imageUrl - The URL of the image to download
 * @param prefix - Optional prefix for the object name (e.g., 'movie-posters')
 * @returns The MinIO object URL or null if failed
 */
export async function downloadAndUploadImage(
  imageUrl: string,
  prefix = "images",
): Promise<string | null> {
  try {
    // Ensure the MinIO bucket exists
    await ensureBucketExists();

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.statusText}`);
      return null;
    }

    // Get the image buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get content type from response headers
    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    // Determine file extension based on content type
    let extension = "jpg";
    if (contentType.includes("png")) {
      extension = "png";
    } else if (contentType.includes("webp")) {
      extension = "webp";
    } else if (contentType.includes("gif")) {
      extension = "gif";
    }

    // Process the image with Sharp
    let processedBuffer: Buffer;
    try {
      const metadata = await sharp(buffer).metadata();

      // Optimize the image
      processedBuffer = await sharp(buffer)
        .resize(IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: IMAGE_QUALITY })
        .toBuffer();

      // Always use .jpg extension for processed images
      extension = "jpg";

      console.log(
        `Image processed: ${metadata.width}x${metadata.height} -> optimized`,
      );
    } catch (sharpError) {
      console.error("Error processing image with Sharp:", sharpError);
      // Fall back to original buffer if processing fails
      processedBuffer = buffer;
    }

    // Generate a unique object name
    const objectName = `${prefix}/${uuidv4()}.${extension}`;

    // Upload to MinIO
    await minioClient.putObject(MINIO_BUCKET_NAME, objectName, processedBuffer);

    console.log(`Image uploaded to MinIO: ${objectName}`);

    // Return the public URL
    return getObjectUrl(objectName);
  } catch (error) {
    console.error("Error downloading and uploading image:", error);
    return null;
  }
}

/**
 * Downloads a TMDB poster image and uploads it to MinIO
 * @param tmdbPosterPath - The TMDB poster path (e.g., "/abc123.jpg")
 * @returns The MinIO object URL or null if failed
 */
export async function downloadTmdbPoster(
  tmdbPosterPath: string,
): Promise<string | null> {
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const fullImageUrl = `${TMDB_IMAGE_BASE_URL}${tmdbPosterPath}`;

  return downloadAndUploadImage(fullImageUrl, "movie-posters");
}

/**
 * Downloads a TMDB backdrop image and uploads it to MinIO
 * @param tmdbBackdropPath - The TMDB backdrop path (e.g., "/xyz789.jpg")
 * @returns The MinIO object URL or null if failed
 */
export async function downloadTmdbBackdrop(
  tmdbBackdropPath: string,
): Promise<string | null> {
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w1280";
  const fullImageUrl = `${TMDB_IMAGE_BASE_URL}${tmdbBackdropPath}`;

  return downloadAndUploadImage(fullImageUrl, "movie-backdrops");
}
