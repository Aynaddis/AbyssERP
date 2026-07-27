import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
    return;
  }
  cb(null, true);
}

/**
 * Builds a single-image-upload middleware that stores into
 * uploads/<subfolder>/ with a randomized filename. Used for product images,
 * user avatars, and the business logo — same validation, different folder.
 */
function createImageUpload(subfolder: string, maxSizeMb = 5) {
  const dir = path.join(UPLOADS_ROOT, subfolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      cb(null, uniqueName);
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