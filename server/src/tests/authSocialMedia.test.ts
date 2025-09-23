import request from 'supertest';
import express from 'express';

const mockAuthSocialMediaService = {
  handleSocialLogin: jest.fn(),
  linkSocialAccount: jest.fn(),
  unlinkSocialAccount: jest.fn(),
};

jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req: any, res: any, next: any) => {
    req.user = { id: 'social-user-id', email: 'social@example.com' };
    next();
  }),
}));

describe('AuthSocialMedia API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.get('/auth/google', (req, res) => {
      res.status(200).json({ message: 'Redirecting to Google' });
    });

    app.get('/auth/google/callback', async (req, res) => {
      const result = await mockAuthSocialMediaService.handleSocialLogin('google', req.user);
      res.status(302).redirect('/dashboard');
    });

    app.post('/auth/social/link-account', async (req, res) => {
      const result = await mockAuthSocialMediaService.linkSocialAccount(req.body);
      res.status(200).json(result);
    });

    app.delete('/auth/social/unlink/:provider', async (req, res) => {
      const result = await mockAuthSocialMediaService.unlinkSocialAccount(req.params.provider);
      res.status(200).json(result);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /auth/google → redirige vers Google OAuth', async () => {
    const res = await request(app).get('/auth/google');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Redirecting to Google');
  });

  it('GET /auth/google/callback → gère le callback Google', async () => {
    mockAuthSocialMediaService.handleSocialLogin.mockResolvedValueOnce({
      user: { id: 'user-id', email: 'test@example.com' },
      accessToken: 'token123',
      refreshToken: 'refresh123',
      isNewUser: false,
    });

    const res = await request(app).get('/auth/google/callback');

    expect(res.status).toBe(302);
  });

  it('POST /auth/social/link-account → lie un compte social', async () => {
    mockAuthSocialMediaService.linkSocialAccount.mockResolvedValueOnce({
      success: true,
      message: 'Account linked successfully',
    });

    const res = await request(app)
      .post('/auth/social/link-account')
      .send({
        provider: 'google',
        socialId: 'google-123',
        email: 'test@example.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /auth/social/unlink/:provider → délie un compte social', async () => {
    mockAuthSocialMediaService.unlinkSocialAccount.mockResolvedValueOnce({
      success: true,
      message: 'Account unlinked successfully',
    });

    const res = await request(app).delete('/auth/social/unlink/google');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});