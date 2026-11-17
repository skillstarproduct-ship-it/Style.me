import { CapturedImageMeta } from "../session/sessionStore";

export interface CaptureResult {
  dataUrl: string;
  blob: Blob;
  meta: CapturedImageMeta;
}

/**
 * Captures a full-resolution still image from a HTMLVideoElement
 */
export async function captureStillFromVideo(
  videoElement: HTMLVideoElement,
  customQuality = 0.95
): Promise<CaptureResult> {
  const width = videoElement.videoWidth || 1920;
  const height = videoElement.videoHeight || 1080;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D canvas context for still capture");
  }

  // Draw current video frame onto canvas
  ctx.drawImage(videoElement, 0, 0, width, height);

  // Generate high quality JPEG
  const dataUrl = canvas.toDataURL("image/jpeg", customQuality);

  // Convert to Blob for upload payload
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to create JPEG Blob from canvas"));
      },
      "image/jpeg",
      customQuality
    );
  });

  const meta: CapturedImageMeta = {
    width,
    height,
    sizeBytes: blob.size,
    timestamp: Date.now(),
  };

  return {
    dataUrl,
    blob,
    meta,
  };
}
