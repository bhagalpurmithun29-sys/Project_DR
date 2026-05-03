const test = require('node:test');
const assert = require('node:assert/strict');
const { STRONG_PASSWORD_REGEX, generateTemporaryPassword, resolvePatientPassword } = require('../utils/patientAccount');

test('generateTemporaryPassword creates a strong password', () => {
    const password = generateTemporaryPassword();
    assert.equal(password.length >= 8, true);
    assert.equal(STRONG_PASSWORD_REGEX.test(password), true);
});

test('resolvePatientPassword accepts a valid custom password', () => {
    const result = resolvePatientPassword('Secure@123');
    assert.deepEqual(result, { password: 'Secure@123', generated: false });
});

test('resolvePatientPassword generates a password when none is provided', () => {
    const result = resolvePatientPassword('');
    assert.equal(result.generated, true);
    assert.equal(STRONG_PASSWORD_REGEX.test(result.password), true);
});

test('resolvePatientPassword rejects weak passwords', () => {
    assert.throws(
        () => resolvePatientPassword('weakpass'),
        /Patient password must be at least 8 characters/
    );
});
