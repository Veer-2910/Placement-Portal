const mongoose = require("mongoose");

const aptitudeResultSchema = new mongoose.Schema(
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
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriveStage",
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["Qualified", "Not Qualified", "Pending"],
      default: "Pending",
    },
    remarks: {
      type: String,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "evaluatorModel",
    },
    evaluatorModel: {
      type: String,
      enum: ["Employer", "Faculty", "Admin"],
    },
    evaluatedAt: {
      type: Date,
    },
    uploadMethod: {
      type: String,
      enum: ["CSV", "Excel", "Manual"],
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    // Store original CSV row for audit purposes
    originalData: {
      type: Object,
    },
  },
  { timestamps: true }
);

// Calculate percentage before saving
aptitudeResultSchema.pre("save", function (next) {
  if (this.marksObtained !== undefined && this.totalMarks !== undefined && this.totalMarks > 0) {
    this.percentage = (this.marksObtained / this.totalMarks) * 100;
  }
  next();
});

// Indexes for efficient querying
aptitudeResultSchema.index({ drive: 1, student: 1 });
aptitudeResultSchema.index({ drive: 1, published: 1 });
aptitudeResultSchema.index({ application: 1 });
aptitudeResultSchema.index({ student: 1, published: 1 });

// Ensure one result per student per stage per drive
aptitudeResultSchema.index(
  { drive: 1, student: 1, stage: 1 },
  { unique: true }
);

module.exports = mongoose.model("AptitudeResult", aptitudeResultSchema);
