const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_ALLOWED_ORIGINS, getAllowedOrigins, parseOrigins, buildCorsOptions } = require('../utils/corsConfig');

test('parseOrigins returns trimmed origin list', () => {
    assert.deepEqual(
        parseOrigins(' https://a.com , http://localhost:5173 '),
        ['https://a.com', 'http://localhost:5173']
    );
});

test('getAllowedOrigins falls back to defaults when env is empty', () => {
    assert.deepEqual(getAllowedOrigins({}), DEFAULT_ALLOWED_ORIGINS);
});

test('getAllowedOrigins merges FRONTEND_URL and CORS_ORIGINS without duplicates', () => {
    assert.deepEqual(
        getAllowedOrigins({
            FRONTEND_URL: 'https://app.example.com',
            CORS_ORIGINS: 'https://app.example.com,https://admin.example.com',
        }),
        ['https://app.example.com', 'https://admin.example.com']
    );
});

test('buildCorsOptions allows whitelisted origins and blocks unknown origins', () => {
    const options = buildCorsOptions({ CORS_ORIGINS: 'https://app.example.com' });

    options.origin('https://app.example.com', (error, allowed) => {
        assert.equal(error, null);
        assert.equal(allowed, true);
    });

    options.origin('https://evil.example.com', (error) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /CORS blocked/);
    });
});
