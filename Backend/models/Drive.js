const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    driveId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    title: { type: String, required: true }, // Job Title for the drive
    type: { 
      type: String, 
      enum: ["On-Campus"], 
      default: "On-Campus" 
    },
    jobRole: { type: String }, // e.g., "Full Stack Developer"
    ctc: { type: String }, // Salary details
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    eligibility: {
      cgpa: { type: Number, default: 0 },
      branches: [{ type: String }],
      backlogsAllowed: { type: Boolean, default: false },
      gender: { type: String, enum: ["All", "Male", "Female"], default: "All" }
    },
    requirements: [{ type: String }], // Skills/Requirements
    process: [{
      step: { type: String }, 
      date: { type: Date },
      details: { type: String }
    }],
    active: { type: Boolean, default: true },
    description: { type: String }, // Professional job description
    aboutCompany: { type: String },
    contactEmail: { type: String },
    // Smart matching fields
    requiredSkills: [{ type: String }], // Must-have skills
    preferredSkills: [{ type: String }], // Nice-to-have skills
    jobType: { type: String, enum: ["Full-time", "Internship", "Part-time"], default: "Full-time" },
    workMode: { type: String, enum: ["Remote", "Hybrid", "Onsite"], default: "Onsite" },
    
    // Posted By - Either Faculty or Employer
    postedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Faculty"
    },
    postedByEmployer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer"
    },
    
    // Approval Workflow for Employer Posts
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: function() {
        // Auto-approve if posted by faculty, pending if posted by employer
        return this.postedBy ? "Approved" : "Pending";
      }
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    
    // Stage-Based Recruitment System (v2)
    workflowVersion: {
      type: String,
      enum: ["v1", "v2"],
      default: "v1" // v1 = legacy status-based, v2 = stage-based
    },
    stages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveStage"
    }],
    currentActiveStage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveStage"
    },
    stagesEnabled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes
driveSchema.index({ active: 1 });
driveSchema.index({ type: 1 });
driveSchema.index({ companyName: 1 });
driveSchema.index({ jobType: 1 });
driveSchema.index({ "eligibility.branches": 1 });
driveSchema.index({ postedByEmployer: 1 });
driveSchema.index({ approvalStatus: 1 });
driveSchema.index({ approvalStatus: 1, active: 1 }); // Compound index for filtering
driveSchema.index({ workflowVersion: 1 });
driveSchema.index({ stagesEnabled: 1, active: 1 });

module.exports = mongoose.model("Drive", driveSchema);
