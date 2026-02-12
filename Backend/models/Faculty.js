const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    availability: {
      type: String,
      enum: ["Active", "Sabbatical", "On Leave", "Remote Only"],
      default: "Active",
    },
    institute: {
      type: String,
      required: true,
      trim: true,
      enum: ["DEPSTAR", "CSPIT", "CMPICA"],
    },
    department: {
      type: String,
      required: true,
      enum: ["CSE", "CE", "IT", "ME", "CL", "EC", "EE"],
    },
    employeeId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      unique: true,
      trim: true,
    },
    staffId: { type: String, trim: true },
    facultyId: { type: String, trim: true },
    mobile: { type: String, required: true },
    department: { type: String, required: true },
    universityEmail: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: { type: String, lowercase: true, trim: true },
    officialEmail: { type: String, lowercase: true, trim: true },
    personalEmail: { type: String, lowercase: true, trim: true },
    password: { type: String, required: false },
    profilePicture: { type: String },
    bio: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    researchInterests: [{ type: String, trim: true }],
    experience: [{ type: String, trim: true }],
    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      website: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

// Explicitly bind model to existing 'faculty' collection in MongoDB
module.exports = mongoose.model("Faculty", FacultySchema, "faculty");
