import * as Minio from "minio";
import { env } from "~/env";

// Create and configure the MinIO client
export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT || "localhost",
  useSSL: env.MINIO_USE_SSL === "true",
  accessKey: env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: env.MINIO_SECRET_KEY || "minioadmin",
});

export const MINIO_BUCKET_NAME = env.MINIO_BUCKET_NAME || "bookworm";

// Function to ensure bucket exists
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

// Get URL for an object
export function getObjectUrl(objectName: string): string {
  const protocol = env.MINIO_USE_SSL === "true" ? "https" : "http";
  return `${protocol}://${env.MINIO_ENDPOINT}/${MINIO_BUCKET_NAME}/${objectName}`;
}

// Initialize the bucket on module import for server components
// This will run only on the server side when the module is first imported
if (typeof window === "undefined") {
  ensureBucketExists().catch((err) => {
    console.error("Failed to initialize MinIO bucket:", err);
  });
}
