import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BuildOptions } from './types/config';
import { buildLoaders } from './buildLoaders';
import { buildResolvers } from './buildResolvers';

export function buildWebpackConfig(options: BuildOptions): webpack.Configuration {
  const { paths, mode, isDev } = options;

  return {
    mode,
    entry: paths.entry,
    output: {
      filename: '[name].bundle.js',
      path: paths.build,
      clean: true,
      publicPath: isDev ? 'http://0.0.0.0:4000/' : '/static/',
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].css',
      }),
      new webpack.DefinePlugin({
        __IS_DEV__: JSON.stringify(isDev),
      }),
    ],
    module: {
      rules: buildLoaders(options),
    },
    resolve: buildResolvers(options),
    devtool: isDev ? 'inline-source-map' : undefined,
  };
}
