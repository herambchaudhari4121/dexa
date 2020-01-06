module.exports = {
  displayName: 'ts-jest',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
  testRunner: 'jest-circus/runner'
};
