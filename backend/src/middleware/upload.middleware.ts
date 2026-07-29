import multer, { FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary-v2';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
    return;
  }
  cb(null, true);
}

/**
 * Builds a single-image-upload middleware that stores directly into
 * Cloudinary under abysserp/<subfolder>/, instead of the local disk.
 * Render's filesystem is ephemeral (wiped on every deploy/restart), so
 * anything saved locally would vanish — Cloudinary gives us persistent,
 * CDN-served storage that works the same in dev and production.
 * Used for product images, user avatars, and the business logo — same
 * validation, different folder.
 */
function createImageUpload(subfolder: string, maxSizeMb = 5) {
  const storage = new CloudinaryStorage({
    // The cloudinary SDK and this storage engine ship independently-written
    // type defs for the same upload_stream callback, and they don't line up
    // structurally (Error|null vs UploadApiErrorResponse|undefined) even
    // though the runtime shape is compatible — cast to satisfy both.
    cloudinary: cloudinary as unknown as ConstructorParameters<typeof CloudinaryStorage>[0]['cloudinary'],
    params: {
      folder: `abysserp/${subfolder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      // Randomized public_id so uploads never collide or overwrite each other.
      public_id: (_req, file) => `${Date.now()}-${Math.random().toString(16).slice(2)}-${file.originalname.split('.')[0]}`,
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  }).single('image');
}

export const uploadProductImage = createImageUpload('products');
export const uploadAvatarImage = createImageUpload('avatars', 2); // avatars stay small
export const uploadLogoImage = createImageUpload('logos', 2);