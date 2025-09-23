import { AppDataSource } from '@/utils/databases';
import { FindOneOptions, Repository } from 'typeorm';
import { FileI } from './files.interface';
import { FileEntitySchema } from './files.model';

export class FileRepository {
    public repository: Repository<FileI>;

    constructor() {
        this.repository = AppDataSource.getRepository(FileEntitySchema);
    }

    async create(data: Partial<FileI>): Promise<FileI> {
        const file = this.repository.create(data);
        return await this.repository.save(file);
    }
    async findByUserWithPagination(
        userId: string,
        filters: Record<string, any> = {},
        limit: number = 10,
        offset: number = 0,
    ): Promise<[FileI[], number]> {
        const query = this.repository
            .createQueryBuilder('file')
            .leftJoinAndSelect('file.candidate', 'candidate')
            .where('candidate.id = :userId', { userId })
            .andWhere('file.resource != :excludedResource', { excludedResource: 'avatar' })
            .andWhere('file.isArchived = false');

        if (filters.resource) query.andWhere('file.resource = :resource', { resource: filters.resource });

        if (filters.fileType) query.andWhere('file.fileType = :fileType', { fileType: filters.fileType });

        if (filters.fileDisplayName)
            query.andWhere('LOWER(file.fileDisplayName) LIKE LOWER(:fileDisplayName)', {
                fileDisplayName: `%${filters.fileDisplayName}%`,
            });

        query.orderBy('file.createdAt', 'DESC').skip(offset).take(limit);

        return await query.getManyAndCount();
    }

    async findById(id: string): Promise<FileI | null> {
        return await this.repository.findOne({ where: { id } });
    }
    async findByFileName(fileName: string) {
        return this.repository.findOne({ where: { fileName } });
    }
    async findByUuid(uuid: string) {
        return this.repository.findOne({ where: { uuid } });
    }

    async findOne(options: FindOneOptions<FileI>): Promise<FileI | null> {
        return await this.repository.findOne(options);
    }

    async findAll(): Promise<FileI[]> {
        return await this.repository.find();
    }

    async update(id: string, update: Partial<FileI>): Promise<FileI | null> {
        const file = await this.findById(id);
        if (!file) return null;
        Object.assign(file, update);
        return await this.repository.save(file);
    }

    async delete(uuid: string): Promise<boolean> {
        const result = await this.repository.delete({ uuid });
        return result.affected !== 0;
    }

    async save(file: FileI): Promise<FileI> {
        return await this.repository.save(file);
    }
}


