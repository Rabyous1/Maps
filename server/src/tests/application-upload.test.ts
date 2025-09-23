import request from 'supertest';
import express from 'express';
import { ApplicationController } from '@/apis/application/application.controller';
import { ApplicationService } from '@/apis/application/application.service';

jest.mock('@/apis/application/application.service');
jest.mock('@/middlewares/authentication.middleware', () =>
  jest.fn((req, res, next) => {
    req.user = { _id: 'fake-user-id' };
    next();
  })
);
jest.mock('@/middlewares/role.middleware', () => ({
  restrictTo: () => (req: any, res: any, next: any) => next()
}));
jest.mock('@/middlewares/validation.middleware', () => ({
  validationMiddleware: () => (req: any, res: any, next: any) => next()
}));
jest.mock('@/utils/config/socket/events/emitNotification', () => ({
  emitNotification: jest.fn()
}));

describe('Application Upload Tests', () => {
  let app: express.Express;
  let controller: ApplicationController;
  let mockService: jest.Mocked<ApplicationService>;

  beforeAll(() => {
    // Mock upload middleware sans fichier
    jest.doMock('@/middlewares/upload-file.middleware', () => ({
      uploadMiddleware: (req: any, res: any, next: any) => {
        req.file = null;
        next();
      }
    }));

    app = express();
    app.use(express.json());
    
    controller = new ApplicationController();
    app.use(controller.router);
    
    mockService = (controller as any).service;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /applications/:id/cvvideo → erreur si aucun fichier fourni', async () => {
    const res = await request(app).put('/applications/app-id/cvvideo');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Aucun fichier fourni.');
  });
});