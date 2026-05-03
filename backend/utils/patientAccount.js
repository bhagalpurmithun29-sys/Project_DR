const crypto = require('crypto');

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';

const generateTemporaryPassword = (length = 14) => {
    const bytes = crypto.randomBytes(length);
    let password = '';

    for (let index = 0; index < length; index += 1) {
        password += PASSWORD_ALPHABET[bytes[index] % PASSWORD_ALPHABET.length];
    }

    // Ensure password satisfies the strength policy even in unlucky random draws.
    return STRONG_PASSWORD_REGEX.test(password)
        ? password
        : `Aa1!${generateTemporaryPassword(Math.max(length - 4, 8))}`;
};

const resolvePatientPassword = (password) => {
    const trimmedPassword = password?.trim();

    if (trimmedPassword) {
        if (!STRONG_PASSWORD_REGEX.test(trimmedPassword)) {
            const error = new Error('Patient password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
            error.statusCode = 400;
            throw error;
        }

        return { password: trimmedPassword, generated: false };
    }

    return {
        password: generateTemporaryPassword(),
        generated: true,
    };
};

module.exports = {
    STRONG_PASSWORD_REGEX,
    generateTemporaryPassword,
    resolvePatientPassword,
};
