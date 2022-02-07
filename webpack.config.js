const path = require('path');
const glob = require('glob');
const webpack = require('webpack')
console.log({
  entry: glob.sync('./src/**/*.ts').reduce(function (obj, el) {
    obj[el.replace(".ts", "")] = el;
    return obj
  }, {})
});
module.exports = {
  mode: "production",
  entry: glob.sync('./src/**/*.ts').reduce(function(obj, el){
    obj[el.replace(".ts","")] = el;
    return obj
  }, {}),
  node: {
    __dirname: false,
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs-module'
  },
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      }
    })
  ]
};