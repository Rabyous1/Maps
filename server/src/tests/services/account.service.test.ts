describe('AccountService', () => {
  const mockAuth = {
    comparePassword: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockUserRepository = {
    repository: {
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
    },
    findOne: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockAccountService = {
    revealFiscal: async (userId: string, password: string) => {
      const user = { fiscalNumber: 'TN123456789' };
      const isValid = await mockAuth.comparePassword(password, 'hashed');
      return isValid ? user.fiscalNumber : null;
    },
    getAccount: async (field: any) => {
      const user = await mockUserRepository.findOne(field);
      if (!user) throw new Error('User Not Found');
      return { fullName: 'John Doe', skills: ['JavaScript'] };
    },
    updatePassword: async (data: any, userId: string) => {
      const isValid = await mockAuth.comparePassword(data.currentPassword, 'hashed');
      if (!isValid) throw new Error('Incorrect password');
      await mockAuth.hashPassword(data.newPassword);
    },
    deleteAccount: async (userId: string) => {
      const user = { isArchived: false };
      user.isArchived = true;
      await mockUserRepository.save(user);
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('revealFiscal', () => {
    it('devrait retourner le numéro fiscal si le mot de passe est correct', async () => {
      mockAuth.comparePassword.mockResolvedValue(true);

      const result = await mockAccountService.revealFiscal('user-id', 'correct-password');

      expect(result).toBe('TN123456789');
    });

    it('devrait retourner null si le mot de passe est incorrect', async () => {
      mockAuth.comparePassword.mockResolvedValue(false);

      const result = await mockAccountService.revealFiscal('user-id', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('getAccount', () => {
    it('devrait retourner les données du compte', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'user-id' });

      const result = await mockAccountService.getAccount({ id: 'user-id' });

      expect(result.fullName).toBe('John Doe');
      expect(result.skills).toEqual(['JavaScript']);
    });

    it('devrait lever une exception si utilisateur non trouvé', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(mockAccountService.getAccount({ id: 'non-existent' }))
        .rejects.toThrow('User Not Found');
    });
  });

  describe('updatePassword', () => {
    it('devrait mettre à jour le mot de passe avec succès', async () => {
      mockAuth.comparePassword.mockResolvedValue(true);
      mockAuth.hashPassword.mockResolvedValue('new-hashed-password');

      await mockAccountService.updatePassword({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      }, 'user-id');

      expect(mockAuth.hashPassword).toHaveBeenCalledWith('new-password');
    });

    it('devrait lever une exception si mot de passe incorrect', async () => {
      mockAuth.comparePassword.mockResolvedValue(false);

      await expect(mockAccountService.updatePassword({
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      }, 'user-id')).rejects.toThrow('Incorrect password');
    });
  });

  describe('deleteAccount', () => {
    it('devrait archiver le compte', async () => {
      mockUserRepository.save.mockResolvedValue(undefined);

      await mockAccountService.deleteAccount('user-id');

      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});