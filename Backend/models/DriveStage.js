const mongoose = require("mongoose");

const driveStageSchema = new mongoose.Schema(
  {
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
      required: true,
    },
    stageName: {
      type: String,
      required: true,
    },
    stageType: {
      type: String,
      enum: [
        "Aptitude Test",
        "Technical Interview",
        "HR Interview",
        "Group Discussion",
        "Coding Round",
        "Managerial Round",
        "Final Selection",
        "Other",
      ],
      required: true,
    },
    description: {
      type: String,
    },
    cutoffCriteria: {
      type: {
        type: String,
        enum: ["percentage", "marks", "none"],
        default: "percentage",
      },
      value: { type: Number },
      totalMarks: { type: Number },
    },
    scheduledDate: {
      type: Date,
    },
    location: {
      type: String,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Offline",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
    },
    instructions: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
driveStageSchema.index({ drive: 1, order: 1 });
driveStageSchema.index({ drive: 1, isActive: 1 });

module.exports = mongoose.model("DriveStage", driveStageSchema);
