/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
