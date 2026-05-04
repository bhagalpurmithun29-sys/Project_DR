const Scan = require('../models/Scan');

const generateScanId = async () => {
    // Get total count of scans to determine the next sequential number globally
    const totalScans = await Scan.countDocuments();
    const nextNum = totalScans + 1;
    
    // Format to at least 2 digits (e.g., 01, 02, ..., 10, ...)
    const numStr = nextNum.toString().padStart(2, '0');
    
    return `SCAN${numStr}`;
};

module.exports = generateScanId;
