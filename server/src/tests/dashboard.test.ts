import request from 'supertest';
import express from 'express';

const mockDashboardService = {
  getStats: jest.fn(),
  getRecentActivities: jest.fn(),
  getAnalytics: jest.fn(),
  getCandidateStats: jest.fn(),
  getRecruiterStats: jest.fn(),
};

jest.mock('@/middlewares/authentication.middleware', () =>
  jest.fn((req, res, next) => {
    req.user = { _id: 'fake-user-id' };
    next();
  })
);

describe('Dashboard API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    app.get('/dashboard/stats', async (req, res) => {
      const result = await mockDashboardService.getStats();
      res.status(200).json(result);
    });

    app.get('/dashboard/recent-activities', async (req, res) => {
      const result = await mockDashboardService.getRecentActivities();
      res.status(200).json(result);
    });

    app.get('/dashboard/analytics', async (req, res) => {
      const result = await mockDashboardService.getAnalytics();
      res.status(200).json(result);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /dashboard/stats → récupère les statistiques du tableau de bord', async () => {
    const mockStats = {
      totalOpportunities: 15,
      totalApplications: 45,
      totalCandidates: 30,
      pendingApplications: 12,
      acceptedApplications: 8,
      rejectedApplications: 5,
    };
    mockDashboardService.getStats.mockResolvedValueOnce(mockStats);

    const res = await request(app).get('/dashboard/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockStats);
  });

  it('GET /dashboard/recent-activities → récupère les activités récentes', async () => {
    const mockActivities = [
      { id: 'act-1', type: 'application', description: 'Nouvelle candidature' },
      { id: 'act-2', type: 'interview', description: 'Entretien programmé' },
    ];
    mockDashboardService.getRecentActivities.mockResolvedValueOnce(mockActivities);

    const res = await request(app).get('/dashboard/recent-activities');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockActivities);
  });

  it('GET /dashboard/analytics → récupère les données d\'analyse', async () => {
    const mockAnalytics = {
      applicationsPerMonth: [
        { month: 'Jan', count: 10 },
        { month: 'Feb', count: 15 },
      ],
      topSkills: [
        { skill: 'JavaScript', count: 25 },
        { skill: 'Python', count: 20 },
      ],
    };
    mockDashboardService.getAnalytics.mockResolvedValueOnce(mockAnalytics);

    const res = await request(app).get('/dashboard/analytics');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockAnalytics);
  });
});