import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockAuth = {
  hashPassword: async (password: string) => {
    return bcrypt.hash(password, 12);
  },
  comparePassword: async (plainPassword: string, hashedPassword: string) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
  generateToken: (payload: any) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY!, { expiresIn: '1h' });
  },
  verifyToken: (token: string) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY!);
  },
  generateRefreshToken: (payload: any) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_PRIVATE_KEY!, { expiresIn: '7d' });
  },
};

describe('Auth Helper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('devrait hasher un mot de passe', async () => {
      const password = 'plainPassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await mockAuth.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('devrait retourner true pour un mot de passe correct', async () => {
      const plainPassword = 'plainPassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await mockAuth.comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un mot de passe incorrect', async () => {
      const plainPassword = 'wrongPassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await mockAuth.comparePassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('devrait générer un token JWT', () => {
      const payload = { id: 'user-id', email: 'test@example.com' };
      const token = 'generated-token';

      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = mockAuth.generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.ACCESS_TOKEN_PRIVATE_KEY,
        { expiresIn: '1h' }
      );
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('devrait vérifier un token valide', () => {
      const token = 'valid-token';
      const payload = { id: 'user-id', email: 'test@example.com' };

      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = mockAuth.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
      expect(result).toEqual(payload);
    });

    it('devrait lever une erreur pour un token invalide', () => {
      const token = 'invalid-token';

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => mockAuth.verifyToken(token)).toThrow('Invalid token');
    });
  });
});