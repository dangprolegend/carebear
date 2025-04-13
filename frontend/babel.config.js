module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo']
    //  plugins: [
    //   [
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
