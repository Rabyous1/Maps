import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.SYSTEM_USER_ID = 'test-system-user';
process.env.COOKIE_MAX_AGE = '3600000';
process.env.ACCESS_TOKEN_PRIVATE_KEY = 'test-secret-key';
process.env.REFRESH_TOKEN_PRIVATE_KEY = 'test-refresh-secret-key';

jest.setTimeout(10000);

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.resetAllMocks();
});