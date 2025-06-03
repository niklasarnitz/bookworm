import React from "react";
import { UploadDropzone } from "./coverUploader/UploadDropzone";
import { ImageCropper } from "./coverUploader/ImageCropper";
import { UploaderControls } from "./coverUploader/UploaderControls";
import { ImagePreview } from "./coverUploader/ImagePreview";
import { useCoverUploader } from "./coverUploader/useCoverUploader";

interface CoverUploaderProps {
  onImageUpload: (url: string) => void;
  defaultImageUrl?: string;
  isbn?: string | null;
  onFetchFromService?: () => void;
  serviceName?: string;
  onRemoveCover?: () => void;
}

/**
 * A component for uploading, cropping, and managing book cover images
 */
export function CoverUploader({
  onImageUpload,
  defaultImageUrl,
  isbn,
  onFetchFromService,
  serviceName = "Amazon",
  onRemoveCover,
}: Readonly<CoverUploaderProps>) {
  const {
    imageUrl,
    isUploading,
    showCropper,
    error,
    isProcessing,
    imgRef,
    crop,
    setCrop,
    onDrop,
    onImageLoad,
    uploadImage,
    cancelCrop,
    handleCropComplete,
    handleRemoveCover,
  } = useCoverUploader(defaultImageUrl);

  return (
    <div className="w-full space-y-4">
      {error && (
        <div
          className="rounded border border-red-400 bg-red-100 p-3 text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {!showCropper && !isProcessing && (
        <UploadDropzone onDrop={onDrop} imageUrl={imageUrl} />
      )}

      {(isProcessing || isUploading) && !showCropper && (
        <ImagePreview
          imageUrl=""
          isProcessing={isProcessing}
          isUploading={isUploading}
        />
      )}

      {showCropper && imageUrl && (
        <ImageCropper
          imageUrl={imageUrl}
          crop={crop}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onCancel={cancelCrop}
          onSave={() => uploadImage(onImageUpload)}
          isUploading={isUploading}
          imgRef={imgRef}
          onImageLoad={onImageLoad}
        />
      )}

      {/* Action buttons */}
      {!showCropper && !isProcessing && !isUploading && (
        <UploaderControls
          onFetchFromService={onFetchFromService}
          onRemoveCover={
            onRemoveCover
              ? () => {
                  handleRemoveCover();
                  onRemoveCover();
                }
              : undefined
          }
          serviceLabel={serviceName}
          hasImage={!!imageUrl}
          hasIdentifier={!!isbn}
        />
      )}
    </div>
  );
}
