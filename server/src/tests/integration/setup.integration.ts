import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Configuration globale pour les tests d'intégration
beforeAll(async () => {
  // Configuration de l'environnement de test
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/pentabell_test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.SESSION_SECRET = 'test-session-secret';
  
  // Désactiver les logs pendant les tests
  process.env.LOG_LEVEL = 'error';
  
  console.log('🚀 Configuration des tests d\'intégration initialisée');
});

afterAll(async () => {
  console.log('✅ Tests d\'intégration terminés');
});

beforeEach(() => {
  // Réinitialiser les mocks avant chaque test
  jest.clearAllMocks();
});

afterEach(() => {
  // Nettoyage après chaque test si nécessaire
});

// Utilitaires pour les tests d'intégration
export const createMockAuthToken = (userId: string = 'test-user-id', role: string = 'candidate') => {
  return `Bearer mock-token-${userId}-${role}`;
};

export const createValidUUID = () => {
  return '123e4567-e89b-12d3-a456-426614174000';
};

export const createInvalidUUID = () => {
  return 'invalid-uuid-format';
};

export const createMockUserData = (overrides: any = {}) => {
  return {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'candidate',
    ...overrides
  };
};

export const createMockOpportunityData = (overrides: any = {}) => {
  return {
    title: 'Développeur Full Stack',
    description: 'Poste de développeur dans une startup innovante',
    location: 'Paris, France',
    contractType: 'CDI',
    salaryMin: 40000,
    salaryMax: 60000,
    requirements: ['JavaScript', 'Node.js', 'React'],
    ...overrides
  };
};

export const createMockApplicationData = (overrides: any = {}) => {
  return {
    opportunityId: createValidUUID(),
    coverLetter: 'Je suis très intéressé par ce poste car...',
    expectedSalary: 45000,
    ...overrides
  };
};

export const createMockInterviewData = (overrides: any = {}) => {
  return {
    applicationId: createValidUUID(),
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
    type: 'video',
    duration: 60,
    ...overrides
  };
};

// Helpers pour les assertions communes
export const expectValidationError = (response: any) => {
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('message');
};

export const expectAuthenticationError = (response: any) => {
  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty('message');
};

export const expectNotFoundError = (response: any) => {
  expect(response.status).toBe(404);
  expect(response.body).toHaveProperty('message');
};

export const expectSuccessResponse = (response: any) => {
  expect([200, 201]).toContain(response.status);
};

// Mock des services externes pour les tests d'intégration
export const mockExternalServices = () => {
  // Mock du service d'email
  jest.mock('../../utils/services/email-service', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
  }));

  // Mock du service de stockage de fichiers
  jest.mock('../../apis/storage/files.service', () => ({
    uploadFile: jest.fn().mockResolvedValue({ id: 'mock-file-id', url: 'mock-url' }),
    deleteFile: jest.fn().mockResolvedValue(true)
  }));

  // Mock des jobs/schedulers
  jest.mock('../../utils/jobs/startup-jobs', () => ({
    schedulePendingOpportunities: jest.fn().mockResolvedValue(true)
  }));

  jest.mock('../../utils/jobs/interviews.job', () => ({
    startInterviewScheduler: jest.fn().mockResolvedValue(true)
  }));
};