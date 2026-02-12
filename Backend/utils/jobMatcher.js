/**
 * Smart Job Matching Algorithm
 * Calculates match score between a student and a job drive
 * 
 * Weights:
 * - Skills Match: 40%
 * - CGPA Eligibility: 20%
 * - Branch Match: 15%
 * - Location Preference: 10%
 * - Job Type Preference: 10%
 * - Work Mode Preference: 5%
 */

/**
 * Calculate match score for a single student-drive pair
 * @param {Object} student - Student document
 * @param {Object} drive - Drive document
 * @returns {Number} Match score (0-100)
 */
function calculateMatchScore(student, drive) {
  let totalScore = 0;

  // 1. Skills Match (40%)
  const studentSkills = (student.skills || []).map(s => s.toLowerCase());
  const requiredSkills = (drive.requiredSkills || []).map(s => s.toLowerCase());
  const preferredSkills = (drive.preferredSkills || []).map(s => s.toLowerCase());
  
  if (requiredSkills.length > 0 || preferredSkills.length > 0) {
    const allDriveSkills = [...requiredSkills, ...preferredSkills];
    const matchedSkills = studentSkills.filter(skill => 
      allDriveSkills.some(driveSkill => driveSkill.includes(skill) || skill.includes(driveSkill))
    );
    
    // Required skills are weighted more
    const requiredMatches = studentSkills.filter(skill => 
      requiredSkills.some(req => req.includes(skill) || skill.includes(req))
    ).length;
    
    const skillScore = allDriveSkills.length > 0
      ? ((requiredMatches * 2 + matchedSkills.length) / (requiredSkills.length * 2 + allDriveSkills.length)) * 40
      : 20; // Neutral if no skills specified
    
    totalScore += skillScore;
  } else {
    totalScore += 20; // Neutral score if no skills specified
  }

  // 2. CGPA Eligibility (20%)
  const minCGPA = drive.eligibility?.cgpa || 0;
  const studentCGPA = student.cgpa || 0;
  
  if (studentCGPA >= minCGPA) {
    // Bonus for exceeding minimum
    const cgpaBonus = Math.min((studentCGPA - minCGPA) * 2, 5);
    totalScore += 15 + cgpaBonus;
  } else {
    // Penalty for not meeting requirement
    totalScore += 0;
  }

  // 3. Branch Match (15%)
  const eligibleBranches = drive.eligibility?.branches || [];
  if (eligibleBranches.length === 0 || eligibleBranches.includes(student.branch)) {
    totalScore += 15;
  } else {
    totalScore += 0;
  }

  // 4. Location Preference (10%)
  const preferredLocations = (student.preferences?.locations || []).map(l => l.toLowerCase());
  const driveLocation = (drive.location || "").toLowerCase();
  
  if (preferredLocations.length === 0) {
    totalScore += 5; // Neutral if no preference
  } else if (preferredLocations.some(loc => driveLocation.includes(loc) || loc.includes(driveLocation))) {
    totalScore += 10;
  } else {
    totalScore += 2; // Small penalty for mismatch
  }

  // 5. Job Type Preference (10%)
  const preferredJobTypes = student.preferences?.jobTypes || [];
  const driveJobType = drive.jobType || "Full-time";
  
  if (preferredJobTypes.length === 0) {
    totalScore += 5; // Neutral
  } else if (preferredJobTypes.includes(driveJobType)) {
    totalScore += 10;
  } else {
    totalScore += 2;
  }

  // 6. Work Mode Preference (5%)
  const driveWorkMode = drive.workMode || "Onsite";
  // Assume students prefer Remote/Hybrid over Onsite
  if (driveWorkMode === "Remote") {
    totalScore += 5;
  } else if (driveWorkMode === "Hybrid") {
    totalScore += 3;
  } else {
    totalScore += 2;
  }

  return Math.min(Math.round(totalScore), 100);
}

/**
 * Get matched jobs for a student
 * @param {Object} student - Student document
 * @param {Array} drives - Array of drive documents
 * @returns {Array} Drives with match scores, sorted by score descending
 */
function getMatchedJobs(student, drives) {
  const scoredDrives = drives.map(drive => ({
    ...drive.toObject(),
    matchScore: calculateMatchScore(student, drive)
  }));

  // Filter out drives where student doesn't meet minimum requirements
  const eligibleDrives = scoredDrives.filter(drive => {
    const meetsGPA = (student.cgpa || 0) >= (drive.eligibility?.cgpa || 0);
    const meetsBranch = !drive.eligibility?.branches?.length || 
                        drive.eligibility.branches.includes(student.branch);
    return meetsGPA && meetsBranch;
  });

  // Sort by match score descending
  return eligibleDrives.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get matched students for a drive (faculty view)
 * @param {Object} drive - Drive document
 * @param {Array} students - Array of student documents
 * @returns {Array} Students with match scores, sorted by score descending
 */
function getMatchedStudents(drive, students) {
  const scoredStudents = students.map(student => ({
    ...student.toObject(),
    matchScore: calculateMatchScore(student, drive)
  }));

  // Filter eligible students
  const eligibleStudents = scoredStudents.filter(student => {
    const meetsGPA = (student.cgpa || 0) >= (drive.eligibility?.cgpa || 0);
    const meetsBranch = !drive.eligibility?.branches?.length || 
                        drive.eligibility.branches.includes(student.branch);
    return meetsGPA && meetsBranch;
  });

  // Sort by match score descending
  return eligibleStudents.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = {
  calculateMatchScore,
  getMatchedJobs,
  getMatchedStudents
};
