import HttpException from '../exceptions/http.exception';

// src/utils/fs.util.ts
import fs from 'fs/promises';

const extensionMap: Record<string, string[]> = {
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
    document: ['pdf', 'doc', 'docx'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],
};

const defaultResourceCategory = (resource: string): keyof typeof extensionMap => {
    if (resource === 'video') return 'video';
    if (['flat', 'resumes', 'irfs', 'candidate', 'document'].includes(resource)) return 'document';
    if (resource === 'avatar') return 'image';
    return 'document'; // Default to document for other resources
};

export const validateExtension = (resource: string, extension: string): void => {
    const category = defaultResourceCategory(resource);
    const validExtensions = extensionMap[category];

    if (!validExtensions.includes(extension)) {
        throw new HttpException(400, `Invalid extension for '${resource}', allowed: ${validExtensions.join(', ')}`);
    }
};

export const validateAllowedResource = (resource: string): void => {
    const allowedResources = ['candidate', 'flat', 'resumes', 'irfs', 'avatar', 'document', 'video'];
    if (!allowedResources.includes(resource)) {
        throw new HttpException(400, `Invalid resource: ${resource}`);
    }
};
