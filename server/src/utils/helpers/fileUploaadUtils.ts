import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import HttpException from '@/utils/exceptions/http.exception';
import { validateAllowedResource, validateExtension } from '@/utils/helpers/fileValidation.util';

// Étendre le type Multer pour enrichir les fichiers
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        generatedUuid?: string;
        generatedFileName?: string;
        generatedPath?: string;
      }
    }
  }
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    try {
      const folder = req.params.folder || 'default';
      const resource = req.params.resource || 'misc';
      const uploadPath = path.join('uploads', folder, resource);

      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      throw new Error(`Failed to create upload directory`);
    }
  },

  filename: function (req: Request, file, cb) {
    try {
      const uuid = crypto.randomUUID();
      const ext = path.extname(file.originalname).toLowerCase();
      const finalName = `${uuid}${ext}`;

      const folder = req.params.folder || 'default';
      const resource = req.params.resource || 'misc';
      const relativePath = path.join(folder, resource, finalName).replace(/\\/g, '/');

      // Ajout d'infos sur le fichier uploadé
      file.generatedUuid = uuid;
      file.generatedFileName = finalName;
      file.generatedPath = relativePath;

      cb(null, finalName);
    } catch (err) {
        // throw new Error(`Failed to generate filename`);
        console.error('Failed to generate filename:', err);
        cb(new Error(`Failed to generate filename: ${err}`), '');
    }
  },
});

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  
  try {
    const resource = req.params.resource;
    if (!resource) {
      throw new HttpException(400, 'Missing resource in URL');
    }

    validateAllowedResource(resource);

    const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
    validateExtension(resource, extension);

    cb(null, true); // ✅ Accepter le fichier
  } catch (err) {
    if (err instanceof Error) {
      cb(err); // ❌ Rejeter avec une erreur explicite
    } else {
      cb(new Error('Unknown error during file validation'));
    }
  }
};

// Instance de multer
const upload = multer({ storage, fileFilter });

// Middleware Express
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.fields([{ name: 'file', maxCount: 1 }])(req, res, function (error: any) {
    if (error instanceof multer.MulterError) {
      console.error('File upload error:', error);
      return res.status(400).json({ error: 'File upload failed' });
    } else if (error) {
      console.error('Unexpected error during file upload:', error);
      return res.status(400).json({ error: error.message || 'Unexpected error occurred' });
    }

    // ✅ Si tout va bien, on continue
    next();
  });
};
