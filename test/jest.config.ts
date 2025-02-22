import type { Config } from "jest";

console.log("Jest rootDir:", process.cwd());

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/*.test.ts"],
};

export default config;