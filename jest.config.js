module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|nativewind|react-native-reanimated|lucide-react-native)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "\\.css$": "<rootDir>/src/__mocks__/styleMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__mocks__/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/example/"],
};
