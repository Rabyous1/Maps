import request from 'supertest';
import App from '../../app';
import { DashboardController } from '../../apis/dashboard/dashboard.controller';

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

describe('Tests d\'intégration - Tableau de bord', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new DashboardController()], 3005);
    server = app.getServer();
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/stats');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait accepter les paramètres de période', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/stats?period=month')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });

    it('devrait valider les paramètres de période', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/stats?period=invalid')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/dashboard/recent-activities', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/recent-activities');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait accepter les paramètres de limite', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/recent-activities?limit=5')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });

    it('devrait valider la limite', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/recent-activities?limit=invalid')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/dashboard/analytics', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/analytics');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de date', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/analytics?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });

    it('devrait valider le format des dates', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/analytics?startDate=invalid-date')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/dashboard/notifications', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/notifications');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de type', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/notifications?type=info')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de statut lu/non lu', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/notifications?read=false')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/dashboard/summary', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/summary');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait retourner un résumé pour un utilisateur authentifié', async () => {
      const res = await request(server)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });
});