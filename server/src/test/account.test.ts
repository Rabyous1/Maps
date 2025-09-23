import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import App from '../app';

const fakeUserId = uuidv4();

jest.mock('../middlewares/authentication.middleware', () => ({
    __esModule: true,
    default: (req: any, _res: any, next: any) => {
        req.user = { _id: fakeUserId, roles: ['Recruteur'] };
        next();
    },
}));

jest.mock('@/apis/user/services/account.service', () => {
    return {
        __esModule: true,
        default: class {
            async update(data: any, id: string) {
                return { updated: true, message: 'Account updated' };
            }
            async updatePassword(data: any, id: string) {
                return { updated: true, message: 'Password is updated' };
            }
            async revealFiscal(id: string, password: string) {
                if (password === 'valid-password') return 'TN123456789';
                return null; // invalid password
            }
        },
    };
});

jest.mock('@/utils/jobs/startup-jobs', () => ({ schedulePendingOpportunities: jest.fn() }));
jest.mock('@/utils/jobs/interviews.job', () => ({ startInterviewScheduler: jest.fn() }));
jest.mock('@/utils/services/email-service/email.service', () => ({ sendEmail: jest.fn() }));

import AccountController from '@/apis/user/controllers/account.controller';

let app: App;

beforeAll(async () => {
    const controllers = [new AccountController()];
    app = new App(controllers, 0);
});

afterAll(async () => {
    const srv = (app as any).server || (app as any).httpServer;
    if (srv && typeof srv.close === 'function') {
        await new Promise<void>((resolve, reject) => srv.close((e: any) => (e ? reject(e) : resolve())));
    }
});

describe('AccountController', () => {
    let cookies: string[] = ['accessToken=fake-token'];

    it('PUT /account/password should update password', async () => {
        const res = await request(app.getServer()).put('/api/v1/account/password').set('Cookie', cookies).send({
            currentPassword: 'oldPass',
            newPassword: 'newPass123!',
        });

        expect(res.status).toBe(200);
        expect(res.body.updated).toBe(true);
        expect(res.body.message).toMatch(/password is updated/i);
    });
    it('PUT /account should update account including dateOfBirth', async () => {
        const res = await request(app.getServer()).put('/api/v1/account').set('Cookie', cookies).send({
            fullName: 'Test User',
            email: 'test@example.com',
            dateOfBirth: '1990-05-03',
        });

        expect(res.status).toBe(200);
        expect(res.body.updated).toBe(true);
        expect(res.body.message).toMatch(/account is updated/i);
    });
});
