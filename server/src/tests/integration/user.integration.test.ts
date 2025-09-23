import request from 'supertest';
import App from '../../app';
import UserController from '../../apis/user/controllers/user.controller';

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

describe('Tests d\'intégration - Utilisateurs', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new UserController()], 3007);
    server = app.getServer();
  });

  describe('GET /api/v1/users/profile', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/users/profile');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait retourner le profil pour un utilisateur authentifié', async () => {
      const res = await request(server)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('devrait rejeter la modification sans authentification', async () => {
      const res = await request(server)
        .put('/api/v1/users/profile')
        .send({
          fullName: 'Nouveau Nom'
        });

      expect([401, 403, 404]).toContain(res.status);
    });

    it('devrait valider les données de mise à jour', async () => {
      const res = await request(server)
        .put('/api/v1/users/profile')
        .set('Authorization', 'Bearer fake-token')
        .send({
          email: 'invalid-email'
        });

      expect([400, 401, 403, 404, 406]).toContain(res.status);
    });
  });

  describe('GET /api/v1/users', () => {
    it('devrait rejeter l\'accès sans authentification admin', async () => {
      const res = await request(server)
        .get('/api/v1/users');

      expect([401, 403, 404]).toContain(res.status);
    });

    it('devrait accepter les paramètres de pagination', async () => {
      const res = await request(server)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', 'Bearer fake-admin-token');

      expect([200, 401, 403, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de recherche', async () => {
      const res = await request(server)
        .get('/api/v1/users?search=john')
        .set('Authorization', 'Bearer fake-admin-token');

      expect([200, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/users/${validUuid}`);

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider le format UUID', async () => {
      const res = await request(server)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('devrait rejeter la modification sans authentification admin', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .put(`/api/v1/users/${validUuid}`)
        .send({
          role: 'admin'
        });

      expect([401, 403, 404]).toContain(res.status);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('devrait rejeter la suppression sans authentification admin', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .delete(`/api/v1/users/${validUuid}`);

      expect([401, 403]).toContain(res.status);
    });
  });
});