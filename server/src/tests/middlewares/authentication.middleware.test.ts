import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

const mockAuthMiddleware = (req: any, res: any, next: any) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY!);
    req.user = { _id: (decoded as any).id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

describe('Authentication Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait authentifier avec un token valide dans les cookies', () => {
    mockReq.cookies.accessToken = 'valid-token';
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'user-id' });

    mockAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.user._id).toBe('user-id');
    expect(mockNext).toHaveBeenCalled();
  });

  it('devrait retourner 401 si aucun token n\'est fourni', () => {
    mockAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access token required' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('devrait retourner 401 si le token est invalide', () => {
    mockReq.cookies.accessToken = 'invalid-token';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    mockAuthMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});