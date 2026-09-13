/* global jest, beforeEach */
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

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};

const mockUseLocalSearchParams = jest.fn(() => ({}));

beforeEach(() => {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
  mockRouter.canGoBack.mockReset();
  mockRouter.canGoBack.mockReturnValue(true);
  mockUseLocalSearchParams.mockReset();
  mockUseLocalSearchParams.mockReturnValue({});
});

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useSegments: () => [],
  usePathname: jest.fn(() => "/"),
  useLocalSearchParams: mockUseLocalSearchParams,
  // Screens are always focused in tests: run the effect like a mount effect
  useFocusEffect: (effect) => require("react").useEffect(effect, [effect]),
  Link: ({ children }) => children,
  Redirect: () => null,
  Stack: MockStack,
}));

// Native file system and image picker are unavailable in Jest: in-memory fake + controllable picker
jest.mock("expo-file-system", () => jest.requireActual("./expo-file-system.js"));

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

beforeEach(() => {
  require("./expo-file-system.js").__fakeFileSystem.reset();
});
