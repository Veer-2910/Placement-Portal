/**
 * Shared utility for profile calculation logic to ensure consistency
 * across different parts of the application.
 */

export const calculateProfileStrength = (profile) => {
    if (!profile) return 0;
    
    // Define weights or simple count of essential fields
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

export const getStrengthTips = (profile) => {
    if (!profile) return ["Complete your basic profile details"];
    
    // If passed a number (strength) instead of profile object, handle gracefully
    if (typeof profile === 'number') {
        if (profile === 100) return ["Profile Perfected!"];
        if (profile > 70) return ["Add more projects", "Link social profiles"];
        return ["Add skills", "Upload resume", "Add bio"];
    }
    
    const tips = [];
    
    if (!profile.resume) tips.push("Upload your latest resume");
    if (!profile.profilePicture) tips.push("Add a professional profile picture");
    if (!profile.skills || profile.skills.length === 0) tips.push("Add your key technical skills");
    if (!profile.projects || profile.projects.length === 0) tips.push("Showcase your projects");
    if (!profile.socialLinks?.linkedin) tips.push("Link your LinkedIn profile");
    if (!profile.socialLinks?.github) tips.push("Link your GitHub profile");
    if (!profile.bio || profile.bio.length < 20) tips.push("Write a short professional bio");
    if (!profile.location) tips.push("Add your current location");
    
    if (tips.length === 0) return ["Keep your profile updated!"];
    return tips;
};
