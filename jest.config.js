module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|nativewind|react-native-reanimated|react-native-keyboard-controller|lucide-react-native)",
  ],
  moduleNameMapper: {
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^lucide-react-native$": "<rootDir>/src/__mocks__/lucide-react-native.js",
    "\\.css$": "<rootDir>/src/__mocks__/styleMock.js",
  },
  // Override setupFiles from jest-expo preset to replace the broken
  // @react-native/jest-preset/jest/setup.js (Flow/ESM, missing react-native/setup-env in RN 0.86)
  setupFiles: ["<rootDir>/src/__mocks__/jest.rn-setup.js"],
  setupFilesAfterEnv: ["<rootDir>/src/__mocks__/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/example/"],
  // Increase timeout to handle render-heavy component tests in full suite runs
  testTimeout: 30000,
  // Prevent hanging async operations (e.g. animation timers) from blocking the runner
  forceExit: true,
};
