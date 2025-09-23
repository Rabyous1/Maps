import request from 'supertest';
import express from 'express';
import OpportunityController from '@/apis/opportunity/opportunity.controller';
import OpportunityService from '@/apis/opportunity/opportunity.service';
import { createMockUser } from './test-utils';

jest.mock('@/apis/opportunity/opportunity.service');
process.env.SYSTEM_USER_ID = 'system-user-id';
jest.mock('@/middlewares/authorization.middleware', () => ({
  hasRoles: () => (req: any, res: any, next: any) => next()
}));
jest.mock('@/middlewares/queries-validation.middleware', () =>
  jest.fn((req, res, next) => next())
);
jest.mock('@/middlewares/validation.middleware', () => ({
  validationMiddleware: () => (req: any, res: any, next: any) => next()
}));
jest.mock('@/apis/opportunity/opportunity.middlewares', () => ({
  isAuthenticated: (req: any, res: any, next: any) => {
    req.user = { _id: 'fake-user-id' };
    next();
  }
}));
jest.mock('@/utils/config/socket/events/emitNotification', () => ({
  emitNotification: jest.fn()
}));

const mockOpportunityService = OpportunityService as jest.MockedClass<typeof OpportunityService>;

describe('Opportunities API', () => {
  let app: express.Express;
  let controller: OpportunityController;
  let mockService: jest.Mocked<OpportunityService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    controller = new OpportunityController();
    app.use(controller.router);
    
    mockService = (controller as any).opportunityService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /opportunities/newopp → crée une nouvelle opportunité', async () => {
    const mockOpportunity = {
      id: 'opp-id',
      reference: 'REF-001',
    };
    mockService.create.mockResolvedValueOnce(mockOpportunity as any);

    const res = await request(app)
      .post('/opportunities/newopp')
      .send({
        title: 'Développeur Full Stack',
        description: 'Poste de développeur',
      });

    expect(res.status).toBe(200);
    expect(res.body.result).toEqual(mockOpportunity);
    expect(res.body.message).toBe('Opportunity created successfully!');
    expect(mockService.create).toHaveBeenCalled();
  });

  it('GET /opportunities/allopp → récupère toutes les opportunités', async () => {
    const mockOpportunities = [{ id: 'opp-1', title: 'Dev' }];
    mockService.filterOpportunities.mockResolvedValueOnce(mockOpportunities as any);

    const res = await request(app).get('/opportunities/allopp');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockOpportunities);
    expect(mockService.filterOpportunities).toHaveBeenCalled();
  });

  it('GET /opportunities/published → récupère les opportunités publiées', async () => {
    const mockPublished = [{ id: 'pub-1', title: 'Published Job' }];
    mockService.getPublished.mockResolvedValueOnce(mockPublished as any);

    const res = await request(app).get('/opportunities/published');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockPublished);
    expect(mockService.getPublished).toHaveBeenCalled();
  });

  it('GET /opportunities/:id → récupère une opportunité par ID', async () => {
    const mockOpportunity = { id: 'opp-id', title: 'Développeur' };
    mockService.get.mockResolvedValueOnce(mockOpportunity);

    const res = await request(app).get('/opportunities/opp-id');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockOpportunity);
    expect(mockService.get).toHaveBeenCalledWith('opp-id');
  });

  it('PUT /opportunities/:id → met à jour une opportunité', async () => {
    const mockUpdated = { id: 'opp-id', title: 'Nouveau titre' };
    mockService.update.mockResolvedValueOnce(mockUpdated as any);

    const res = await request(app)
      .put('/opportunities/opp-id')
      .send({ title: 'Nouveau titre' });

    expect(res.status).toBe(200);
    expect(res.body.result).toEqual(mockUpdated);
    expect(res.body.message).toBe('Opportunity updated successfully!');
    expect(mockService.update).toHaveBeenCalledWith('opp-id', { title: 'Nouveau titre' }, 'fake-user-id');
  });

  it('DELETE /opportunities/:id → supprime une opportunité', async () => {
    mockService.delete.mockResolvedValueOnce(undefined);

    const res = await request(app).delete('/opportunities/opp-id');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Opportunity deleted successfully');
    expect(mockService.delete).toHaveBeenCalledWith('opp-id');
  });

  it('GET /opportunities/myopp → récupère mes opportunités', async () => {
    const mockMyOpportunities = {
      opportunities: [{ id: 'my-opp-1' }],
      totalCount: 1,
    };
    mockService.getOpportunitiesByCreatorWithDetails.mockResolvedValueOnce(mockMyOpportunities);

    const res = await request(app).get('/opportunities/myopp');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockMyOpportunities);
    expect(mockService.getOpportunitiesByCreatorWithDetails).toHaveBeenCalledWith('fake-user-id', 1, 10, {});
  });

  // Tests des cas d'erreur
  it('GET /opportunities/:id → erreur si opportunité non trouvée', async () => {
    mockService.get.mockResolvedValueOnce(null);

    const res = await request(app).get('/opportunities/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Opportunity not found');
  });

  it('GET /opportunities/pins → récupère les pins de carte', async () => {
    const mockOpportunities = [{
      id: 'opp-1',
      reference: 'REF-001',
      city: { lat: 48.8566, lng: 2.3522, name: 'Paris' },
      country: 'France',
      industry: 'Tech',
      publishAt: new Date(),
      employmentType: 'Full-time',
      contractType: 'CDI',
      OpportunityVersions: [{ title: 'Dev Job' }]
    }];
    mockService.filterOpportunities.mockResolvedValueOnce(mockOpportunities as any);

    const res = await request(app).get('/opportunities/pins');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      label: 'Dev Job',
      location: {
        lat: 48.8566,
        lon: 2.3522,
        city: 'Paris'
      },
      reference: 'REF-001'
    });
  });

  it('PATCH /opportunities/:id/recover → récupère une opportunité', async () => {
    mockService.recover.mockResolvedValueOnce(undefined as any);

    const res = await request(app).patch('/opportunities/opp-id/recover');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Opportunity recovered successfully');
    expect(mockService.recover).toHaveBeenCalledWith('opp-id');
  });

  it('POST /opportunities/:id/favorite → ajoute aux favoris', async () => {
    const mockResult = { success: true };
    mockService.addToFavorites.mockResolvedValueOnce(mockResult as any);

    const res = await request(app).post('/opportunities/opp-id/favorite');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Opportunity added to favorites!');
    expect(mockService.addToFavorites).toHaveBeenCalledWith('fake-user-id', 'opp-id');
  });

  it('DELETE /opportunities/:id/favorite → retire des favoris', async () => {
    mockService.removeFavoriteOpportunity.mockResolvedValueOnce(undefined as any);

    const res = await request(app).delete('/opportunities/opp-id/favorite');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Opportunity removed from favorites!');
    expect(mockService.removeFavoriteOpportunity).toHaveBeenCalledWith('fake-user-id', 'opp-id');
  });

  it('GET /opportunities/favorites → récupère les favoris', async () => {
    const mockFavorites = {
      opportunities: [{ id: 'fav-1' }],
      totalCount: 1
    };
    mockService.getFavoriteOpportunities.mockResolvedValueOnce(mockFavorites as any);

    const res = await request(app).get('/opportunities/favorites');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockFavorites);
    expect(mockService.getFavoriteOpportunities).toHaveBeenCalled();
  });

  it('PATCH /opportunities/:id/archive → archive une opportunité', async () => {
    const mockOpportunity = { id: 'opp-id', reference: 'REF-001' };
    mockService.get.mockResolvedValueOnce(mockOpportunity as any);
    mockService.archiveOpportunity.mockResolvedValueOnce(true as any);

    const res = await request(app)
      .patch('/opportunities/opp-id/archive')
      .send({ isArchived: true });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Opportunity archived successfully.');
    expect(mockService.archiveOpportunity).toHaveBeenCalledWith('opp-id', true, 'fake-user-id');
  });

  it('PATCH /opportunities/:id/archive → erreur si isArchived n\'est pas boolean', async () => {
    const res = await request(app)
      .patch('/opportunities/opp-id/archive')
      .send({ isArchived: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('isArchived must be a boolean');
  });

  it('PATCH /opportunities/:id/archive → erreur si opportunité non trouvée', async () => {
    mockService.get.mockResolvedValueOnce(null);

    const res = await request(app)
      .patch('/opportunities/opp-id/archive')
      .send({ isArchived: true });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Opportunity not found');
  });
});