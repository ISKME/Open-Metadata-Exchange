import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { BuildOptions } from './types/config';

// The FastAPI server (`docker compose up fastapi-server` publishes it on 5001).
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export function buildDevServer(options: BuildOptions): DevServerConfiguration {
    return {
        port: options.port,
        open: true,
        historyApiFallback: true,
        hot: true,
        allowedHosts: "all",
        proxy: [
            {
                context: ['/api/'],
                target: API_URL,
                changeOrigin: true,
            },
        ],
    };
}
