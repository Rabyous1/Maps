import { Role } from '@/utils/helpers/constants';

export const createMockUser = (overrides: any = {}) => ({
  id: 'mock-user-id',
  _id: 'mock-user-id',
  fullName: 'Mock User',
  email: 'mock@example.com',
  roles: Role.CANDIDAT,
  isVerified: true,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockRequest = (overrides: any = {}) => ({
  user: createMockUser(),
  body: {},
  params: {},
  query: {},
  headers: {},
  cookies: {},
  file: null,
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn();