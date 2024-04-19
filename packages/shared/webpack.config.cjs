const path = require('path');

module.exports = (env) => {
  return {
    entry: './index.js',
    mode: env.mode || 'production',
    watch: env.watch === 'true',
    resolve: {
      modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
      alias: {
        shared: path.resolve(__dirname, './packages/shared')
      }
    },
    output: {
      path: path.resolve(__dirname, '../../dist'),
      filename: 'shared.js',
      libraryTarget: 'umd',
      globalObject: 'this',
      umdNamedDefine: true
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }]
    }
  }
};