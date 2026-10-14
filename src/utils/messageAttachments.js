export const MAX_MESSAGE_IMAGE_BYTES = 2 * 1024 * 1024;
export const MESSAGE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function validateMessageImage(image) {
  if (image == null) return null;
  if (typeof image !== "string" || image.length > Math.ceil(MAX_MESSAGE_IMAGE_BYTES / 3) * 4 + 32) {
    return "Choose an image no larger than 2 MB.";
  }
  const match = /^data:image\/(jpeg|png|gif|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
  if (!match || match[2].length % 4 !== 0) return "Choose a JPEG, PNG, GIF or WebP image.";
  const size = match[2].length * 3 / 4 - (match[2].endsWith("==") ? 2 : match[2].endsWith("=") ? 1 : 0);
  if (size > MAX_MESSAGE_IMAGE_BYTES) return "Choose an image no larger than 2 MB.";
  return null;
}
