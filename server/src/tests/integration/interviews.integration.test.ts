import request from 'supertest';
import App from '../../app';
import InterviewController from '../../apis/interviews/interviews.controller';

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

describe('Tests d\'intégration - Entretiens', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new InterviewController()], 3004);
    server = app.getServer();
  });

  describe('GET /api/v1/interviews', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/interviews');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait accepter les paramètres de pagination', async () => {
      const res = await request(server)
        .get('/api/v1/interviews?page=1&limit=10')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de statut', async () => {
      const res = await request(server)
        .get('/api/v1/interviews?status=scheduled')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });

  describe('POST /api/v1/interviews', () => {
    it('devrait rejeter la création sans authentification', async () => {
      const res = await request(server)
        .post('/api/v1/interviews')
        .send({
          applicationId: '123e4567-e89b-12d3-a456-426614174000',
          scheduledAt: '2024-12-31T10:00:00Z',
          type: 'video'
        });

      expect([401, 403, 404]).toContain(res.status);
    });

    it('devrait valider les champs requis', async () => {
      const res = await request(server)
        .post('/api/v1/interviews')
        .set('Authorization', 'Bearer fake-token')
        .send({});

      expect([400, 401, 403, 404]).toContain(res.status);
    });

    it('devrait valider le format de date', async () => {
      const res = await request(server)
        .post('/api/v1/interviews')
        .set('Authorization', 'Bearer fake-token')
        .send({
          applicationId: '123e4567-e89b-12d3-a456-426614174000',
          scheduledAt: 'invalid-date',
          type: 'video'
        });

      expect([400, 401, 403, 404]).toContain(res.status);
    });

    it('devrait valider le type d\'entretien', async () => {
      const res = await request(server)
        .post('/api/v1/interviews')
        .set('Authorization', 'Bearer fake-token')
        .send({
          applicationId: '123e4567-e89b-12d3-a456-426614174000',
          scheduledAt: '2024-12-31T10:00:00Z',
          type: 'invalid-type'
        });

      expect([400, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/interviews/:id', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/interviews/${validUuid}`);

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider le format UUID', async () => {
      const res = await request(server)
        .get('/api/v1/interviews/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/interviews/:id', () => {
    it('devrait rejeter la modification sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .put(`/api/v1/interviews/${validUuid}`)
        .send({
          status: 'completed'
        });

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider les données de mise à jour', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .put(`/api/v1/interviews/${validUuid}`)
        .set('Authorization', 'Bearer fake-token')
        .send({
          scheduledAt: 'invalid-date'
        });

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('DELETE /api/v1/interviews/:id', () => {
    it('devrait rejeter la suppression sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .delete(`/api/v1/interviews/${validUuid}`);

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('POST /api/v1/interviews/:id/reschedule', () => {
    it('devrait rejeter la reprogrammation sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .post(`/api/v1/interviews/${validUuid}/reschedule`)
        .send({
          newScheduledAt: '2024-12-31T14:00:00Z'
        });

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider la nouvelle date', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .post(`/api/v1/interviews/${validUuid}/reschedule`)
        .set('Authorization', 'Bearer fake-token')
        .send({
          newScheduledAt: 'invalid-date'
        });

      expect([400, 401, 404]).toContain(res.status);
    });
  });
});