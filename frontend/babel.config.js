module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: "nativewind" }],
    "nativewind/babel"],
    //plugins: [ 'nativewind/babel'],
    //  [
    //     'module-resolver',
    //     {
    //       alias: {
    //         '@': './', // lets you use `@/components`, `@/hooks`, etc.
    //       },
    //     },
    //   ],
    // ],
  };
};
