const Scan = require('../models/Scan');

const generateScanId = async (patientId, eyeSide, isBilateral = false) => {
    // Check if there is already a scan for this patient created within the last 10 minutes of the other eye
    if (isBilateral && patientId && eyeSide) {
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const sibling = await Scan.findOne({
            patient: patientId,
            eyeSide: eyeSide === 'OD' ? 'OS' : 'OD',
            isBilateral: { $ne: false },
            createdAt: { $gte: tenMinsAgo }
        });
        if (sibling && sibling.scanId) {
            return sibling.scanId;
        }
    }

    // Otherwise, find the next sequential unique scan ID based on unique scan IDs in the DB
    const uniqueIds = await Scan.distinct('scanId');
    const nextNum = uniqueIds.length + 1;
    const numStr = nextNum.toString().padStart(2, '0');
    return `SCAN${numStr}`;
};

module.exports = generateScanId;
