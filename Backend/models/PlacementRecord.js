const mongoose = require("mongoose");

const placementRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["CE", "CSE", "IT", "AI/ML"],
    },
    companyName: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    packageLPA: {
      type: Number,
      required: true,
      min: 0,
    },
    placementYear: {
      type: Number,
      required: true,
    },
    placementDate: {
      type: Date,
      default: Date.now,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    // Additional details
    jobType: {
      type: String,
      enum: ["Full-time", "Internship", "Part-time"],
      default: "Full-time",
    },
    location: {
      type: String,
    },
    offerLetterUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
placementRecordSchema.index({ department: 1, placementYear: 1 });
placementRecordSchema.index({ companyName: 1 });
placementRecordSchema.index({ student: 1 });

module.exports = mongoose.model("PlacementRecord", placementRecordSchema);
