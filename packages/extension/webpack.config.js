'use strict'

const path = require('path')
const webpack = require('webpack')

module.exports = (env) => {
  
  return {
    target: 'node', 
    mode: env.mode || 'production', 
    entry: path.resolve(__dirname, 'src', 'extension.js'), 
    watch: env.watch === 'true',
    output: {
      path: path.resolve(__dirname, '..', '..', 'dist'),
      filename: 'extension.js',
      libraryTarget: 'commonjs2',
    },
    devtool: 'nosources-source-map',
    externals: {
      vscode: 'commonjs vscode', 
    },
    plugins: [
      new webpack.DefinePlugin({
      }),
    ],
    resolve: {
      extensions: ['.js'],
      alias: {
        '~': path.resolve(__dirname, 'src'),
        '@static': path.resolve(__dirname, '..', '..', 'static'),
        // '@shared': path.resolve(__dirname, '..', '..', 'shared'),
      },
    },
    infrastructureLogging: {
      level: 'log', 
    },
  }
}
