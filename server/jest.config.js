// const { createDefaultPreset } = require("ts-jest");

// const tsJestTransformCfg = createDefaultPreset().transform;

// /** @type {import("jest").Config} **/
// module.exports = {
//   testEnvironment: "node",
//   transform: {
//     ...tsJestTransformCfg,
//   },
// };
// jest.config.js
const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/tests/**/*.test.(ts|tsx|js)'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
            },
        ],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFiles: ['module-alias/register'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    collectCoverage: false, // Désactivé pour les tests d'intégration
    detectOpenHandles: true,
    forceExit: true,
    testTimeout: 15000,
    // Ignorer les fichiers problématiques pour la couverture
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/coverage/',
        '/src/tests/',
        '/src/utils/helpers/slugify.helper.ts',
        '/src/utils/jobs/publish-opportunity.job.ts',
        '/src/utils/logger/index.ts',
        '/src/apis/auth/authSocialMedia/',
        '/src/apis/messages/groups/groups.interfaces.ts',
        '/src/apis/messages/services/',
        '/src/apis/user/interfaces/recruiter.interfaces.ts',
        '/src/apis/user/schemas/',
        '/src/apis/user/services/account.service.ts',
        '/src/apis/user/controllers/user.controller.ts',
        '/src/utils/config/socket/',
        '/src/utils/services/email-service/'
    ]
};
