const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const path = require('path')

const WEBPACK_HOT_PATH = 'webpack/hot/poll?1000'

module.exports = (env, argv) => {
  const plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        BITTREX_API_KEY: JSON.stringify(process.env.BITTREX_API_KEY),
        BITTREX_API_SECRET: JSON.stringify(process.env.BITTREX_API_SECRET),
      },
    }),
  ]
  const entry = ['babel-polyfill', './src/']

  if (argv && argv.mode === 'development') {
    entry.unshift(WEBPACK_HOT_PATH)
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  return {
    entry,
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'index.js',
    },
    resolve: {
      alias: {
        Util: path.resolve(__dirname, 'src/util/'),
        Core: path.resolve(__dirname, 'src/core/'),
        Config: path.resolve(__dirname, 'src/config/'),
      },
    },
    target: 'node',
    externals: [nodeExternals({
      whitelist: [WEBPACK_HOT_PATH],
    })],
    plugins,
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      ],
    },
  }
}
