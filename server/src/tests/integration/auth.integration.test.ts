import request from 'supertest';
import App from '../../app';
import AuthController from '../../apis/auth/auth.controller';

// Mock des dépendances
jest.mock('../../utils/databases', () => ({
  postgresConnect: jest.fn().mockResolvedValue(true),
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    })
  }
}));

jest.mock('../../utils/jobs/startup-jobs', () => ({
  schedulePendingOpportunities: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../utils/jobs/interviews.job', () => ({
  startInterviewScheduler: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../utils/config/socket', () => ({
  initialiseSocket: jest.fn()
}));

describe('Tests d\'intégration - Authentification', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new AuthController()], 3001);
    server = app.getServer();
  });

  describe('POST /api/v1/auth/signin', () => {
    it('devrait retourner une erreur pour des identifiants manquants', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({});

      expect([400, 406]).toContain(res.status);
    });

    it('devrait retourner une erreur pour un email invalide', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect([400, 406]).toContain(res.status);
    });
  });

  describe('POST /api/v1/auth/signup', () => {
    it('devrait retourner une erreur pour des données manquantes', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signup')
        .send({});

      expect([400, 406]).toContain(res.status);
    });

    it('devrait valider le format email', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect([400, 406]).toContain(res.status);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('devrait accepter un email valide', async () => {
      const res = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect([200, 404]).toContain(res.status);
    });

    it('devrait rejeter un email invalide', async () => {
      const res = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'invalid-email'
        });

      expect([400, 406]).toContain(res.status);
    });
  });
});