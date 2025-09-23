import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import HttpException from '@/utils/exceptions/http.exception';

declare global {
    namespace Express {
        interface Request {
            inferredResource?: string;
        }

        namespace Multer {
            interface File {
                generatedUuid?: string;
                generatedFileName?: string;
                generatedPath?: string;
                generatedResource?: string; 
            }
        }
    }
}

const detectResourceByExtension = (ext: string): string => {
    const documentExts = ['pdf', 'doc', 'docx'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];

    if (documentExts.includes(ext)) return 'resumes';
    if (videoExts.includes(ext)) return 'video';
    if (imageExts.includes(ext)) return 'avatar';

    throw new HttpException(400, `Invalid file extension: .${ext}`);
};

const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
  try {
    const folder = req.params.folder || 'default';
    const resource = req.inferredResource || 'misc';
    const uploadPath = path.join('uploads', folder, resource);

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  } catch (err) {
    cb(new Error(`Failed to create upload directory: ${err instanceof Error ? err.message : String(err)}`), '');
  }
},


    filename: function (req: Request, file, cb) {
        try {
            const uuid = crypto.randomUUID();
            const ext = path.extname(file.originalname).toLowerCase();
            const finalName = `${uuid}${ext}`;

            const folder = req.params.folder || 'default';
            const resource = req.inferredResource || 'misc';
            const relativePath = path.join(folder, resource, finalName).replace(/\\/g, '/');

            file.generatedUuid = uuid;
            file.generatedFileName = finalName;
            file.generatedPath = relativePath;
            file.generatedResource = resource; 

            cb(null, finalName);
        } catch (err) {
            cb(new Error('Failed to generate filename'), '');
        }
    },
});

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
      console.log("resource:", req.params.resource, "ext:", path.extname(file.originalname));

    try {
        const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
        const resource = detectResourceByExtension(extension);

        req.inferredResource = resource; 

        cb(null, true);
    } catch (err) {
        if (err instanceof Error) {
            cb(err);
        } else {
            cb(new Error('Unknown error during file validation'));
        }
    }
};

const upload = multer({ storage, fileFilter });

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, function (error: any) {
        if (error instanceof multer.MulterError) {
            return res.status(400).json({ error: 'Multer error during upload', detail: error.message });
        } else if (error) {
            return res.status(400).json({ error: error.message || 'Unexpected error during file upload' });
        }
        next();
    });
};
