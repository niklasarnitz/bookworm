import * as Minio from "minio";
import { env } from "~/env";

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT || "localhost",
  useSSL: env.MINIO_USE_SSL === "true",
  accessKey: env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: env.MINIO_SECRET_KEY || "minioadmin",
});

export const MINIO_BUCKET_NAME = env.MINIO_BUCKET_NAME || "bookworm";

export async function ensureBucketExists(): Promise<void> {
  const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(
      MINIO_BUCKET_NAME,
      env.MINIO_REGION || "us-east-1",
    );
    console.log(`Bucket '${MINIO_BUCKET_NAME}' created successfully`);
  } else {
    console.log(`Bucket '${MINIO_BUCKET_NAME}' already exists`);
  }

  // Set a bucket policy to make all objects publicly readable
  // This allows images to be loaded directly by the browser
  const publicReadPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`],
      },
    ],
  };

  await minioClient.setBucketPolicy(
    MINIO_BUCKET_NAME,
    JSON.stringify(publicReadPolicy),
  );
  console.log(`Bucket '${MINIO_BUCKET_NAME}' policy set to public read`);
}

export function getObjectUrl(objectName: string): string {
  // For production or when running on a hosted domain, use the configured endpoint
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    const protocol = env.MINIO_USE_SSL === "true" ? "https" : "http";
    return `${protocol}://${env.MINIO_ENDPOINT}/${MINIO_BUCKET_NAME}/${objectName}`;
  }

  // For localhost development, check if MinIO is running locally
  const protocol = env.MINIO_USE_SSL === "true" ? "https" : "http";
  const endpoint = env.MINIO_ENDPOINT || "localhost:9000";

  // Handle cases where endpoint might not include port for localhost
  const fullEndpoint = endpoint.includes(":") ? endpoint : `${endpoint}:9000`;

  return `${protocol}://${fullEndpoint}/${MINIO_BUCKET_NAME}/${objectName}`;
}

/**
 * Get the base URL for the current environment
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side
    return window.location.origin;
  }

  // Server-side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Validate if a URL is accessible and return a fallback if not
 */
export async function validateImageUrl(
  url: string,
  fallbackUrl?: string,
): Promise<string | null> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) {
      return url;
    }
  } catch (error) {
    console.warn(`Failed to validate image URL: ${url}`, error);
  }

  if (fallbackUrl) {
    try {
      const response = await fetch(fallbackUrl, { method: "HEAD" });
      if (response.ok) {
        return fallbackUrl;
      }
    } catch (error) {
      console.warn(`Failed to validate fallback URL: ${fallbackUrl}`, error);
    }
  }

  return null;
}

/**
 * Get a robust image URL that works in both development and production
 */
export function getRobustImageUrl(objectName: string): string {
  const baseUrl = getBaseUrl();

  // If we're in development and using localhost MinIO
  if (baseUrl.includes("localhost")) {
    const localMinioUrl = getObjectUrl(objectName);
    return localMinioUrl;
  }

  // For production, try multiple URL patterns
  const protocol = env.MINIO_USE_SSL === "true" ? "https" : "http";
  const endpoint = env.MINIO_ENDPOINT;

  // Direct MinIO URL
  const directUrl = `${protocol}://${endpoint}/${MINIO_BUCKET_NAME}/${objectName}`;

  return directUrl;
}

// Initialize the bucket on module import for server components
// This will run only on the server side when the module is first imported
if (typeof window === "undefined") {
  ensureBucketExists().catch((err) => {
    console.error("Failed to initialize MinIO bucket:", err);
  });
}
