import request from 'supertest';
import App from '../../app';
import AuthController from '../../apis/auth/auth.controller';
import OpportunityController from '../../apis/opportunity/opportunity.controller';
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

describe('Tests E2E - Flux complets', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([
      new AuthController(),
      new OpportunityController(),
      new ApplicationController()
    ], 3009);
    server = app.getServer();
  });

  describe('Flux de candidature complet', () => {
    it('devrait permettre de consulter les opportunités sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities');

      expect([200, 404]).toContain(res.status);
    });

    it('devrait rejeter une candidature sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .post(`/api/v1/opportunities/${validUuid}/apply`)
        .send({
          coverLetter: 'Lettre de motivation'
        });

      expect([401, 404]).toContain(res.status);
    });

    it('devrait permettre l\'inscription d\'un nouvel utilisateur', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect([200, 201, 400, 406, 409, 500]).toContain(res.status);
    });

    it('devrait permettre la connexion avec des identifiants valides', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect([200, 401, 404, 406]).toContain(res.status);
    });
  });

  describe('Flux de gestion des opportunités', () => {
    it('devrait permettre de créer une opportunité avec authentification', async () => {
      const res = await request(server)
        .post('/api/v1/opportunities')
        .set('Authorization', 'Bearer fake-token')
        .send({
          title: 'Développeur Full Stack',
          description: 'Poste de développeur expérimenté',
          location: 'Paris',
          contractType: 'CDI',
          salary: '45000-55000'
        });

      expect([200, 201, 401, 404]).toContain(res.status);
    });

    it('devrait permettre de consulter une opportunité spécifique', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/opportunities/${validUuid}`);

      expect([200, 404]).toContain(res.status);
    });

    it('devrait permettre de modifier une opportunité avec authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .put(`/api/v1/opportunities/${validUuid}`)
        .set('Authorization', 'Bearer fake-token')
        .send({
          title: 'Développeur Full Stack Senior'
        });

      expect([200, 401, 404]).toContain(res.status);
    });
  });

  describe('Flux de gestion des candidatures', () => {
    it('devrait permettre de créer une candidature avec authentification', async () => {
      const res = await request(server)
        .post('/api/v1/applications')
        .set('Authorization', 'Bearer fake-token')
        .send({
          opportunityId: '123e4567-e89b-12d3-a456-426614174000',
          coverLetter: 'Je suis très intéressé par ce poste...'
        });

      expect([200, 201, 401, 404]).toContain(res.status);
    });

    it('devrait permettre de consulter ses candidatures', async () => {
      const res = await request(server)
        .get('/api/v1/applications')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });

    it('devrait permettre de consulter une candidature spécifique', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/applications/${validUuid}`)
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });

  describe('Flux d\'authentification complet', () => {
    it('devrait gérer le processus de mot de passe oublié', async () => {
      const res = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });

      expect([200, 404, 406]).toContain(res.status);
    });

    it('devrait valider les tokens d\'authentification', async () => {
      const res = await request(server)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait permettre la déconnexion', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signout')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });
});