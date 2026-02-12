const jwt = require("jsonwebtoken");
const Employer = require("../models/Employer");

// Middleware to verify employer JWT token
const verifyEmployerToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is for employer role
    if (decoded.role !== "employer") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Invalid role." 
      });
    }

    // Find employer
    const employer = await Employer.findById(decoded.id).select("-password");

    if (!employer) {
      return res.status(404).json({ 
        success: false, 
        message: "Employer not found." 
      });
    }

    // Check if employer account is active
    if (!employer.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: "Account is not active. Please wait for admin verification." 
      });
    }

    // Check verification status
    if (employer.verificationStatus !== "Verified") {
      return res.status(403).json({ 
        success: false, 
        message: `Account verification is ${employer.verificationStatus.toLowerCase()}. Please wait for admin approval.` 
      });
    }

    // Attach employer to request
    req.employer = employer;
    req.employerId = employer._id;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token." 
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired. Please login again." 
      });
    }
    
    console.error("Employer auth middleware error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Authentication error." 
    });
  }
};

// Optional middleware - allows both verified and unverified employers
const verifyEmployerTokenOptional = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(); // No token, continue without employer
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "employer") {
      const employer = await Employer.findById(decoded.id).select("-password");
      if (employer) {
        req.employer = employer;
        req.employerId = employer._id;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

module.exports = {
  verifyEmployerToken,
  verifyEmployerTokenOptional
};
