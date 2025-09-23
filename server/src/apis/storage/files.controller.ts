import { Request, Response, NextFunction, Router } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import FilesService from './files.service';
import { uploadMiddleware } from '@/middlewares/upload-file.middleware';
import { validateParams } from '@/middlewares/validation.middleware';
import HttpException from '@/utils/exceptions/http.exception';
import { validateAllowedResource, validateExtension } from '@/utils/helpers/fileValidation.util';
import path from 'path';
import fs from 'fs';
import isAuthenticated from '@/middlewares/authentication.middleware';
import apiKeyMiddleware from '@/middlewares/validateApiKey.middleware';
import { hasRoles } from '@/middlewares/authorization.middleware';
import { Role } from '@/utils/helpers/constants';

class FilesController implements Controller {
    public path = '/files';
    public router = Router();

    private filesService = new FilesService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/:userId/:resource/:folder`,
            // isAuthenticated,
            apiKeyMiddleware,
            validateParams,
            uploadMiddleware,
            this.uploadFile,
        );
        this.router.get(`${this.path}/myfiles`, isAuthenticated,hasRoles(Role.CANDIDAT), this.getMyFiles);
        this.router.get(`${this.path}/:filename`, this.getFileByUuid);

        this.router.get(`${this.path}`,hasRoles(Role.CANDIDAT), this.getAllFiles);
        this.router.get(`${this.path}/myfiles`, isAuthenticated,hasRoles(Role.CANDIDAT), this.getMyFiles);
        this.router.get(`${this.path}/my/files`, isAuthenticated, this.getMyFiles);
        this.router.delete(`${this.path}/:filename`, isAuthenticated, hasRoles(Role.CANDIDAT), this.deleteFile);
    }

    private uploadFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, resource, folder } = req.params;
            const file = req.file;

            if (!file) {
                throw new HttpException(400, 'Please upload a file');
            }

            validateAllowedResource(resource);

            const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
            validateExtension(resource, extension);

            const result = await this.filesService.uploadFile(userId, file, folder, resource);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };
private getFileByUuid = async (req: any, res: Response) => {
  try {
    const fileName = req.params.filename;
    const uuid = path.parse(fileName).name;

    const filePath = await this.filesService.findFile(uuid);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    if (req.query.download === 'true') {
      // Appelle juste une méthode supplémentaire pour le nom d'affichage
      const displayName = await this.filesService.findFileDisplayName(uuid);
      const finalName = displayName || path.basename(filePath);
      return res.download(filePath, finalName);
    }

    return res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
};


    private getAllFiles = async (req: any, res: Response, next: NextFunction) => {
        try {
            const files = await this.filesService.findAllFiles();
            res.status(200).json(files);
        } catch (error) {
            next(error);
        }
    };
    private deleteFile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fileName = req.params.filename;
            const uuid = path.parse(fileName).name;
            await this.filesService.deleteFile(uuid);
            res.status(200).json({ message: 'File deleted successfully' });
        } catch (error) {
            next(error);
        }
    };
    private getMyFiles = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            if (!userId) throw new HttpException(401, 'Unauthorized');

            const { limit, offset, resource, fileType, fileDisplayName } = req.query;
            const filters = { resource, fileType, fileDisplayName };

            const result = await this.filesService.getFilesByUserWithFilters(userId, filters, Number(limit) || 10, Number(offset) || 0);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}

export default FilesController;