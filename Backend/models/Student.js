const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, unique: true, sparse: true }, // Made sparse/optional
    enrollmentNumber: { type: String }, // From real data
    rollNo: { type: String }, // Possible variation
    fullName: { type: String, required: true },
    universityEmail: { type: String, required: true, unique: true },
    personalEmail: { type: String },
    phone: { type: String },
    mobile: { type: String }, // From real data
    institute: { type: String },
    branch: { type: String },
    cgpa: { type: Number },
    yearOfEnrollment: { type: Number },
    academicYear: { type: String }, // From real data "2021-25"
    expectedYearOfGraduation: { type: Number },
    location: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Graduated", "Interning", "Seeking Opportunities", "Placed"], default: "Active" },
    address: {
      streetAddress: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
    profilePicture: { type: String },
    bio: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    interestAreas: [{ type: String, trim: true }],
    projects: [{ type: String, trim: true }],
    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      portfolio: { type: String, trim: true }
    },
    resume: { type: String, trim: true },
    bookmarkedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Drive" }],
    // Job matching preferences
    preferences: {
      jobTypes: [{ type: String }], // Full-time, Internship, Remote
      locations: [{ type: String }], // Preferred cities
      minSalary: { type: Number }, // Minimum expected CTC
      roles: [{ type: String }] // SDE, Analyst, Designer, etc.
    },
    // Password is optional so that institute can preload records without credentials.
    // It will be set by the first-time "set password" flow.
    password: { type: String },
  },
  { timestamps: true }
);

// Indexes for common queries
studentSchema.index({ enrollmentNumber: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ branch: 1 });
studentSchema.index({ cgpa: -1 }); // Optimize sorting by top students
studentSchema.index({ "preferences.locations": 1 });
studentSchema.index({ "preferences.roles": 1 });

// Explicitly bind model to existing 'student' collection in MongoDB
module.exports = mongoose.model("Student", studentSchema, "student");
