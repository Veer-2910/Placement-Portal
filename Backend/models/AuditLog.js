const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "Result Uploaded",
        "Result Published",
        "Stage Progression",
        "Student Eliminated",
        "Student Selected",
        "Result Modified",
        "Result Deleted",
        "Bulk Upload",
        "Manual Entry",
        "Stage Created",
        "Stage Modified",
      ],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "performerModel",
      required: true,
    },
    performerModel: {
      type: String,
      enum: ["Employer", "Faculty", "Admin"],
      required: true,
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
    },
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveStage",
    },
    affectedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    affectedCount: {
      type: Number,
      default: 0,
    },
    details: {
      type: Object,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for audit trail queries
auditLogSchema.index({ drive: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
