/**
 * Shared utility for profile calculation logic to ensure consistency
 * across different parts of the application.
 */

export const calculateProfileStrength = (profile) => {
    if (!profile) return 0;
    
    // Define weights or simple count of essential fields
    // Using a refined list to ensure consistency
    const essentialFields = [
        profile.fullName,
        profile.phone || profile.mobile,
        profile.personalEmail,
        profile.bio && profile.bio.length > 10,
        profile.location,
        profile.profilePicture,
        profile.resume,
        profile.skills && profile.skills.length > 0,
        profile.projects && profile.projects.length > 0,
        profile.socialLinks?.linkedin,
        profile.socialLinks?.github
    ];

    const filledFields = essentialFields.filter(field => !!field).length;
    const totalFields = essentialFields.length;
    
    return Math.round((filledFields / totalFields) * 100);
};

export const getStrengthTips = (strength) => {
    if (strength === 100) return "Profile Perfected! Recruiters love a complete profile. You're set!";
    if (strength > 70) return "Almost there! Add more projects or social links to stand out.";
    if (strength > 30) return "Good progress! Adding a professional bio and resume will greatly help.";
    return "Start strong! Add your skills, location, and a professional photo.";
};
