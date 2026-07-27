import { Router } from 'express';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import { uploadProductImage, uploadAvatarImage, uploadLogoImage } from '../middleware/upload.middleware';
import { postProductImage, postAvatarImage, postLogoImage } from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(requireAuth);

// Wraps a multer middleware so its errors (file too large, wrong type, etc.)
// become clean AppErrors instead of falling through to the generic 500 handler.
function wrapUpload(uploadMiddleware: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Image is too large', 400));
        }
        return next(new AppError(err.message, 400));
      }
      if (err instanceof Error) {
        return next(new AppError(err.message, 400));
      }
      next();
    });
  };
}

// Product images — Admin/Manager only (Day 25).
router.post(
  '/products/image',
  requireRole('ADMIN', 'MANAGER'),
  wrapUpload(uploadProductImage),
  postProductImage,
);

// Avatar — any authenticated user can upload their own.
router.post('/avatar', wrapUpload(uploadAvatarImage), postAvatarImage);

// Business logo — Admin only, matches who can edit business settings.
router.post('/logo', requireRole('ADMIN'), wrapUpload(uploadLogoImage), postLogoImage);

export default router;