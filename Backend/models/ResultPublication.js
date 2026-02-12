const mongoose = require("mongoose");

const resultPublicationSchema = new mongoose.Schema(
  {
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
      required: true,
    },
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveStage",
      required: true,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "publisherModel",
      required: true,
    },
    publisherModel: {
      type: String,
      enum: ["Employer", "Faculty", "Admin"],
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    // Statistics for preview/tracking
    previewData: {
      totalStudents: { type: Number },
      qualified: { type: Number },
      notQualified: { type: Number },
      pending: { type: Number },
      cutoffPercentage: { type: Number },
      averageMarks: { type: Number },
      highestMarks: { type: Number },
      lowestMarks: { type: Number },
    },
    notificationsSent: {
      type: Boolean,
      default: false,
    },
    notificationsSentAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes
resultPublicationSchema.index({ drive: 1, stage: 1 }, { unique: true });
resultPublicationSchema.index({ drive: 1, isPublished: 1 });

module.exports = mongoose.model("ResultPublication", resultPublicationSchema);
