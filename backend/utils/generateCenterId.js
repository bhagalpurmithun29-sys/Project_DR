const DiagnosisCenter = require('../models/DiagnosisCenter');

/**
 * Generates a Center ID based on the center name and total count.
 * Rule: First 4 alphabets of name (uppercase) + 2-digit sequential number.
 * Example: "Global Lab" -> "GLOB01"
 */
const generateCenterId = async (name) => {
    if (!name) name = "CENT";
    
    // Extract first 4 letters, pad with 'X' if shorter, convert to uppercase
    const prefix = name.replace(/[^a-zA-Z]/g, '')
                      .padEnd(4, 'X')
                      .substring(0, 4)
                      .toUpperCase();
    
    // Get total count of centers to determine the next sequential number
    const totalCenters = await DiagnosisCenter.countDocuments();
    const nextNum = totalCenters + 1;
    
    // Format number to at least 2 digits (01, 02, etc.)
    const numStr = nextNum.toString().padStart(2, '0');
    
    return `${prefix}${numStr}`;
};

module.exports = generateCenterId;
