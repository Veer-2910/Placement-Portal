const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Selected"],
      default: "Applied",
    },
    appliedAt: { type: Date, default: Date.now },
    resume: { type: String }, // URL or path to resume if different from profile
    notes: { type: String },
    // Snapshots at time of application
    cgpaAtTime: { type: Number },
    backlogsCount: { type: Number, default: 0 },
    skills: [{ type: String }],
    phoneNumber: { type: String },
    willingToRelocate: { type: Boolean, default: true },
    // Enhanced application fields
    coverLetter: { type: String }, // Statement of purpose / motivation
    linkedinProfile: { type: String },
    githubProfile: { type: String },
    certifications: [{ type: String }], // List of certifications
    // Faculty review added to provide structured, actionable feedback
    facultyReview: {
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
      rating: { type: Number, min: 1, max: 5 },
      comments: { type: String },
      improvementAreas: [{ type: String }],
      recommendedAction: { type: String }, // e.g., "Improve Project", "Resubmit", "Shortlist"
      reviewedAt: { type: Date },
    },
    
    // Employer Feedback - Comprehensive evaluation
    employerFeedback: {
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" },
      
      // Rating Categories (1-5 scale)
      ratings: {
        technicalSkills: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        professionalism: { type: Number, min: 1, max: 5 },
        problemSolving: { type: Number, min: 1, max: 5 },
        teamwork: { type: Number, min: 1, max: 5 },
        overallJobReadiness: { type: Number, min: 1, max: 5 }
      },
      
      // Detailed Feedback
      detailedComments: { type: String },
      strengths: [{ type: String }],
      areasForImprovement: [{ type: String }],
      
      // Skill Gap Analysis
      skillGaps: [{
        skill: { type: String },
        currentLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
        requiredLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
        recommendations: { type: String }
      }],
      
      // Industry Expectations
      industryExpectations: { type: String },
      marketReadiness: { type: String, enum: ["Ready", "Needs Improvement", "Not Ready"] },
      
      // Recommendation
      recommendation: { 
        type: String, 
        enum: ["Strongly Recommend", "Recommend", "Consider", "Not Recommended"] 
      },
      
      reviewedAt: { type: Date }
    },
    
    // Interview Scheduling
    interviews: [{
      round: { type: Number }, // 1, 2, 3, etc.
      type: { type: String, enum: ["Technical", "HR", "Managerial", "Group Discussion", "Case Study"] },
      scheduledDate: { type: Date },
      duration: { type: Number }, // in minutes
      mode: { type: String, enum: ["Online", "Offline", "Hybrid"] },
      location: { type: String }, // Meeting link or physical location
      interviewers: [{ type: String }], // Names of interviewers
      status: { 
        type: String, 
        enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
        default: "Scheduled"
      },
      feedback: { type: String },
      result: { type: String, enum: ["Passed", "Failed", "Pending"] }
    }],
    
    // Stage-Based Recruitment System (v2)
    stageProgressRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StageProgress"
    },
    driveVersion: {
      type: String,
      enum: ["v1", "v2"],
      default: "v1"
    },
    
    // Test/Assessment Results
    testResults: [{
      testName: { type: String },
      testType: { type: String, enum: ["Aptitude", "Technical", "Coding", "Domain Specific"] },
      conductedDate: { type: Date },
      score: { type: Number },
      maxScore: { type: Number },
      percentile: { type: Number },
      passed: { type: Boolean },
      feedback: { type: String }
    }]
  },
  { timestamps: true }
);

// A student can apply once to a specific job
// Index removed to prevent duplicate key errors during dev. handled by logic.

module.exports = mongoose.model("Application", applicationSchema);
