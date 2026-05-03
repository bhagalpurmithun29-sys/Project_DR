const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'https://retina-ai-one.vercel.app',
];

const parseOrigins = (rawValue) => (
    rawValue
        ? rawValue.split(',').map((origin) => origin.trim()).filter(Boolean)
        : []
);

const getAllowedOrigins = (env = process.env) => {
    const configuredOrigins = [
        env.FRONTEND_URL,
        ...parseOrigins(env.CORS_ORIGINS),
    ]
        .filter(Boolean)
        .map(origin => origin.replace(/\/+$/, '')); // Trim trailing slashes

    return configuredOrigins.length > 0
        ? [...new Set(configuredOrigins)]
        : DEFAULT_ALLOWED_ORIGINS.map(origin => origin.replace(/\/+$/, ''));
};

const buildCorsOptions = (env = process.env) => {
    const allowedOrigins = getAllowedOrigins(env);

    return {
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
};

module.exports = {
    DEFAULT_ALLOWED_ORIGINS,
    parseOrigins,
    getAllowedOrigins,
    buildCorsOptions,
};
