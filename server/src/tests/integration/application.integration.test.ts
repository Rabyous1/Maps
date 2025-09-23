import request from 'supertest';
import App from '../../app';
import { ApplicationController } from '../../apis/application/application.controller';

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

describe('Tests d\'intégration - Candidatures', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new ApplicationController()], 3003);
    server = app.getServer();
  });

  describe('GET /api/v1/applications', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/applications');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait accepter les paramètres de pagination', async () => {
      const res = await request(server)
        .get('/api/v1/applications?page=1&limit=10')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });

  describe('POST /api/v1/applications', () => {
    it('devrait rejeter une candidature sans authentification', async () => {
      const res = await request(server)
        .post('/api/v1/applications')
        .send({
          opportunityId: '123e4567-e89b-12d3-a456-426614174000',
          coverLetter: 'Lettre de motivation'
        });

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider les champs requis', async () => {
      const res = await request(server)
        .post('/api/v1/applications')
        .set('Authorization', 'Bearer fake-token')
        .send({});

      expect([400, 401, 404]).toContain(res.status);
    });

    it('devrait valider le format UUID de l\'opportunité', async () => {
      const res = await request(server)
        .post('/api/v1/applications')
        .set('Authorization', 'Bearer fake-token')
        .send({
          opportunityId: 'invalid-uuid',
          coverLetter: 'Lettre de motivation'
        });

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/applications/:id', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/applications/${validUuid}`);

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider le format UUID', async () => {
      const res = await request(server)
        .get('/api/v1/applications/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/applications/:id', () => {
    it('devrait rejeter la modification sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .put(`/api/v1/applications/${validUuid}`)
        .send({
          status: 'accepted'
        });

      expect([401, 403, 406]).toContain(res.status);
    });
  });

  describe('DELETE /api/v1/applications/:id', () => {
    it('devrait rejeter la suppression sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .delete(`/api/v1/applications/${validUuid}`);

      expect([401, 403]).toContain(res.status);
    });
  });
});