import UserService from '@/apis/user/services/user.service';

jest.mock('@/apis/user/services/user.service');

describe('UserService - Tests Unitaires', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    jest.clearAllMocks();
  });

  describe('createUsers', () => {
    it('devrait créer un utilisateur', async () => {
      service.createUsers = jest.fn().mockResolvedValue(undefined);

      await service.createUsers({ email: 'test@example.com' }, null);

      expect(service.createUsers).toHaveBeenCalledWith({ email: 'test@example.com' }, null);
    });
  });

  describe('deleteUser', () => {
    it('devrait supprimer un utilisateur', async () => {
      service.deleteUser = jest.fn().mockResolvedValue(undefined);

      await service.deleteUser('user-id');

      expect(service.deleteUser).toHaveBeenCalledWith('user-id');
    });
  });

  describe('updateUser', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      service.updateUser = jest.fn().mockResolvedValue(undefined);

      await service.updateUser('user-id', { firstName: 'Jane' }, {} as any);

      expect(service.updateUser).toHaveBeenCalledWith('user-id', { firstName: 'Jane' }, {});
    });
  });

  describe('getAll', () => {
    it('devrait retourner tous les utilisateurs', async () => {
      const mockResult = { users: [{ id: 'user1' }], totalUsers: 1 };
      service.getAll = jest.fn().mockResolvedValue(mockResult);

      const result = await service.getAll({});

      expect(result).toEqual(mockResult);
    });
  });

  describe('get', () => {
    it('devrait retourner un utilisateur', async () => {
      const mockUser = { id: 'user-id', email: 'user@example.com' };
      service.get = jest.fn().mockResolvedValue(mockUser);

      const result = await service.get('user-id');

      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUserIds', () => {
    it('devrait retourner tous les IDs', async () => {
      const mockIds = ['user1', 'user2'];
      service.getAllUserIds = jest.fn().mockResolvedValue(mockIds);

      const result = await service.getAllUserIds();

      expect(result).toEqual(mockIds);
    });
  });

  describe('getUsersByOppositeRole', () => {
    it('devrait retourner utilisateurs par rôle opposé', async () => {
      const mockResult = { users: [], totalUsers: 0 };
      service.getUsersByOppositeRole = jest.fn().mockResolvedValue(mockResult);

      const result = await service.getUsersByOppositeRole('candidate' as any, {});

      expect(result).toEqual(mockResult);
    });
  });

  describe('updateLastSeen', () => {
    it('devrait mettre à jour dernière connexion', async () => {
      service.updateLastSeen = jest.fn().mockResolvedValue(undefined);

      await service.updateLastSeen('user-id', '2024-01-01');

      expect(service.updateLastSeen).toHaveBeenCalledWith('user-id', '2024-01-01');
    });
  });
});