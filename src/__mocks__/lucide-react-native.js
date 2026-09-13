const React = require("react");
const { View } = require("react-native");

const createMockIcon = (name) => {
  const Component = (props) =>
    React.createElement(View, { testID: `icon-${name}`, ...props });
  Component.displayName = name;
  return Component;
};

module.exports = new Proxy(
  {},
  {
    get: (_, prop) => createMockIcon(String(prop)),
  }
);
