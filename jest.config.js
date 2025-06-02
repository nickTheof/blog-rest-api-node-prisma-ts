const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"], // or ["<rootDir>"] if you keep tests outside src
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  globalSetup: "./src/__tests__/setup/globalSetup.ts",
  globalTeardown: "./src/__tests__/setup/globalTeardown.ts",
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/logs/"
  ],
};