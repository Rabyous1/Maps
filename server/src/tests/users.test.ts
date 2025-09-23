import UserService from '@/apis/user/services/user.service';

jest.mock('@/apis/user/services/user.service');

const mockUserService = UserService as jest.MockedClass<typeof UserService>;

describe('User Service Tests', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    jest.clearAllMocks();
  });

  it('devrait récupérer tous les utilisateurs', async () => {
    const mockResult = {
      users: [
        { id: 'user1', email: 'user1@test.com', role: 'candidate' },
        { id: 'user2', email: 'user2@test.com', role: 'recruiter' }
      ],
      totalUsers: 2
    };

    service.getAll = jest.fn().mockResolvedValue(mockResult);

    const result = await service.getAll({});

    expect(result).toEqual(mockResult);
    expect(service.getAll).toHaveBeenCalledWith({});
  });

  it('devrait récupérer un utilisateur par ID', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'user@test.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    service.get = jest.fn().mockResolvedValue(mockUser);

    const result = await service.get('user-id');

    expect(result).toEqual(mockUser);
    expect(service.get).toHaveBeenCalledWith('user-id');
  });

  it('devrait mettre à jour un utilisateur', async () => {
    service.updateUser = jest.fn().mockResolvedValue(undefined);

    await service.updateUser('user-id', { firstName: 'Jane' }, {} as any);

    expect(service.updateUser).toHaveBeenCalledWith('user-id', { firstName: 'Jane' }, {});
  });

  it('devrait supprimer un utilisateur', async () => {
    service.deleteUser = jest.fn().mockResolvedValue(undefined);

    await service.deleteUser('user-id');

    expect(service.deleteUser).toHaveBeenCalledWith('user-id');
  });

  it('devrait créer un utilisateur', async () => {
    service.createUsers = jest.fn().mockResolvedValue(undefined);

    await service.createUsers({ email: 'new@test.com' }, null);

    expect(service.createUsers).toHaveBeenCalledWith({ email: 'new@test.com' }, null);
  });

  it('devrait récupérer tous les IDs utilisateurs', async () => {
    const mockIds = ['user1', 'user2', 'user3'];
    service.getAllUserIds = jest.fn().mockResolvedValue(mockIds);

    const result = await service.getAllUserIds();

    expect(result).toEqual(mockIds);
    expect(service.getAllUserIds).toHaveBeenCalled();
  });

  it('devrait récupérer les utilisateurs par rôle opposé', async () => {
    const mockResult = {
      users: [{ id: 'user1', role: 'candidate' }],
      totalUsers: 1,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1
    };

    service.getUsersByOppositeRole = jest.fn().mockResolvedValue(mockResult);

    const result = await service.getUsersByOppositeRole('recruiter' as any, {});

    expect(result).toEqual(mockResult);
    expect(service.getUsersByOppositeRole).toHaveBeenCalledWith('recruiter', {});
  });

  it('devrait mettre à jour la dernière connexion', async () => {
    service.updateLastSeen = jest.fn().mockResolvedValue(undefined);

    await service.updateLastSeen('user-id', '2024-01-01T00:00:00Z');

    expect(service.updateLastSeen).toHaveBeenCalledWith('user-id', '2024-01-01T00:00:00Z');
  });
});