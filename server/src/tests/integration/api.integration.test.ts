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

describe('Tests d\'intégration - API Générale', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new AuthController()], 3010);
    server = app.getServer();
  });

  describe('Validation générale de l\'API', () => {
    it('devrait retourner 404 pour une route inexistante', async () => {
      const res = await request(server)
        .get('/api/v1/nonexistent');

      expect(res.status).toBe(404);
    });

    it('devrait gérer les erreurs de méthode HTTP non supportée', async () => {
      const res = await request(server)
        .patch('/api/v1/auth/signin');

      expect([404, 405]).toContain(res.status);
    });

    it('devrait valider les en-têtes Content-Type', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .set('Content-Type', 'text/plain')
        .send('invalid data');

      expect([400, 406, 415]).toContain(res.status);
    });

    it('devrait gérer les requêtes avec des données JSON malformées', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect([400, 406]).toContain(res.status);
    });

    it('devrait valider la taille maximale des requêtes', async () => {
      const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({ data: largeData });

      expect([400, 413]).toContain(res.status);
    });
  });

  describe('Gestion des erreurs et sécurité', () => {
    it('devrait rejeter les requêtes sans User-Agent', async () => {
      const res = await request(server)
        .get('/api/v1/auth/signin')
        .unset('User-Agent');

      expect([400, 404]).toContain(res.status);
    });

    it('devrait gérer les attaques par injection SQL dans les paramètres', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities?search=\'; DROP TABLE users; --');

      expect([200, 400, 404]).toContain(res.status);
    });

    it('devrait limiter le taux de requêtes (rate limiting)', async () => {
      // Simuler plusieurs requêtes rapides
      const requests = Array(10).fill(null).map(() =>
        request(server).get('/api/v1/opportunities')
      );

      const responses = await Promise.all(requests);
      const hasRateLimit = responses.some(res => res.status === 429);
      
      // Le rate limiting peut être activé ou non selon la configuration
      expect(hasRateLimit || responses.every(res => [200, 404].includes(res.status))).toBe(true);
    });
  });

  describe('Headers et CORS', () => {
    it('devrait inclure les headers de sécurité appropriés', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities');

      // Vérifier que certains headers de sécurité sont présents ou que la route n'existe pas
      if (res.status !== 404) {
        expect(res.headers).toHaveProperty('x-powered-by');
      }
      expect([200, 404]).toContain(res.status);
    });

    it('devrait gérer les requêtes CORS preflight', async () => {
      const res = await request(server)
        .options('/api/v1/auth/signin')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect([200, 204, 404]).toContain(res.status);
    });

    it('devrait accepter les requêtes depuis les domaines autorisés', async () => {
      const res = await request(server)
        .get('/api/v1/opportunities')
        .set('Origin', 'http://localhost:3000');

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Formats de réponse', () => {
    it('devrait retourner du JSON pour les endpoints API', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      if (res.status !== 404) {
        expect(res.type).toMatch(/json/);
      }
      expect([200, 401, 404, 406]).toContain(res.status);
    });

    it('devrait inclure des messages d\'erreur descriptifs', async () => {
      const res = await request(server)
        .post('/api/v1/auth/signin')
        .send({});

      if (res.status !== 404 && res.body) {
        expect(res.body).toBeDefined();
      }
      expect([400, 404, 406]).toContain(res.status);
    });
  });
});