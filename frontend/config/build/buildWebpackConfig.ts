import webpack from 'webpack';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { BuildOptions } from './types/config';
import { buildPlugins } from './buildPlugins';
import { buildLoaders } from './buildLoaders';
import { buildResolvers } from './buildResolvers';
import { buildDevServer } from './buildDevServer';

export function buildWebpackConfig(options: BuildOptions): webpack.Configuration {
  const { paths, mode, isDev } = options;

  // Pages are code split into chunks that are loaded on demand. In production the same build is
  // served from /static/ (Django) and from /imls/ (Docker/nginx rewrites index.html), so the
  // chunk URLs can't be hardcoded: 'auto' makes webpack load chunks from wherever main.js came from.
  // index.html itself keeps the fixed /static/ prefix that the Docker build rewrites.
  const htmlPublicPath = isDev ? undefined : '/static/';

  return {
    mode,
    entry: paths.entry,
    output: {
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].js',
      path: paths.build,
      clean: true,
      publicPath: isDev ? 'http://0.0.0.0:4000/' : 'auto',
    },
    cache: {
      type: 'filesystem',
    },
    optimization: {
      minimize: !isDev,
      minimizer: !isDev ? [
        new TerserPlugin({
          parallel: 2,
        }),
      ] : [],
    },
    plugins: buildPlugins({ ...options, htmlPublicPath }),
    module: {
      rules: buildLoaders(options),
    },
    resolve: buildResolvers(options),
    devtool: isDev ? 'inline-source-map' : undefined,
    devServer: isDev ? buildDevServer(options) : undefined,
  };
}
