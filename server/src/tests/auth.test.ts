import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { v4 as uuidv4 } from 'uuid';
import request from 'supertest';
import express from 'express';

// ⚠️ on MOCK AuthService AVANT d'importer AuthController
const fakeUserId = uuidv4();

const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockChooseRole = jest.fn();
const mockResetPassword = jest.fn();
const mockForgotPassword = jest.fn();
const mockDisableTwoFactor = jest.fn();
const mockLogout = jest.fn();

const mockGetAccount = jest.fn();

jest.mock('../apis/auth/auth.service', () => {
  return jest.fn().mockImplementation(() => ({
    signUp: mockSignUp,
    signIn: mockSignIn,
    chooseRole: mockChooseRole,
    resetPassword: mockResetPassword,
    forgotPassword: mockForgotPassword,
    disableTwoFactor: mockDisableTwoFactor,
    logout: mockLogout,
    accountService: {          // ✅ mock ajouté
      getAccount: mockGetAccount,
    },
  }));
});


// ✅ mock JWT pour les tests
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn().mockImplementation(() => ({ id: fakeUserId })), // ✅ renvoie direct un userId
}));


// mock emitNotification pour éviter des appels externes
jest.mock('@/utils/config/socket/events/emitNotification', () => ({
  emitNotification: jest.fn().mockResolvedValue(undefined),
}));

// maintenant qu’AuthService est mocké, on peut importer AuthController
import AuthController from '../apis/auth/auth.controller';
import AccountController from '../apis/user/controllers/account.controller';

import { User } from '@/apis/user/interfaces/user.interfaces';
import { Role } from '@/utils/helpers/constants';

// valeurs d’environnement nécessaires pour le contrôleur
process.env.SYSTEM_USER_ID = 'test-system-user';
process.env.COOKIE_MAX_AGE = '3600000'; // 1h en ms
process.env.ACCESS_TOKEN_PRIVATE_KEY = 'test-secret-key';

// timeout global augmenté pour éviter les dépassements
jest.setTimeout(30000);


const mockUser: User = {
  id: fakeUserId,
  fullName: 'Test User',
  dateOfBirth: null,
  email: 'test@example.com',
  password: 'hashed-password',
  phone: '+21612345678',
  roles: Role.CANDIDAT,
  country: 'Tunisia',
  isVerified: true,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  isFirstTimeLoggedIn: false,
  linkedinLink: '',
  hasNewNotifications: false,
};

describe('AuthController', () => {
  let app: express.Express;
  const fakeCookies = `accessToken=fakeToken123; refreshToken=fakeRefresh123`;

  beforeAll(() => {
  app = express();
  app.use(express.json());

  app.use((req: any, res, next) => {
    req.session = {
      userId: null,
      isLoggedIn: false,
      save: (cb: any) => {
        if (cb) cb(null); // ✅ appelle toujours le callback
      },
      destroy: (cb: any) => {
        if (cb) cb(null);
      },
    };
    next();
  });

  const authController = new AuthController();
  const accountController = new AccountController();
  app.use(authController.router);
  app.use(accountController.router);
});


  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('POST /auth/signup → 201 si succès', async () => {
    mockSignUp.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/auth/signup')
      .send({
        fullName: 'Test User',
        role: 'CANDIDAT',
        email: 'test@example.com',
        password: 'SuperSecret123*',
        phone: '+21612345678',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('created successfully');
  });

  it('POST /auth/signin → 200 avec message Welcome back!', async () => {
    mockSignIn.mockResolvedValue({
      user: { id: fakeUserId, email: 'test@example.com', isFirstTimeLoggedIn: false },
      accessToken: 'token123',
      refreshToken: 'refresh123',
      twoFactorRequired: false,
    });

    const res = await request(app)
      .post('/auth/signin')
      .send({ email: 'test@example.com', password: 'SuperSecret123*' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Welcome back!');
  });

  it('POST /auth/signin → 200 et demande 2FA si twoFactorRequired', async () => {
    mockSignIn.mockResolvedValue({
      user: { id: fakeUserId, email: 'test@example.com', isFirstTimeLoggedIn: false },
      accessToken: null,
      refreshToken: null,
      twoFactorRequired: true,
    });

    const res = await request(app)
      .post('/auth/signin')
      .send({ email: 'test@example.com', password: 'SuperSecret123*' });

    expect(res.status).toBe(200);
    expect(res.body.twoFactorRequired).toBe(true);
    expect(res.body.message).toMatch(/2FA required/i);
  });

  it('PATCH /auth/choose-role → 200', async () => {
    mockChooseRole.mockResolvedValue({
      user: { id: fakeUserId, email: 'test@example.com' },
      accessToken: 'token123',
      refreshToken: 'refresh123',
    });

    const res = await request(app)
      .patch('/auth/choose-role')
      .set('Cookie', fakeCookies) // ✅ simule les cookies
      .send({ role: Role.CANDIDAT });

    expect(res.status).toBe(200);
  });

  it('POST /auth/logout → 200', async () => {
    mockLogout.mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/logout')
      .set('Cookie', fakeCookies);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });

  it('POST /auth/forgot-password → 200', async () => {
    mockForgotPassword.mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'test@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/password reset link sent/i);
  });

 





  it('POST /auth/2fa/disable → 200', async () => {
    mockDisableTwoFactor.mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/2fa/disable')
      .set('Cookie', fakeCookies);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/two-factor authentication disabled/i);
  });
});
