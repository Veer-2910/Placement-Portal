const mongoose = require("mongoose");

const stageProgressSchema = new mongoose.Schema(
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
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    currentStage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveStage",
    },
    currentStageOrder: {
      type: Number,
      default: 0,
    },
    stageHistory: [
      {
        stage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DriveStage",
        },
        stageName: { type: String },
        enteredAt: { type: Date, default: Date.now },
        exitedAt: { type: Date },
        status: {
          type: String,
          enum: ["In Progress", "Passed", "Failed", "Skipped"],
          default: "In Progress",
        },
        result: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AptitudeResult",
        },
        notes: { type: String },
      },
    ],
    overallStatus: {
      type: String,
      enum: ["Active", "Eliminated", "Selected", "On Hold"],
      default: "Active",
    },
    eliminatedAt: {
      type: Date,
    },
    eliminatedReason: {
      type: String,
    },
    selectedAt: {
      type: Date,
    },
    finalRemarks: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes
stageProgressSchema.index({ drive: 1, student: 1 }, { unique: true });
stageProgressSchema.index({ drive: 1, overallStatus: 1 });
stageProgressSchema.index({ currentStage: 1 });
stageProgressSchema.index({ application: 1 });

// Helper method to progress to next stage
stageProgressSchema.methods.progressToStage = async function (
  nextStage,
  nextStageOrder,
  status = "Passed"
) {
  // Mark current stage as exited
  if (this.currentStage && this.stageHistory.length > 0) {
    const currentHistoryEntry = this.stageHistory[this.stageHistory.length - 1];
    currentHistoryEntry.exitedAt = new Date();
    currentHistoryEntry.status = status;
  }

  // Add new stage to history
  this.stageHistory.push({
    stage: nextStage._id,
    stageName: nextStage.stageName,
    enteredAt: new Date(),
    status: "In Progress",
  });

  // Update current stage
  this.currentStage = nextStage._id;
  this.currentStageOrder = nextStageOrder;

  await this.save();
};

// Helper method to eliminate student
stageProgressSchema.methods.eliminate = async function (reason) {
  // Mark current stage as failed
  if (this.stageHistory.length > 0) {
    const currentHistoryEntry = this.stageHistory[this.stageHistory.length - 1];
    currentHistoryEntry.exitedAt = new Date();
    currentHistoryEntry.status = "Failed";
  }

  this.overallStatus = "Eliminated";
  this.eliminatedAt = new Date();
  this.eliminatedReason = reason;

  await this.save();
};

// Helper method to select student
stageProgressSchema.methods.selectStudent = async function () {
  // Mark current stage as passed
  if (this.stageHistory.length > 0) {
    const currentHistoryEntry = this.stageHistory[this.stageHistory.length - 1];
    currentHistoryEntry.exitedAt = new Date();
    currentHistoryEntry.status = "Passed";
  }

  this.overallStatus = "Selected";
  this.selectedAt = new Date();

  await this.save();
};

module.exports = mongoose.model("StageProgress", stageProgressSchema);
