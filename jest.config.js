module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { // Ensure ts-jest uses correct tsconfig or options
      tsconfig: 'tsconfig.json' // or specify your tsconfig file for tests if different
    }],
  },
  testMatch: [
    "<rootDir>/__tests__/lib/**/*.test.ts",
    "<rootDir>/__tests__/components/**/*.test.tsx"
  ],
};
