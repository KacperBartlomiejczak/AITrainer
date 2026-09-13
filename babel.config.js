module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Inlines Drizzle migration .sql files into the JS bundle
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};
