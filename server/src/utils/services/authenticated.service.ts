import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Payload from '../interfaces/payload.interface';

export const auth = {
    randomPassword: async () => {
        const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const specialCharacters = '!@*-_=+?.';
        const allCharacters = alphanumeric + specialCharacters;

        let password = '';
        for (let i = 0; i < 12; i++) {
            const randomIndex = Math.floor(Math.random() * allCharacters.length);
            password += allCharacters.charAt(randomIndex);
        }

        return password;
    },
    hashPassword: async (password: string) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    },
    comparePassword: async (password: string, hashedPassword: string) => {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    },
    generateToken: async (payload: Payload, tokenKey: string, expiresIn: string) => {
        const token = jwt.sign(payload as object, tokenKey, { expiresIn } as jwt.SignOptions);
        return token;
    },
    verifyToken: async (token: string, key: string) => {
        try {
            const decoded = jwt.verify(token, key);
            return { payload: decoded, expired: false };
        } catch (error: any) {
            return { payload: null, expired: true };
        }
    },
};
