/* global jest */
const React = require("react");
const { View } = require("react-native");

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const MockStackScreen = () => null;
MockStackScreen.displayName = "MockStackScreen";

const MockStack = ({ children }) =>
  React.createElement(View, { testID: "mock-stack-navigator" }, children);
MockStack.displayName = "MockStack";
MockStack.Screen = MockStackScreen;

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Link: ({ children }) => children,
  Redirect: () => null,
  Stack: MockStack,
}));
