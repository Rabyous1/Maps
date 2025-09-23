import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
import { v4 as uuidv4 } from 'uuid';
const fakeUserId = uuidv4();

// -------------------- TEST-ONLY / AUTH MIDDLEWARE MOCK --------------------
// NOTE: this must run BEFORE importing App/controllers so the real middleware isn't used.
// Use a relative path from src/tests -> src/middlewares/auth.middleware
jest.mock('../middlewares/authentication.middleware', () => {
    return {
        __esModule: true,
        default: (req: any, res: any, next: any) => {
            // Match the shape your middleware sets: { _id, roles }
            req.user = { _id: fakeUserId, roles: ['CANDIDAT'] };
            return next();
        },
    };
});

// -------------------- MOCKS --------------------
// AuthService (isFirstTimeLoggedIn: true)
jest.mock('@/apis/auth/auth.service', () => {
    return jest.fn().mockImplementation(() => ({
        signUp: jest.fn().mockResolvedValue({ id: fakeUserId, email: 'testuser@example.com' }),
        signIn: jest.fn().mockResolvedValue({
            user: { id: fakeUserId, email: 'testuser@example.com', isFirstTimeLoggedIn: true }, // <-- true now
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
            twoFactorRequired: false,
        }),
        chooseRole: jest.fn().mockResolvedValue({
            user: { id: fakeUserId, email: 'testuser@example.com' },
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
        }),
        resetPassword: jest.fn().mockResolvedValue(true),
        confirmAccount: jest.fn().mockResolvedValue(true),
        enableTwoFactor: jest.fn().mockResolvedValue({ qrCodeDataURL: 'fake-qr-url' }),
        confirmTwoFactor: jest.fn().mockResolvedValue(true),
        verifyTwoFactor: jest.fn().mockResolvedValue({
            user: { id: fakeUserId, email: 'testuser@example.com' },
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
        }),
        disableTwoFactor: jest.fn().mockResolvedValue(true),
        logout: jest.fn().mockResolvedValue(true),
        forgotPassword: jest.fn().mockResolvedValue(true),
    }));
});

// AccountService mock — prevents DB queries and returns expected shapes
jest.mock('@/apis/user/services/account.service', () => {
    return {
        __esModule: true,
        default: class {
            // emulate getAccount(field) — return a fake user if asked
            async getAccount(field: any) {
                // return a user matching the injected middleware user id
                return { id: fakeUserId, _id: fakeUserId, email: 'testuser@example.com' };
            }
            // emulate update(...) — controller expects { updated: true } or similar
            async update(userId: string, payload: any) {
                return { updated: true };
            }
            // optionally implement other methods if controllers call them
            async someOtherMethod() {
                return undefined;
            }
        },
    };
});

// Upload middleware (skip)
jest.mock('@/middlewares/upload-file.middleware', () => ({
    uploadMiddleware: (req: any, res: any, next: any) => next(),
}));

// Email service (skip sending)
jest.mock('@/utils/services/email-service/email.service', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}));

// Jobs (skip)
jest.mock('@/utils/jobs/startup-jobs', () => ({
    schedulePendingOpportunities: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/utils/jobs/interviews.job', () => ({
    startInterviewScheduler: jest.fn().mockReturnValue(undefined),
}));

// -------------------- REAL IMPORTS --------------------
import AuthController from '@/apis/auth/auth.controller';
import AccountController from '@/apis/user/controllers/account.controller';
import { postgresConnect } from '@/utils/databases';
import App from '../app';
import request from 'supertest';
import { Role } from '@/utils/helpers/constants';

let app: App;

beforeAll(async () => {
    // If you prefer no DB access at all in tests, mock postgresConnect above instead.
    await postgresConnect();
    const controllers = [new AuthController(), new AccountController()];
    app = new App(controllers, 0); // port 0 for testing
});

afterAll(async () => {
    try {
        const dbModule = require('@/utils/databases');
        if (typeof dbModule.closePostgres === 'function') await dbModule.closePostgres();
        else if (typeof dbModule.close === 'function') await dbModule.close();
    } catch {}
    try {
        const srv = (app as any).server || (app as any).httpServer;
        if (srv && typeof srv.close === 'function') {
            await new Promise<void>((resolve, reject) => srv.close((e: any) => (e ? reject(e) : resolve())));
        }
    } catch {}
    await new Promise(r => setTimeout(r, 50));
});

// -------------------- TESTS --------------------
describe('AuthController -> Account update', () => {
    const testUserEmail = 'testuser@example.com';
    const testUserPassword = 'Test1234!';
    let cookies: string[] = [];

    it('Signup', async () => {
        const res = await request(app.getServer()).post('/api/v1/auth/signup').send({
            fullName: 'Test User',
            email: testUserEmail,
            password: testUserPassword,
            confirmPassword: testUserPassword,
            phone: '+21612345678',
            country: 'Tunisia',
        });
        expect(res.status).toBe(201);
    });

    it('Signin', async () => {
        const res = await request(app.getServer()).post('/api/v1/auth/signin').send({
            email: testUserEmail,
            password: testUserPassword,
        });
        expect(res.status).toBe(200);

        const rawCookies = res.headers['set-cookie'];
        cookies = Array.isArray(rawCookies) ? rawCookies.map(c => c.split(';')[0]) : rawCookies ? [rawCookies.split(';')[0]] : [];
        expect(cookies.length).toBeGreaterThan(0);
    });

    it('Choose role', async () => {
        const res = await request(app.getServer()).patch('/api/v1/auth/choose-role').set('Cookie', cookies).send({ role: Role.CANDIDAT });
        expect(res.status).toBe(200);
    });

    it('Update candidate fields', async () => {
        const payload = {
            summary: 'This is a valid summary with more than five words',
            skills: ['JavaScript', 'TypeScript'],
            languages: [{ name: 'English', level: 'Full professional' }],
            professionalExperience: [{ company: 'Company A', role: 'Developer', startDate: '2020-01-01', endDate: '2021-01-01' }],
            education: [{ school: 'University X', degree: 'Bachelor', startDate: '2015-01-01', endDate: '2019-01-01' }],
            certification: [{ name: 'Cert A', institution: 'Institute X', date: '2022-01-01' }],
        };
        const res = await request(app.getServer()).put('/api/v1/account').set('Cookie', cookies).send(payload);
        expect(res.status).toBe(200);
        expect(res.body.updated).toBe(true);
    });
});

describe('AuthController -> Logout, Forgot/Reset Password & 2FA', () => {
    let cookies: string[] = [];

    beforeAll(async () => {
        const signinRes = await request(app.getServer()).post('/api/v1/auth/signin').send({
            email: 'testuser@example.com',
            password: 'Test1234!',
        });
        const rawCookies = signinRes.headers['set-cookie'];
        cookies = Array.isArray(rawCookies) ? rawCookies.map(c => c.split(';')[0]) : rawCookies ? [rawCookies.split(';')[0]] : [];
    });

    it('POST /auth/logout should log the user out', async () => {
        const res = await request(app.getServer()).post('/api/v1/auth/logout').set('Cookie', cookies);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/logged out/i);
    });

    it('POST /auth/forgot-password should send a reset link', async () => {
        const res = await request(app.getServer()).post('/api/v1/auth/forgot-password').send({ email: 'testuser@example.com' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/password reset link sent/i);
    });

    it('POST /auth/reset-password should reset password', async () => {
        const res = await request(app.getServer()).post(`/api/v1/auth/reset-password?token=dummy-reset-token`).send({ password: 'NewPass123!' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/password reset successful/i);
    });

    it('POST /auth/2fa/disable should disable 2FA', async () => {
        const res = await request(app.getServer()).post('/api/v1/auth/2fa/disable').set('Cookie', cookies);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/two-factor authentication disabled/i);
    });
});
