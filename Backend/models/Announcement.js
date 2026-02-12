const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // File attachment for announcements
  filePath: { type: String },
  fileName: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
  // Tracking who has read the announcement
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true,
  },
  uploadedByName: { type: String },
  institute: { type: String },
  department: { type: String },
  category: { type: String, default: "General" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Announcement", announcementSchema);
