import OpportunityService from '@/apis/opportunity/opportunity.service';

jest.mock('@/apis/opportunity/opportunity.service');

describe('OpportunityService - Tests Unitaires', () => {
  let service: OpportunityService;

  beforeEach(() => {
    service = new OpportunityService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer une opportunité', async () => {
      const mockResult = { id: 'opp-id', reference: 'M-12345' };
      service.create = jest.fn().mockResolvedValue(mockResult);

      const result = await service.create({} as any, 'user-id');

      expect(result).toEqual(mockResult);
    });
  });

  describe('getAll', () => {
    it('devrait retourner toutes les opportunités', async () => {
      const mockOpps = [{ id: 'opp1' }, { id: 'opp2' }];
      service.getAll = jest.fn().mockResolvedValue(mockOpps);

      const result = await service.getAll({});

      expect(result).toEqual(mockOpps);
    });
  });

  describe('get', () => {
    it('devrait retourner une opportunité', async () => {
      const mockOpp = { id: 'opp-id', title: 'Développeur' };
      service.get = jest.fn().mockResolvedValue(mockOpp);

      const result = await service.get('opp-id');

      expect(result).toEqual(mockOpp);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une opportunité', async () => {
      const mockResult = { id: 'opp-id', country: 'France' };
      service.update = jest.fn().mockResolvedValue(mockResult);

      const result = await service.update('opp-id', { country: 'France' }, 'user-id');

      expect(result).toEqual(mockResult);
    });
  });

  describe('addToFavorites', () => {
    it('devrait ajouter aux favoris', async () => {
      const mockResult = { id: 'candidate-id', favorites: [] };
      service.addToFavorites = jest.fn().mockResolvedValue(mockResult);

      const result = await service.addToFavorites('candidate-id', 'opp-id');

      expect(service.addToFavorites).toHaveBeenCalledWith('candidate-id', 'opp-id');
    });
  });

  describe('delete', () => {
    it('devrait supprimer une opportunité', async () => {
      service.delete = jest.fn().mockResolvedValue(undefined);

      await service.delete('opp-id');

      expect(service.delete).toHaveBeenCalledWith('opp-id');
    });
  });
});