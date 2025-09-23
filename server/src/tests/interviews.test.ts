import request from 'supertest';
import express from 'express';
import InterviewsController from '@/apis/interviews/interviews.controller';
import { InterviewService } from '@/apis/interviews/interviews.service';

jest.mock('@/apis/interviews/interviews.service');
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

const mockInterviewService = InterviewService as jest.MockedClass<typeof InterviewService>;
process.env.SYSTEM_USER_ID = 'system-user-id';

describe('Interviews API', () => {
  let app: express.Express;
  let controller: InterviewsController;
  let mockService: jest.Mocked<InterviewService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    controller = new InterviewsController();
    app.use(controller.router);
    
    mockService = (controller as any).interviewService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /interviews → crée un nouvel entretien', async () => {
    const mockInterview = {
      id: 'interview-id',
      candidateId: 'candidate-id',
      opportunity: {
        OpportunityVersions: [{ title: 'Développeur' }]
      }
    };
    mockService.addInterview.mockResolvedValueOnce(mockInterview as any);

    const res = await request(app)
      .post('/interviews')
      .send({
        applicationId: 'app-id',
        date: new Date(),
        durationMinutes: 60,
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockInterview);
  });

  it('GET /interviews → récupère tous les entretiens du recruteur', async () => {
    const mockInterviews = [
      { id: 'interview-1', title: 'Entretien 1' },
      { id: 'interview-2', title: 'Entretien 2' },
    ];
    mockService.getInterviewsByRecruiter.mockResolvedValueOnce(mockInterviews as any);

    const res = await request(app).get('/interviews');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockInterviews);
  });

  it('GET /interviews/:id → récupère un entretien par ID', async () => {
    const mockInterview = { 
      id: 'interview-id', 
      recruiterId: 'fake-user-id',
      title: 'Entretien technique' 
    };
    mockService.getInterviewById.mockResolvedValueOnce(mockInterview as any);

    const res = await request(app).get('/interviews/interview-id');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockInterview);
  });

  it('PATCH /interviews/:id → met à jour un entretien', async () => {
    const mockExisting = { 
      id: 'interview-id', 
      recruiterId: 'fake-user-id',
      date: new Date('2024-01-01')
    };
    const mockUpdated = { 
      id: 'interview-id', 
      candidateId: 'candidate-id',
      opportunity: { OpportunityVersions: [{ title: 'Dev' }] }
    };
    
    mockService.getInterviewById.mockResolvedValueOnce(mockExisting as any);
    mockService.updateInterview.mockResolvedValueOnce(mockUpdated as any);

    const res = await request(app)
      .patch('/interviews/interview-id')
      .send({ date: new Date('2024-01-02') });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUpdated);
  });

  it('DELETE /interviews/:id → supprime un entretien', async () => {
    const mockInterview = { 
      id: 'interview-id', 
      recruiterId: 'fake-user-id',
      candidateId: 'candidate-id',
      date: new Date(),
      opportunity: { OpportunityVersions: [{ title: 'Dev' }] }
    };
    
    mockService.getInterviewById.mockResolvedValueOnce(mockInterview as any);
    mockService.deleteInterview.mockResolvedValueOnce(true as any);

    const res = await request(app).delete('/interviews/interview-id');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Interview cancelled successfully');
  });

  it('GET /interviews/candidate/list → récupère les entretiens du candidat', async () => {
    const mockInterviews = [
      { id: 'interview-1', title: 'Mon entretien' },
    ];
    mockService.getInterviewsByCandidate.mockResolvedValueOnce(mockInterviews as any);

    const res = await request(app).get('/interviews/candidate/list');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockInterviews);
  });
});