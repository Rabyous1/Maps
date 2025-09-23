import { FileEntitySchema } from '@/apis/storage/files.model';
import { AppDataSource } from '@/utils/databases';
import { computeChecksumFromFilePath } from '@/utils/helpers/functions';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs/promises';

export async function checkFileExistenceMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const { userId, resource } = req.params;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    if (!userId || !resource) return res.status(400).json({ message: 'Missing userId or resource in parameters' });

    const checksum = await computeChecksumFromFilePath(file.path);
    const fileRepository = AppDataSource.getRepository(FileEntitySchema);

    const existingFile = await fileRepository.findOne({
      where: {
        candidate: { id: userId },
        resource,
        checksum,
      },
      relations: ['candidate'],
    });

    if (existingFile) {
      await fs.unlink(file.path);
      return res.status(200).json({
        message: `The same ${resource} already exists for this user. The file will be replaced.`,
        file: existingFile,
      });
    }

    (req as any).newChecksum = checksum;
    next();
  } catch (error) {
    console.error('Error in checkFileExistenceMiddleware:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

