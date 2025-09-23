import { EntitySchema } from 'typeorm';
import { FileI } from './files.interface';

export const FileEntitySchema = new EntitySchema<FileI>({
    name: 'Files',
    tableName: 'files',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid',
        },
        resource: {
            type: 'varchar',
        },
        folder: {
            type: 'varchar',
        },
        ipSender: {
            type: 'varchar',
        },
        uuid: {
            type: 'varchar',
        },
        fileName: {
            type: 'varchar',
        },
        fileType: {
            type: 'varchar',
        },
        fileSize: {
            type: 'varchar',
        },
        checksum: {
            type: 'varchar',
        },
        isAttached: {
            type: 'boolean',
            default: true,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
        },
        filePath: {
            type: 'varchar',
            nullable: true,
        },
        fileDisplayName: {
            type: 'varchar',
            nullable: true,
        },
        isArchived: {
            type: 'boolean',
            default: false,
        },
    },
    relations: {
        candidate: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'candidateId' },
            nullable: false,
            eager: true, // so `file.candidate` is populated automatically
        },
    },
});
