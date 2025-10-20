import multer from 'multer';

export const allowedImageMimeTypes = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

// Store file in memory to then persist as blob in Postgres
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      const err = new Error('INVALID_FILE_TYPE');
      // Signal an error to be handled by error middleware
      return cb(err as unknown as null, false);
    }
    cb(null, true);
  },
});


