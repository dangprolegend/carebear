// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}, // Often included, though less critical for NativeWind
    'nativewind/postcss': {
      output: 'nativewind-output.js', // Or your configured output file
    },
  },
};