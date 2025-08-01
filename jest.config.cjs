module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.app.json",
        // useESM: true,  // ❌ Removed to fix Jest + ts-jest module issues
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^react-icons/fa$": "<rootDir>/src/__mocks__/react-icons/fa.tsx",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^src/firebase/firebase$": "<rootDir>/src/__mocks__/firebase.ts",
    "^@config/env$": "<rootDir>/src/__mocks__/env.ts",
    "^../config/env$": "<rootDir>/src/__mocks__/env.ts",    // fallback for relative import if still used
    "^src/config/env$": "<rootDir>/src/__mocks__/env.ts",   // fallback for absolute import if still used
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.{test,spec}.{ts,tsx}"],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/src/__mocks__/"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};