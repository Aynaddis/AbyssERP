import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

function handleUploadedFile() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No image file was uploaded', 400);
      }

      // multer-storage-cloudinary puts the uploaded file's secure Cloudinary
      // URL on `path` — that's already a full, absolute, CDN-served URL, so
      // there's no need to build one relative to this server (which won't
      // even have the file once Render's ephemeral disk resets).
      const imageUrl = req.file.path;
      res.status(201).json({ imageUrl });
    } catch (err) {
      next(err);
    }
  };
}

export const postProductImage = handleUploadedFile();
export const postAvatarImage = handleUploadedFile();
export const postLogoImage = handleUploadedFile();