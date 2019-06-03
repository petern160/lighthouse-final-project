const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack')

const config = {
  plugins: [
    new Dotenv()
  ],
  mode: 'development',
  entry: './src/index.tsx',
  output: {
    filename: 'build.js',
    path: __dirname+ '/test',
    publicPath: '/js/',
  },
  devServer: {
    contentBase: path.resolve(__dirname, '.'),
    historyApiFallback: true
  },
  devtool: "source-map",
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss', 'gif', 'png', 'jpg', 'svg']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

      // https://webpack.js.org/loaders/babel-loader/
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.scss?$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(mp3|png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },
};

module.exports = config;
