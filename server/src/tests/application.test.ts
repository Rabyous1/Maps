import request from 'supertest';
import express from 'express';
import { ApplicationController } from '@/apis/application/application.controller';
import { ApplicationService } from '@/apis/application/application.service';
import { ApplicationStatus, InterestStatus } from '@/utils/helpers/constants';
import { createMockUser } from './test-utils';

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
jest.mock('@/middlewares/upload-file.middleware', () => ({
  uploadMiddleware: (req: any, res: any, next: any) => {
    req.file = req.file || { filename: 'test.pdf' };
    next();
  }
}));
jest.mock('@/middlewares/validation.middleware', () => ({
  validationMiddleware: () => (req: any, res: any, next: any) => next()
}));
jest.mock('@/utils/config/socket/events/emitNotification', () => ({
  emitNotification: jest.fn()
}));

const mockApplicationService = ApplicationService as jest.MockedClass<typeof ApplicationService>;

describe('Applications API', () => {
  let app: express.Express;
  let controller: ApplicationController;
  let mockService: jest.Mocked<ApplicationService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    controller = new ApplicationController();
    app.use(controller.router);
    
    mockService = (controller as any).service;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /applications/:id/apply → applique à une opportunité', async () => {
    const mockApplication = {
      id: 'app-id',
      status: ApplicationStatus.PENDING,
      interest: InterestStatus.NOT_MENTIONED,
      applicationDate: new Date(),
      note: '',
      resume: 'resume.pdf',
      cvvideo: '',
      candidate: createMockUser(),
      opportunity: { id: 'opp-id' } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockService.applyToOpportunity.mockResolvedValueOnce({
      message: 'Application submitted',
      resumeAlreadyExisted: false,
      application: mockApplication,
    });

    const res = await request(app)
      .post('/applications/opportunity-id/apply')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Application submitted');
    expect(mockService.applyToOpportunity).toHaveBeenCalled();
  });

  it('GET /applications/myapplications → récupère mes candidatures', async () => {
    const mockApplications = {
      pageNumber: 1,
      pageSize: 10,
      totalApplications: 1,
      totalPages: 1,
      applications: [{ id: 'app-1' }],
    };
    const mockStats = { total: 1, pending: 1 };

    mockService.findMyApplications.mockResolvedValueOnce(mockApplications);
    mockService.getCandidateStats.mockResolvedValueOnce(mockStats);

    const res = await request(app).get('/applications/myapplications');

    expect(res.status).toBe(200);
    expect(res.body.applications).toEqual([{ id: 'app-1' }]);
    expect(res.body.stats).toEqual(mockStats);
    expect(mockService.findMyApplications).toHaveBeenCalled();
    expect(mockService.getCandidateStats).toHaveBeenCalled();
  });

  it('PUT /applications/:id/updatestatus → met à jour le statut (recruteur)', async () => {
    const mockUpdated = {
      id: 'app-id',
      status: ApplicationStatus.ACCEPTED,
      interest: InterestStatus.NOT_MENTIONED,
      applicationDate: new Date(),
      note: '',
      resume: 'resume.pdf',
      cvvideo: '',
      candidate: createMockUser(),
      opportunity: { id: 'opp-id' } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockService.updateApplicationStatus.mockResolvedValueOnce(mockUpdated);

    const res = await request(app)
      .put('/applications/app-id/updatestatus')
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Application status updated successfully');
    expect(mockService.updateApplicationStatus).toHaveBeenCalledWith('app-id', 'ACCEPTED');
  });

  it('PUT /applications/:id/interest → met à jour le statut d\'intérêt', async () => {
    const mockUpdated = {
      id: 'app-id',
      status: ApplicationStatus.PENDING,
      interest: InterestStatus.INTERESTED,
      applicationDate: new Date(),
      note: '',
      resume: 'resume.pdf',
      cvvideo: '',
      candidate: createMockUser(),
      opportunity: { id: 'opp-id' } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockService.updateInterestStatus.mockResolvedValueOnce(mockUpdated);

    const res = await request(app)
      .put('/applications/app-id/interest')
      .send({ interest: 'INTERESTED' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 'app-id',
      interest: 'Interested'
    });
    expect(mockService.updateInterestStatus).toHaveBeenCalledWith('app-id', 'INTERESTED');
  });

  it('DELETE /applications/:id → supprime une candidature', async () => {
    mockService.delete.mockResolvedValueOnce(undefined);

    const res = await request(app).delete('/applications/app-id');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Application deleted successfully');
    expect(mockService.delete).toHaveBeenCalledWith('fake-user-id', 'app-id');
  });

  it('GET /applications/:id/candidates → récupère les candidats par opportunité', async () => {
    const mockCandidates = {
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      candidates: [{
        candidate: createMockUser(),
        status: ApplicationStatus.PENDING,
        applicationId: 'app-id',
        applicationDate: new Date(),
        resume: 'resume.pdf',
        resumeDisplayName: 'resume.pdf',
        resumeVideo: null,
        resumeVideoDisplayName: null,
        interest: InterestStatus.NOT_MENTIONED
      }]
    };
    mockService.getCandidatesByOpportunityId.mockResolvedValueOnce(mockCandidates);

    const res = await request(app).get('/applications/opp-id/candidates');

    expect(res.status).toBe(200);
    expect(res.body.candidates).toHaveLength(1);
    expect(res.body.candidates[0]).toMatchObject({
      applicationId: 'app-id',
      interest: 'Not Mentioned'
    });
    expect(mockService.getCandidatesByOpportunityId).toHaveBeenCalledWith('opp-id', {});
  });

  it('PUT /applications/:id → met à jour une candidature', async () => {
    const mockUpdated = {
      id: 'app-id',
      status: ApplicationStatus.PENDING,
      interest: InterestStatus.NOT_MENTIONED,
      applicationDate: new Date(),
      note: 'Updated note',
      resume: 'resume.pdf',
      cvvideo: '',
      candidate: createMockUser(),
      opportunity: { id: 'opp-id' } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockService.update.mockResolvedValueOnce(mockUpdated);

    const res = await request(app)
      .put('/applications/app-id')
      .send({ note: 'Updated note' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 'app-id',
      note: 'Updated note'
    });
    expect(mockService.update).toHaveBeenCalledWith('app-id', { note: 'Updated note' });
  });

  // Tests des cas d'erreur
  it('PUT /applications/:id/updatestatus → erreur si statut manquant', async () => {
    const res = await request(app)
      .put('/applications/app-id/updatestatus')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Status is required');
  });

  it('PUT /applications/:id/updatestatus → erreur si application non trouvée', async () => {
    mockService.updateApplicationStatus.mockResolvedValueOnce(null);

    const res = await request(app)
      .put('/applications/app-id/updatestatus')
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Application not found');
  });

  it('PUT /applications/:id → erreur si application non trouvée', async () => {
    mockService.update.mockResolvedValueOnce(null);

    const res = await request(app)
      .put('/applications/app-id')
      .send({ status: 'UPDATED' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Application not found');
  });

  it('GET /applications/list → récupère toutes les applications groupées', async () => {
    const mockResult = { jobs: [], totalCount: 0 };
    mockService.getAllGroupedByJobOffer.mockResolvedValueOnce(mockResult as any);

    const res = await request(app).get('/applications/list');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
    expect(mockService.getAllGroupedByJobOffer).toHaveBeenCalled();
  });

  it('GET /applications → récupère les jobs avec candidatures paginées', async () => {
    const mockResult = {
      pageNumber: 1,
      pageSize: 5,
      totalPages: 1,
      total: 0,
      jobs: []
    };
    mockService.getJobsWithApplicationsPaginated.mockResolvedValueOnce(mockResult);

    const res = await request(app).get('/applications');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
    expect(mockService.getJobsWithApplicationsPaginated).toHaveBeenCalled();
  });

  it('GET /applications/candidate/:candidateId → récupère par ID candidat', async () => {
    const mockApplications = [{
      id: 'app-1',
      status: ApplicationStatus.PENDING,
      interest: InterestStatus.NOT_MENTIONED,
      applicationDate: new Date(),
      note: '',
      resume: 'resume.pdf',
      cvvideo: '',
      candidate: createMockUser(),
      opportunity: { id: 'opp-id' } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    }];
    mockService.findByCandidateId.mockResolvedValueOnce(mockApplications);

    const res = await request(app).get('/applications/candidate/candidate-id');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: 'app-1',
      interest: 'Not Mentioned'
    });
    expect(mockService.findByCandidateId).toHaveBeenCalledWith('candidate-id');
  });

  it('PUT /applications/:id/cvvideo → met à jour la vidéo CV', async () => {
    const mockResult = {
      id: 'app-id',
      status: ApplicationStatus.PENDING,
      interest: InterestStatus.NOT_MENTIONED,
      applicationDate: new Date(),
      note: '',
      resume: 'resume.pdf',
      cvvideo: 'video.mp4',
      candidate: createMockUser(),
      opportunity: { id: 'opp-id' } as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockService.updateCvVideo.mockResolvedValueOnce(mockResult);

    const res = await request(app).put('/applications/app-id/cvvideo');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 'app-id',
      cvvideo: 'video.mp4'
    });
    expect(mockService.updateCvVideo).toHaveBeenCalled();
  });


});