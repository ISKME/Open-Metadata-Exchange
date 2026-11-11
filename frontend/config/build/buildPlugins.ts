import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BuildOptions } from './types/config';

const BundleTracker = require('webpack-bundle-tracker');

export function buildPlugins({ paths, isDev, htmlPublicPath }: BuildOptions): webpack.WebpackPluginInstance[] {
  const plugins: webpack.WebpackPluginInstance[] = [
    new HtmlWebpackPlugin({
      template: paths.html,
      // When set, the <script>/<link> tags in index.html use this fixed prefix even though
      // output.publicPath is 'auto' (see buildWebpackConfig.ts).
      ...(htmlPublicPath ? { publicPath: htmlPublicPath } : {}),
    }),
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].css',
    }),
    new webpack.DefinePlugin({
      __IS_DEV__: JSON.stringify(isDev),
    }),
    new BundleTracker({ filename: './webpack-stats.json' }),
  ];

  // Hot reloading is only used by the dev server. In a production build it only added
  // unused runtime code to the main bundle.
  if (isDev) plugins.push(new webpack.HotModuleReplacementPlugin());

  return plugins;
}
