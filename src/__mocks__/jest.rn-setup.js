/**
 * Minimal RN 0.86 jest setup — replaces @react-native/jest-preset/jest/setup.js
 * which uses Flow/ESM syntax incompatible with jest CJS environment.
 */

// Required globals for React Native test environment
global.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;

global.__DEV__ = true;

global.window = global;

global.cancelAnimationFrame = (id) => clearTimeout(id);
global.requestAnimationFrame = (callback) =>
  setTimeout(() => callback(Date.now()), 0);

if (!global.performance) {
  global.performance = { now: () => Date.now() };
}

// Silence noisy React Native warnings in test output
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args[0];
  if (
    typeof msg === "string" &&
    (msg.includes("Warning: ReactDOM.render") ||
      msg.includes("Warning: An update to") ||
      msg.includes("act(...)"))
  ) {
    return;
  }
  originalConsoleError(...args);
};
