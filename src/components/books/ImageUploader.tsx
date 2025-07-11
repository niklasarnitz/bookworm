import React from "react";
import { CoverUploader } from "./CoverUploader";

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  defaultImageUrl?: string;
  onRemoveCover?: () => void;
}

/**
 * A wrapper component for the CoverUploader component that doesn't include the ISBN-specific functionality
 * This is used by both books and wishlist items
 */
export function ImageUploader({
  onImageUpload,
  defaultImageUrl,
  onRemoveCover,
}: Readonly<ImageUploaderProps>) {
  return (
    <CoverUploader
      onImageUpload={onImageUpload}
      defaultImageUrl={defaultImageUrl}
      onRemoveCover={onRemoveCover}
    />
  );
}
