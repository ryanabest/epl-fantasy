const fs = require('fs');
const path = require('path');

// https://www.youtube.com/playlist?list=PLblA84xge2_zwxh3XJqy6UVxS60YdusY8
const HtmlWebpackPlugin = require('html-webpack-plugin');
const utils = require('./src/js/utils');

const templateVars = {
  utils,
}

const plugins = [
  new HtmlWebpackPlugin({
    template: './src/templates/index.pug',
    favicon: './src/images/favicon.png',
    templateParameters: Object.assign({}, templateVars)
  })
];

module.exports = {
  entry: './src/js/app.js',
  module: {
    rules: [
      // Include pug-loader to process the pug files
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins
};
