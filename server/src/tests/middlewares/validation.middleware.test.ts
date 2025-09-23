import Joi from 'joi';

const mockValidationMiddleware = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: `Validation error: ${error.details[0].message}`,
      });
    }
    next();
  };
};

describe('Validation Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait passer la validation avec des données valides', () => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    mockReq.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = mockValidationMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('devrait retourner 400 avec des données invalides', () => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    mockReq.body = {
      email: 'invalid-email',
      password: '123',
    };

    const middleware = mockValidationMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Validation error'),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});