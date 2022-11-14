const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './webapp/main.ts',
    module: {
        rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [path.resolve(__dirname, 'node_modules/')],
      },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist/webapp'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'webapp/index.html'
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist/webapp/'),
      },
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      compress: true,
      port: 'auto',
    },
};
