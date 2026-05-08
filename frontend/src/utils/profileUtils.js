/**
 * Calculates the completion percentage of a doctor's profile.
 * @param {Object} profile - The doctor's profile object.
 * @returns {number} - Completion percentage (0-100).
 */
export const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;

    let points = 0;
    const totalPoints = 100;

    // licenseNumber (10%)
    if (profile.licenseNumber && profile.licenseNumber.trim().length > 0) {
        points += 10;
    }

    // country (10%)
    if (profile.country && 
        profile.country !== 'Select Jurisdiction' && 
        profile.country !== 'Unknown') points += 10;

    // experience (10%)
    if (profile.experience && 
        profile.experience !== 'Experience Range') points += 10;

    // specialization (10%)
    if (profile.specialization && 
        profile.specialization !== 'Primary Focus') points += 10;

    // phoneNumber (10%)
    if (profile.phoneNumber && profile.phoneNumber.trim().length > 0) {
        points += 10;
    }

    // email (10%)
    if (profile.email && profile.email.trim().length > 0) points += 10;

    // degrees (20%) - Requires non-empty entry
    if (profile.degrees && profile.degrees.length > 0) {
        const firstDegree = profile.degrees[0];
        if (firstDegree.title && firstDegree.institution && 
            firstDegree.title.trim().length > 0 && 
            firstDegree.institution.trim().length > 0) {
            points += 20; 
        } else if (firstDegree.title || firstDegree.institution) {
            points += 5; // tiny credit for starting
        }
    }

    // photo (10%)
    if (profile.photo && profile.photo.trim().length > 0) {
        points += 10;
    }

    // bio (10%)
    if (profile.bio && profile.bio.trim().length > 0) {
        points += 10;
    }

    return Math.min(points, totalPoints);
};

/**
 * Calculates the completion percentage of a patient's profile.
 * @param {Object} profile - The patient's profile object.
 * @returns {number} - Completion percentage (0-100).
 */
export const calculatePatientProfileCompletion = (profile) => {
    if (!profile) return 0;
    let points = 0;

    // name (20%)
    if (profile.name && profile.name.trim().length > 0) points += 20;

    // email (20%)
    if (profile.email && profile.email.trim().length > 0) points += 20;

    // phoneNumber / phone (20%)
    const hasPhone = (profile.phoneNumber && profile.phoneNumber.trim().length > 0) || 
                     (profile.phone && profile.phone.trim().length > 0);
    if (hasPhone) points += 20;
    
    // age / dob (20%)
    if (profile.age || profile.dob) points += 20;

    // gender (20%)
    if (profile.gender && profile.gender !== '') points += 20;
    
    // photo (10% extra / optional but capped at 100)
    if (profile.photo && profile.photo.trim().length > 0) points += 10;

    return Math.min(points, 100);
};

/**
 * Calculates the completion percentage of a diagnosis center's profile.
 * @param {Object} profile - The center's profile object.
 * @returns {number} - Completion percentage (0-100).
 */
export const calculateCenterProfileCompletion = (profile) => {
    if (!profile) return 0;
    let points = 0;

    // centerName (15%)
    if (profile.centerName && profile.centerName.trim().length > 0) points += 15;

    // centerType (10%)
    if (profile.centerType && profile.centerType.trim().length > 0) points += 10;

    // email (15%)
    if (profile.email && profile.email.trim().length > 0) points += 15;

    // phone (15%)
    if (profile.phone && profile.phone.trim().length > 0) points += 15;

    // address (15%)
    if (profile.address && profile.address.trim().length > 0) points += 15;

    // city (15%)
    if (profile.city && profile.city.trim().length > 0) points += 15;
    
    // licenseNumber (15%)
    if (profile.licenseNumber && profile.licenseNumber.trim().length > 0) points += 15;

    // photo (10% extra / optional but capped at 100)
    if (profile.photo && profile.photo.trim().length > 0) points += 10;

    return Math.min(points, 100);
};
