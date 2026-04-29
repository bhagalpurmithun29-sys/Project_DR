const Patient = require('../models/Patient');

const generatePatientId = async (name) => {
    if (!name) name = "UNKN";
    // Get first 4 letters, pad with X if shorter, uppercase
    const prefix = name.replace(/[^a-zA-Z]/g, '').padEnd(4, 'X').substring(0, 4).toUpperCase();
    
    // Get total count of patients to determine the next sequential number globally
    const totalPatients = await Patient.countDocuments();
    const nextNum = totalPatients + 1;
    
    // Format to at least 2 digits (e.g., 01, 02, ..., 10, ...)
    const numStr = nextNum.toString().padStart(2, '0');
    
    return `${prefix}${numStr}`;
};

module.exports = generatePatientId;
