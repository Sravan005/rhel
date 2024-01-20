const path = require('path');

module.exports = {
  entry: './src/index.js', // Adjust the entry point based on your project structure
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Output directory for bundled files
  },
  resolve: {
    fallback: {
      zlib: require.resolve('browserify-zlib'),
    },
  },
};
