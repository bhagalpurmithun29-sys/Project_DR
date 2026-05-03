/**
 * Calculates the completion percentage of a doctor's profile.
 * @param {Object} profile - The doctor's profile object.
 * @returns {number} - Completion percentage (0-100).
 */
export const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;

    let points = 0;
    const totalPoints = 100;

    // licenseNumber (10%) - Case-insensitive check for TEMP-
    if (profile.licenseNumber && !profile.licenseNumber.toUpperCase().startsWith('TEMP-')) {
        points += 10;
    }

    // country (10%)
    if (profile.country && 
        profile.country !== 'Select Jurisdiction' && 
        profile.country !== 'Unknown') points += 10;

    // experience (10%)
    if (profile.experience && 
        profile.experience !== 'Experience Range' && 
        profile.experience !== '0') points += 10;

    // specialization (10%)
    if (profile.specialization && 
        profile.specialization !== 'Primary Focus' && 
        profile.specialization !== 'Retina Specialist') points += 10;

    // phoneNumber (10%) - Ignore placeholder 0000000000
    if (profile.phoneNumber && profile.phoneNumber !== '0000000000' && profile.phoneNumber.length > 5) {
        points += 10;
    }

    // email (10%)
    if (profile.email && !profile.email.includes('example.com')) points += 10;

    // degrees (20%) - Requires actual text, not just empty entries
    if (profile.degrees && profile.degrees.length > 0) {
        const firstDegree = profile.degrees[0];
        if (firstDegree.title && firstDegree.institution && 
            firstDegree.title.length > 2 && 
            firstDegree.institution.length > 2 &&
            !firstDegree.title.toLowerCase().includes('qualification') &&
            !firstDegree.institution.toLowerCase().includes('issuing')) {
            points += 20; 
        } else if (firstDegree.title || firstDegree.institution) {
            points += 5; // tiny credit for starting
        }
    }

    // photo (10%) - check if it's not the default
    if (profile.photo && !profile.photo.includes('default-doctor.jpg')) {
        points += 10;
    }

    // bio (10%) - check if it's not the default placeholder
    const defaultBio = "Board-certified Retina Specialist specializing in advanced diabetic retinopathy grading, macular degeneration intervention, and AI-assisted clinical diagnoses.";
    if (profile.bio && 
        profile.bio.trim() !== defaultBio.trim() && 
        profile.bio.trim().length > 30) {
        points += 10;
    }

    return Math.min(points, totalPoints);
};
