// src/tests/Users.test.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
jest.mock('node-cron', () => ({
    schedule: jest.fn(() => ({
        start: jest.fn(),
    })),
}));

import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import App from '../app';
import UserController from '@/apis/user/controllers/user.controller';
import { Role } from '@/utils/helpers/constants';

// Mock authentication middleware with Admin role
jest.mock('../middlewares/authentication.middleware', () => ({
    __esModule: true,
    default: (req: any, _res: any, next: any) => {
        req.user = { _id: uuidv4(), roles: Role.ADMIN };
        next();
    },
}));

// Mock authorization middleware to bypass role checks (optional)
jest.mock('@/middlewares/authorization.middleware', () => ({
    __esModule: true,
    hasRoles:
        (...roles: string[]) =>
        (_req: any, _res: any, next: any) =>
            next(),
    excludeLoggedInUser: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock API key middleware to skip it
jest.mock('@/middlewares/validateApiKey.middleware', () => ({
    __esModule: true,
    default: (_req: any, _res: any, next: any) => next(),
}));

// Mock file upload middleware to skip
jest.mock('@/middlewares/upload-file.middleware', () => ({
    __esModule: true,
    uploadMiddleware: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@/apis/user/services/user.service', () => {
    const { v4: uuidv4 } = require('uuid');
    return {
        __esModule: true,
        default: class {
            async createUsers(user: any) {
                return { ...user, _id: uuidv4() };
            }
            async updateUser(id: string, data: any) {
                return { ...data, _id: id };
            }
            async deleteUser(id: string) {
                return true;
            }
            async get(id: string) {
                return { _id: id, fullName: 'User One', email: 'user1@example.com' };
            }
            async getAll() {
                return {
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 1,
                    totalUsers: 3,
                    users: [
                        { fullName: 'User One', email: 'user1@example.com' },
                        { fullName: 'User Two', email: 'user2@example.com' },
                        { fullName: 'User Three', email: 'user3@example.com' },
                    ],
                };
            }
        },
    };
});
jest.mock('@/middlewares/queries-validation.middleware', () => ({
    __esModule: true,
    default: (_req: any, _res: any, next: any) => next(),
}));

let app: App;

beforeAll(() => {
    const controllers = [new UserController()];
    app = new App(controllers, 0); // ephemeral port
});

afterAll(async () => {
    const srv = (app as any).server || (app as any).httpServer;
    if (srv && typeof srv.close === 'function') {
        await new Promise<void>((resolve, reject) => srv.close((e: any) => (e ? reject(e) : resolve())));
    }
});

// -------------------- TESTS --------------------

describe('UserController (Admin role)', () => {
    const cookies = ['accessToken=fake-token'];
    it('GET /users/current should return current user info', async () => {
        const res = await request(app.getServer()).get('/api/v1/users/current').set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.fullName).toBe('User One');
        expect(res.body.email).toBe('user1@example.com');
    });

    it('POST /users should create a new user', async () => {
        const res = await request(app.getServer()).post('/api/v1/users').set('Cookie', cookies).send({
            fullName: 'New User',
            email: 'new@example.com',
            roles: 'Candidat',
            country: 'Tunisia',
        });

        expect(res.status).toBe(200);
        expect(res.body.result.fullName).toBe('New User');
    });

    it('PUT /users/:id should update user', async () => {
        const userId = uuidv4();
        const res = await request(app.getServer()).put(`/api/v1/users/${userId}`).set('Cookie', cookies).send({ fullName: 'Updated User' });

        expect(res.status).toBe(200);
        expect(res.body.result.fullName).toBe('Updated User');
        expect(res.body.message).toMatch(/updated successfully/i);
    });

    it('DELETE /users/:id should delete user', async () => {
        const userId = uuidv4();
        const res = await request(app.getServer()).delete(`/api/v1/users/${userId}`).set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted successfully/i);
    });
});
