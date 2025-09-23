import * as path from 'path';
import * as fs from 'fs/promises';
import { FileI } from './files.interface';
import { computeChecksumFromFilePath } from '@/utils/helpers/functions';
import { AppDataSource } from '@/utils/databases';
import { UserRepository } from '../user/UserRepository';
import { CandidateUser } from '../user/interfaces/candidate.interfaces';
import HttpException from '@/utils/exceptions/http.exception';
import { validateExtension } from '@/utils/helpers/fileValidation.util';
import { User } from '../user/interfaces/user.interfaces';
import { RecruiterUser } from '../user/interfaces/recruiter.interfaces';
import { FileRepository } from './files.repository';
import { ApplicationI } from '../application/application.entity';
import { ApplicationEntitySchema } from '../application/application.schema';

class FilesService {
    private readonly userRepository = new UserRepository();
    private readonly fileRepository = new FileRepository();

    public async uploadFile(
        userId: string,
        newFile: Express.Multer.File,
        folder?: string,
        resource: string = 'user',
        checksum?: string,
    ): Promise<any> {
        const user = (await this.userRepository.findById(userId)) as User;
        if (!user) throw new HttpException(404, 'User not found');

        if (!user.roles || (!user.roles.includes('Candidat') && !user.roles.includes('Recruteur'))) {
            throw new HttpException(403, 'User is not authorized to upload files');
        }

        const isCandidate = user.roles.includes('Candidat');
        const isRecruiter = user.roles.includes('Recruteur');

        const extension = path.extname(newFile.originalname).toLowerCase().replace('.', '');
        validateExtension(resource, extension);

        const finalChecksum = checksum ?? (await computeChecksumFromFilePath(newFile.path));

        const existingFile = await this.fileRepository.findOne({
            where: { candidate: { id: userId }, resource },
            relations: ['candidate'],
        });

        if (existingFile?.isArchived) {
            existingFile.isArchived = false;
        }

        const uuid = existingFile?.uuid || crypto.randomUUID();
        const today = new Date();
        const defaultFolder = path.join(
            today.getFullYear().toString(),
            (today.getMonth() + 1).toString().padStart(2, '0'),
            today.getDate().toString().padStart(2, '0'),
            resource,
        );
        const finalFolder = folder || defaultFolder;
        const finalFileName = `${uuid}.${extension}`;
        const absoluteFolderPath = path.join(process.cwd(), 'uploads', finalFolder, resource);
        const finalPath = path.join(absoluteFolderPath, finalFileName);

        await fs.mkdir(absoluteFolderPath, { recursive: true });

        const relativePath = path.relative(path.resolve('uploads'), finalPath).replace(/\\/g, '/');

        const filesInFolder = await fs.readdir(path.dirname(finalPath));
        for (const file of filesInFolder) {
            if (file.startsWith(uuid + '.') && file !== finalFileName) {
                await fs.unlink(path.join(path.dirname(finalPath), file));
            }
        }

        if (path.basename(newFile.path) !== finalFileName || path.dirname(newFile.path) !== path.dirname(finalPath)) {
            await fs.rename(newFile.path, finalPath);
        }

        const fileDisplayName =
            resource === 'avatar'
                ? `photo_${user.fullName}.${extension}`
                : resource === 'resumes'
                ? `cv_${user.fullName}.${extension}`
                : `${resource}_${user.fullName}.${extension}`;

        const fileData: FileI = {
            resource,
            folder: finalFolder,
            ipSender: 'unknown',
            uuid,
            fileName: finalFileName,
            fileDisplayName,
            fileType: newFile.mimetype,
            fileSize: String(newFile.size),
            checksum: finalChecksum,
            isAttached: true,
            candidate: user,
            filePath: relativePath,
        };

        const savedFile = await this.fileRepository.save(existingFile ? Object.assign(existingFile, fileData) : fileData);

        let userModified = false;

        if (isCandidate) {
            const candidate = user as CandidateUser;

            if (resource === 'video' && candidate.cvVideoUrl !== relativePath) {
                candidate.cvVideoUrl = relativePath;
                userModified = true;
            } else if (resource === 'avatar' && candidate.profilePicture !== relativePath) {
                candidate.profilePicture = relativePath;
                userModified = true;
            } else if (resource === 'resumes' && candidate.cvUrl !== relativePath) {
                candidate.cvUrl = relativePath;
                userModified = true;
            }
        }

        if (isRecruiter) {
            const recruiter = user as RecruiterUser;

            if (resource === 'avatar' && recruiter.profilePicture !== relativePath) {
                recruiter.profilePicture = relativePath;
                userModified = true;
            }
        }

        delete (user as any).files;

        if (userModified) {
            await this.userRepository.save(user);
        }

        return {
            message: existingFile
                ? `${resource.charAt(0).toUpperCase() + resource.slice(1)} updated successfully`
                : `${resource.charAt(0).toUpperCase() + resource.slice(1)} uploaded successfully`,
            file: savedFile,
        };
    }

    public async findAllFiles(): Promise<FileI[]> {
        return await this.fileRepository.findAll();
    }

    public async findFile(uuid: string): Promise<string> {
        const file = await this.fileRepository.findOne({ where: { uuid } });
        if (!file) throw new Error('File not found');

        return path.join(__dirname, `../../../uploads/${file.folder}/${file.resource}`, file.fileName);
    }

    public async deleteFile(uuid: string): Promise<void> {
        const file = await this.fileRepository.findOne({
            where: { uuid },
            relations: ['candidate'],
        });
        if (!file) {
            throw new HttpException(404, 'File not found');
        }

        // check for existing applications referencing this filePath
        const usageCount = await AppDataSource.createQueryBuilder()
            .from(ApplicationEntitySchema, 'app')
            .where('app.resume = :path OR app.cvvideo = :path', { path: file.filePath })
            .getCount();

        if (usageCount > 0) {
            throw new HttpException(409, `Cannot delete file: it is used by ${usageCount} application(s)`);
        }

        const absolutePath = path.join(process.cwd(), 'uploads', file.folder, file.resource, file.fileName);
        try {
            await fs.access(absolutePath);
            await fs.unlink(absolutePath);
        } catch (err: any) {
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }

        const deleted = await this.fileRepository.delete(uuid);
        if (!deleted) {
            throw new HttpException(500, 'Failed to delete file record');
        }

        const candidate = file.candidate as CandidateUser;
        const relPath = file.filePath!;
        let updated = false;

        if (file.resource === 'avatar' && candidate.profilePicture === relPath) {
            candidate.profilePicture = null;
            updated = true;
        }
        if (file.resource === 'video' && candidate.cvVideoUrl === relPath) {
            candidate.cvVideoUrl = null;
            updated = true;
        }
        if (file.resource === 'resumes' && candidate.cvUrl === relPath) {
            candidate.cvUrl = null;
            updated = true;
        }
        if (updated) {
            await this.userRepository.save(candidate);
        }
    }
    public async RealdeleteFile(uuid: string): Promise<void> {
        const file = await this.fileRepository.findOne({ where: { uuid }, relations: ['candidate'] });
        if (!file) throw new HttpException(404, 'File not found');

        const filePath = path.join(__dirname, `../../../uploads/${file.folder}/${file.resource}`, file.fileName);
        await fs.unlink(filePath);
        await this.fileRepository.delete(uuid);

        const candidate = file.candidate as CandidateUser;
        if (!candidate) throw new HttpException(404, 'Candidate not found');

        const relativePath = file.filePath;
        let updated = false;

        if (file.resource === 'avatar' && candidate.profilePicture === relativePath) {
            candidate.profilePicture = null;
            updated = true;
        } else if (file.resource === 'video' && candidate.cvVideoUrl === relativePath) {
            candidate.cvVideoUrl = null;
            updated = true;
        } else if (file.resource === 'resumes' && candidate.cvUrl === relativePath) {
            candidate.cvUrl = null;
            updated = true;
        }

        if (updated) {
            await this.userRepository.save(candidate);
        }
    }

    async findFileDisplayName(uuid: string): Promise<string | null> {
        const fileMeta = await this.fileRepository.findOne({ where: { uuid } });
        return fileMeta?.fileDisplayName || null;
    }

    public async getFilesByUserWithFilters(
        userId: string,
        filters: any = {},
        limit: number = 10,
        offset: number = 0,
    ): Promise<{ total: number; count: number; data: Partial<FileI>[] }> {
        const [data, total] = await this.fileRepository.findByUserWithPagination(userId, filters, limit, offset);

        return {
            total,
            count: data.length,
            data,
        };
    }
}

export default FilesService;
