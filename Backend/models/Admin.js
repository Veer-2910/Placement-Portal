const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "admin",
      immutable: true
    },
    designation: {
      type: String,
      enum: ["TNP Head", "Placement Officer", "Assistant Placement Officer", "System Admin"],
      default: "Placement Officer"
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    permissions: [{
      type: String,
      enum: [
        "verify_employers",
        "approve_jobs",
        "manage_students",
        "manage_faculty",
        "view_analytics",
        "manage_announcements",
        "manage_resources",
        "system_settings"
      ]
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    profilePicture: {
      type: String
    }
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Default permissions for TNP Head
adminSchema.pre("save", function (next) {
  if (this.isNew && this.designation === "TNP Head" && this.permissions.length === 0) {
    this.permissions = [
      "verify_employers",
      "approve_jobs",
      "manage_students",
      "manage_faculty",
      "view_analytics",
      "manage_announcements",
      "manage_resources",
      "system_settings"
    ];
  }
  next();
});

// Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ adminId: 1 });
adminSchema.index({ isActive: 1 });

module.exports = mongoose.model("Admin", adminSchema);
