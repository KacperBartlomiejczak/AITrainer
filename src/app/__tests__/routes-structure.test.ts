import requireContext from "expo-router/build/testing-library/require-context-ponyfill";

// Resolved against Jest's rootDir (project root), same scan Expo Router's test utils use
const APP_DIR = "./src/app";
const ROUTE_FILE_PATTERN = /\.[tj]sx?$/;

function isRouteFile(key: string): boolean {
  const fileName = key.split("/").pop() ?? "";
  return (
    !key.includes("/__tests__/") &&
    !fileName.startsWith("_layout.") &&
    !fileName.includes("+api.")
  );
}

/** Mirrors Expo Router URL resolution: groups `(name)` and `index` add no URL segment. */
function toUrl(key: string): string {
  const segments = key
    .replace(/^\.\//, "")
    .replace(ROUTE_FILE_PATTERN, "")
    .split("/")
    .filter((segment) => !/^\(.+\)$/.test(segment) && segment !== "index");
  return `/${segments.join("/")}`;
}

describe("app route structure", () => {
  const routeKeys = requireContext(APP_DIR, true, ROUTE_FILE_PATTERN).keys().filter(isRouteFile);

  it("discovers route files in the app directory", () => {
    expect(routeKeys).toContain("./index.tsx");
  });

  it("maps every route file to a unique URL (no group/index collisions)", () => {
    const filesByUrl = new Map<string, string[]>();
    for (const key of routeKeys) {
      const url = toUrl(key);
      filesByUrl.set(url, [...(filesByUrl.get(url) ?? []), key]);
    }

    const collisions = [...filesByUrl.entries()].filter(([, files]) => files.length > 1);

    expect(collisions).toEqual([]);
  });
});
