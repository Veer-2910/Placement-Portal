const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employerSchema = new mongoose.Schema(
  {
    // Company Information
    companyName: { type: String, required: true, trim: true },
    companyEmail: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true,
      validate: {
        validator: function(email) {
          // Reject common free email providers
          const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
          const domain = email.split('@')[1];
          return !freeEmailDomains.includes(domain);
        },
        message: 'Please use an official company email address'
      }
    },
    password: { type: String, required: true },
    
    // Company Details
    industry: { 
      type: String, 
      enum: ['IT/Software', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'E-commerce', 'Education', 'Other'],
      required: true 
    },
    companySize: { 
      type: String, 
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      required: true 
    },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    foundedYear: { type: Number },
    headquarters: { type: String, trim: true },
    
    // Contact Information
    contactPerson: {
      name: { type: String, required: true, trim: true },
      designation: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true }
    },
    
    // Address
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true },
      pincode: { type: String, trim: true }
    },
    
    // Verification & Status
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    verificationDocuments: [{
      documentType: { type: String }, // 'Company Registration', 'GST Certificate', etc.
      documentUrl: { type: String },
      uploadedAt: { type: Date, default: Date.now }
    }],
    verifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Faculty' 
    },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    
    // Branding
    logo: { type: String }, // URL to company logo
    coverImage: { type: String }, // Banner/cover image
    
    // Social Links
    socialLinks: {
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true }
    },
    
    // Statistics & Ratings
    stats: {
      totalJobsPosted: { type: Number, default: 0 },
      activeJobs: { type: Number, default: 0 },
      totalHires: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 }
    },
    
    // Reviews from students (after placement/internship)
    reviews: [{
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      reviewDate: { type: Date, default: Date.now }
    }],
    
    // Account Status
    isActive: { type: Boolean, default: false }, // Activated after verification
    lastLogin: { type: Date },
    
    // Preferences
    preferences: {
      preferredBranches: [{ type: String }],
      preferredSkills: [{ type: String }],
      notificationEmail: { type: Boolean, default: true },
      notificationSMS: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// Hash password before saving
employerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
employerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for common queries
employerSchema.index({ companyEmail: 1 });
employerSchema.index({ verificationStatus: 1 });
employerSchema.index({ isActive: 1 });
employerSchema.index({ industry: 1 });
employerSchema.index({ companyName: 'text' });

module.exports = mongoose.model("Employer", employerSchema);
