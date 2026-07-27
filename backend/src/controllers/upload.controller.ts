import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';

function handleUploadedFile(subfolder: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No image file was uploaded', 400);
      }

      const imageUrl = `/uploads/${subfolder}/${req.file.filename}`;
      res.status(201).json({ imageUrl });
    } catch (err) {
      next(err);
    }
  };
}

export const postProductImage = handleUploadedFile('products');
export const postAvatarImage = handleUploadedFile('avatars');
export const postLogoImage = handleUploadedFile('logos');