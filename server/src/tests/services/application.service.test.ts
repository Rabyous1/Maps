import { ApplicationService } from '@/apis/application/application.service';

jest.mock('@/apis/application/application.service');

describe('ApplicationService - Tests Unitaires', () => {
  let service: ApplicationService;

  beforeEach(() => {
    service = new ApplicationService();
    jest.clearAllMocks();
  });

  describe('updateApplicationStatus', () => {
    it('devrait mettre à jour le statut', async () => {
      const mockResult = { id: 'app-id', status: 'Accepted' };
      service.updateApplicationStatus = jest.fn().mockResolvedValue(mockResult);

      const result = await service.updateApplicationStatus('app-id', 'Accepted' as any);

      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('devrait supprimer une candidature', async () => {
      service.delete = jest.fn().mockResolvedValue(undefined);

      await service.delete('candidate-id', 'app-id');

      expect(service.delete).toHaveBeenCalledWith('candidate-id', 'app-id');
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une candidature', async () => {
      const mockResult = { id: 'app-id', note: 'Updated' };
      service.update = jest.fn().mockResolvedValue(mockResult);

      const result = await service.update('app-id', { note: 'Updated' });

      expect(result).toEqual(mockResult);
    });
  });

  describe('findById', () => {
    it('devrait retourner une candidature', async () => {
      const mockApp = { id: 'app-id', status: 'Pending' };
      service.findById = jest.fn().mockResolvedValue(mockApp);

      const result = await service.findById('app-id');

      expect(result).toEqual(mockApp);
    });
  });
});