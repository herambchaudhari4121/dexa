import type { Config } from '@jest/types';

// eslint-disable-next-line @typescript-eslint/require-await
export default async (): Promise<Config.InitialOptions> => ({
  preset: 'ts-jest',
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  testMatch: ['<rootDir>/__tests__/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/__tests__/tsconfig.json'
    }
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/__tests__/', '<rootDir>/src/index.ts']
});
