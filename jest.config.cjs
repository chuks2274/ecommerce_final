module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.app.json",
        useESM: true,
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^react-icons/fa$": "<rootDir>/src/__mocks__/react-icons/fa.tsx",
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.js",
    "^src/firebase/firebase$": "<rootDir>/src/__mocks__/firebase.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.{test,spec}.{ts,tsx}"],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/src/__mocks__/"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};