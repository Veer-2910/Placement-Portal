const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // TTL index - document auto-deletes after 5 minutes (300 seconds)
    },
  }
);

// Index to speed up email lookups
otpSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("OTP", otpSchema);
