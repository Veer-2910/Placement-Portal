const Employer = require("../models/Employer");
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/employer/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "employer-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG) and PDF files are allowed"));
    }
  },
});

// ==================== AUTHENTICATION ====================

// Register new employer
exports.register = async (req, res) => {
  try {
    const {
      companyName,
      companyEmail,
      password,
      industry,
      companySize,
      website,
      description,
      contactPerson,
      address
    } = req.body;

    // Validate required fields
    if (!companyName || !companyEmail || !password || !industry || !companySize || !contactPerson?.name) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if employer already exists
    const existingEmployer = await Employer.findOne({ companyEmail: companyEmail.toLowerCase() });
    if (existingEmployer) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    // Create new employer
    const employer = new Employer({
      companyName,
      companyEmail: companyEmail.toLowerCase(),
      password,
      industry,
      companySize,
      website,
      description,
      contactPerson,
      address,
      verificationStatus: "Pending",
      isActive: false
    });

    await employer.save();

    res.status(201).json({
      success: true,
      message: "Registration successful! Your account is pending admin verification.",
      data: {
        companyName: employer.companyName,
        companyEmail: employer.companyEmail,
        verificationStatus: employer.verificationStatus
      }
    });
  } catch (error) {
    console.error("Employer registration error:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
};

// Login employer
exports.login = async (req, res) => {
  try {
    const { companyEmail, password } = req.body;

    // Validate input
    if (!companyEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find employer
    const employer = await Employer.findOne({ companyEmail: companyEmail.toLowerCase() });
    if (!employer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check password
    const isPasswordValid = await employer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check verification status
    if (employer.verificationStatus === "Rejected") {
      return res.status(403).json({
        success: false,
        message: `Your account has been rejected. Reason: ${employer.rejectionReason || "Not specified"}`
      });
    }

    if (employer.verificationStatus === "Pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is pending verification. Please wait for admin approval."
      });
    }

    if (!employer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support."
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: employer._id, role: "employer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login
    employer.lastLogin = new Date();
    await employer.save();

    // Send response
    const employerData = employer.toObject();
    delete employerData.password;

    res.json({
      success: true,
      message: "Login successful",
      token,
      employer: employerData
    });
  } catch (error) {
    console.error("Employer login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
};

// ==================== PROFILE MANAGEMENT ====================

// Get employer profile
exports.getProfile = async (req, res) => {
  try {
    const employer = await Employer.findById(req.employerId).select("-password");
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found"
      });
    }

    res.json({
      success: true,
      employer
    });
  } catch (error) {
    console.error("Get employer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
};

// Update employer profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Fields that cannot be updated
    const restrictedFields = ["companyEmail", "password", "verificationStatus", "isActive", "stats"];
    restrictedFields.forEach(field => delete updates[field]);

    const employer = await Employer.findByIdAndUpdate(
      req.employerId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      employer
    });
  } catch (error) {
    console.error("Update employer profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

// Upload company logo
exports.uploadLogo = [
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const logoUrl = `/uploads/employer/${req.file.filename}`;

      const employer = await Employer.findByIdAndUpdate(
        req.employerId,
        { logo: logoUrl },
        { new: true }
      ).select("-password");

      res.json({
        success: true,
        message: "Logo uploaded successfully",
        logoUrl,
        employer
      });
    } catch (error) {
      console.error("Upload logo error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload logo"
      });
    }
  }
];

// Upload verification documents
exports.uploadDocument = [
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const { documentType } = req.body;
      if (!documentType) {
        return res.status(400).json({
          success: false,
          message: "Document type is required"
        });
      }

      const documentUrl = `/uploads/employer/${req.file.filename}`;

      const employer = await Employer.findByIdAndUpdate(
        req.employerId,
        {
          $push: {
            verificationDocuments: {
              documentType,
              documentUrl,
              uploadedAt: new Date()
            }
          }
        },
        { new: true }
      ).select("-password");

      res.json({
        success: true,
        message: "Document uploaded successfully",
        documentUrl,
        employer
      });
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload document"
      });
    }
  }
];

// Get employer statistics
exports.getStats = async (req, res) => {
  try {
    const employer = await Employer.findById(req.employerId);
    
    // Get real-time stats
    const totalJobs = await Drive.countDocuments({ postedByEmployer: req.employerId });
    const activeJobs = await Drive.countDocuments({ 
      postedByEmployer: req.employerId, 
      active: true,
      approvalStatus: "Approved"
    });
    const pendingJobs = await Drive.countDocuments({ 
      postedByEmployer: req.employerId, 
      approvalStatus: "Pending"
    });

    // Get applications
    const jobs = await Drive.find({ postedByEmployer: req.employerId }).select("_id");
    const jobIds = jobs.map(job => job._id);
    
    const totalApplications = await Application.countDocuments({ drive: { $in: jobIds } });
    const shortlisted = await Application.countDocuments({ 
      drive: { $in: jobIds }, 
      status: "Shortlisted" 
    });
    const selected = await Application.countDocuments({ 
      drive: { $in: jobIds }, 
      status: "Selected" 
    });

    res.json({
      success: true,
      stats: {
        totalJobsPosted: totalJobs,
        activeJobs,
        pendingApproval: pendingJobs,
        totalApplications,
        shortlisted,
        selected,
        averageRating: employer.stats.averageRating,
        totalReviews: employer.stats.totalReviews
      }
    });
  } catch (error) {
    console.error("Get employer stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
};

module.exports = exports;
