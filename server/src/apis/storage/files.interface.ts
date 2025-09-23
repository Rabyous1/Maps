import { User } from "../user/interfaces/user.interfaces";

export interface FileI {
    id?: string;
    resource: string;
    folder: string;
    ipSender: string;
    uuid: string;
    filePath?: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    checksum: string;
    isAttached?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    candidate: User;
    fileDisplayName?: string;
    isArchived?: boolean;
}
