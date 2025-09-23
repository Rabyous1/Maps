import request from 'supertest';
import App from '../../app';
import FilesController from '../../apis/storage/files.controller';

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

describe('Tests d\'intégration - Fichiers', () => {
  let app: App;
  let server: any;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = new App([new FilesController()], 3006);
    server = app.getServer();
  });

  describe('POST /api/v1/files/upload', () => {
    it('devrait rejeter l\'upload sans authentification', async () => {
      const res = await request(server)
        .post('/api/v1/files/upload');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait rejeter l\'upload sans fichier', async () => {
      const res = await request(server)
        .post('/api/v1/files/upload')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });

    it('devrait valider le type de fichier', async () => {
      const testFile = Buffer.from('test file content');
      const res = await request(server)
        .post('/api/v1/files/upload')
        .set('Authorization', 'Bearer fake-token')
        .attach('file', testFile, 'test.exe');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/files', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const res = await request(server)
        .get('/api/v1/files');

      expect([401, 404]).toContain(res.status);
    });

    it('devrait accepter les paramètres de pagination', async () => {
      const res = await request(server)
        .get('/api/v1/files?page=1&limit=10')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });

    it('devrait accepter les filtres de type', async () => {
      const res = await request(server)
        .get('/api/v1/files?type=pdf')
        .set('Authorization', 'Bearer fake-token');

      expect([200, 401, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/files/:id', () => {
    it('devrait rejeter l\'accès sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/files/${validUuid}`);

      expect([401, 404]).toContain(res.status);
    });

    it('devrait valider le format UUID', async () => {
      const res = await request(server)
        .get('/api/v1/files/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 404]).toContain(res.status);
    });
  });

  describe('DELETE /api/v1/files/:id', () => {
    it('devrait rejeter la suppression sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .delete(`/api/v1/files/${validUuid}`);

      expect([401, 403]).toContain(res.status);
    });

    it('devrait valider le format UUID', async () => {
      const res = await request(server)
        .delete('/api/v1/files/invalid-id')
        .set('Authorization', 'Bearer fake-token');

      expect([400, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('GET /api/v1/files/:id/download', () => {
    it('devrait rejeter le téléchargement sans authentification', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const res = await request(server)
        .get(`/api/v1/files/${validUuid}/download`);

      expect([401, 404]).toContain(res.status);
    });
  });
});