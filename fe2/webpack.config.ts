import webpack from 'webpack';
import path from 'path';
import { buildWebpackConfig } from './config/build/buildWebpackConfig';
import { BuildEnv, BuildPaths } from './config/build/types/config';

export default (env: BuildEnv) => {
  const paths: BuildPaths = {
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    build: path.resolve(__dirname, 'build'),
    html: path.resolve(__dirname, 'public', 'index.html'),
    src: path.resolve(__dirname, 'src'),
  };

  const mode = env.mode || 'development';
  const PORT = env.port || 3000;

  const isDev = mode === 'development';

  const config: webpack.Configuration = buildWebpackConfig({
    mode,
    paths,
    isDev,
    port: PORT,
  });
    config.devServer.proxy = [
	{
	    context: [
	    	"/imls/collection-details/",
		"/api/",
		"/imls/undefined/api/",
		"/undefined/api/"
	    ],
	    target: process.env.REACT_APP_API_URL,
	    changeOrigin: true,
	    secure: false,
	    pathRewrite: {
		'^/imls/undefined/': '/',
		'^/undefined/': '/',
		'.*/undefined/api/': '/api/'
	    }
	}
    ];
  return config;
};
