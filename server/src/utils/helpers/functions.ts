import { User } from '@/apis/user/interfaces/user.interfaces';
import { Role } from './constants';
import * as crypto from 'crypto';
import * as fs from 'fs';

export function verifyRole(role: Role, currentUser: User): boolean {
    return currentUser.roles.indexOf(role) === -1 ? false : true;
}
export async function computeChecksumFromFilePath(filePath: string, algorithm = 'sha256'): Promise<string> {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(filePath);

        stream.on('data', (chunk: Buffer) => {
            hash.update(chunk);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        stream.on('error', (err: Error) => {
            reject(err);
        });
    });
}
