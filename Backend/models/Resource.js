const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // Either a link or file path will be stored
  link: { type: String },
  filePath: { type: String },
  fileName: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
  // Categories and tags
  category: { type: String, index: true },
  tags: [{ type: String }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  uploadedByName: { type: String },
  institute: { type: String },
  department: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure either link or file info is provided
resourceSchema.pre("save", function (next) {
  if (!this.link && !this.filePath) {
    return next(new Error("Either link or file must be provided"));
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Resource", resourceSchema);
