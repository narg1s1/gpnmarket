const PROXY_CONFIG = {
    '/api/rest': {
        target: process.env.BACKEND_ADDRESS,
        secure: true,
        changeOrigin: true,
        logLevel: 'debug',
    },
    '/api': {
        target: process.env.BACKEND_ADDRESS,
        secure: true,
        changeOrigin: true,
        logLevel: 'debug',
    },
    '/ws': {
        target: process.env.BACKEND_ADDRESS.replace('http', 'ws').replace('https', 'wss').concat('ws/'),
        secure: false,
        changeOrigin: true,
        ws: true,
    },
};

module.exports = PROXY_CONFIG;
