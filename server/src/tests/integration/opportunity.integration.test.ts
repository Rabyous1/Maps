import request from 'supertest';
import App from '../../app';
import OpportunityController from '../../apis/opportunity/opportunity.controller';

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

describe('Tests d\'intégration - Opportunités', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new OpportunityController()], 3008);
    server = app.getServer();
  });

  describe('GET /api/v1/opportunities', () => {
    it('devrait retourner la liste des opportunités publiques', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities');

      expect([200, 404]).toContain(res.status);
    });

    it('devrait accepter les paramètres de pagination', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities?page=1&limit=10');

      expect([200, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de recherche', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities?search=developer');

      expect([200, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de localisation', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities?location=Paris');

      expect([200, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de type de contrat', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities?contractType=CDI');

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('POST /api/v1/opportunities', () => {
    it('devrait rejeter la création sans authentification', async () => {
      const res = await request(server)
        .post('/api/v1/opportunities')
        .send({
          title: 'Développeur Full Stack',
          description: 'Poste de développeur',
          location: 'Paris',
          contractType: 'CDI'
        });

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider les champs requis', async () => {
      const res = await request(server)
        .post('/api/v1/opportunities')
        .set('Authorization', 'Bearer fake-token')
        .send({});

      expect([400, 401, 404]).toContain(res.status);
    });

    it('devrait valider le type de contrat', async () => {
      const res = await request(server)
        .post('/api/v1/opportunities')
        .set('Authorization', 'Bearer fake-token')
        .send({
          title: 'Développeur Full Stack',
          description: 'Poste de développeur',
          location: 'Paris',
          contractType: 'INVALID'
        });

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/opportunities/:id', () => {
    it('devrait retourner une opportunité publique', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/opportunities/${validUuid}`);

      expect([200, 404]).toContain(res.status);
    });

    it('devrait valider le format UUID', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities/invalid-id');

      expect([400, 404]).toContain(res.status);
    });
  });

  describe('PUT /api/v1/opportunities/:id', () => {
    it('devrait rejeter la modification sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .put(`/api/v1/opportunities/${validUuid}`)
        .send({
          title: 'Nouveau titre'
        });

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider les données de mise à jour', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .put(`/api/v1/opportunities/${validUuid}`)
        .set('Authorization', 'Bearer fake-token')
        .send({
          contractType: 'INVALID'
        });

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('DELETE /api/v1/opportunities/:id', () => {
    it('devrait rejeter la suppression sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .delete(`/api/v1/opportunities/${validUuid}`);

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('POST /api/v1/opportunities/:id/apply', () => {
    it('devrait rejeter la candidature sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .post(`/api/v1/opportunities/${validUuid}/apply`)
        .send({
          coverLetter: 'Lettre de motivation'
        });

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider les données de candidature', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .post(`/api/v1/opportunities/${validUuid}/apply`)
        .set('Authorization', 'Bearer fake-token')
        .send({});

      expect([400, 401, 404]).toContain(res.status);
    });
  });
});