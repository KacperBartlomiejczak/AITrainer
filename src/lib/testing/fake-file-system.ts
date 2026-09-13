/** Typed access to the in-memory `expo-file-system` fake registered in `src/__mocks__/jest.setup.js`. Test-only. */
export interface FakeFileSystem {
  reset: () => void;
  addFile: (uri: string) => void;
  hasFile: (uri: string) => boolean;
  listFiles: () => string[];
}

export const FAKE_DOCUMENT_URI = "file:///document/";
export const FAKE_WORKOUT_PHOTOS_URI = `${FAKE_DOCUMENT_URI}workout-photos/`;

export function getFakeFileSystem(): FakeFileSystem {
  return jest.requireMock<{ __fakeFileSystem: FakeFileSystem }>("expo-file-system").__fakeFileSystem;
}
