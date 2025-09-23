import { restrictTo } from '@/middlewares/role.middleware';
import { Role } from '@/utils/helpers/constants';
import { Request, Response, NextFunction } from 'express';

describe('Role Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { roles: Role.CANDIDAT }
    } as any;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('restrictTo', () => {
    it('should allow access for authorized role', () => {
      const middleware = restrictTo(Role.CANDIDAT);
      
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const middleware = restrictTo(Role.RECRUTEUR);
      
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Access denied: insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access for multiple authorized roles', () => {
      const middleware = restrictTo(Role.CANDIDAT, Role.RECRUTEUR);
      
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access if user has no role', () => {
      mockReq.user = {} as any;
      const middleware = restrictTo(Role.CANDIDAT);
      
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access if no user', () => {
      mockReq.user = undefined;
      const middleware = restrictTo(Role.CANDIDAT);
      
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});