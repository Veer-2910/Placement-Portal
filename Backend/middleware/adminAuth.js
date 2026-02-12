const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Verify admin token
exports.verifyAdminToken = async (req, res, next) => {
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

    // Check if role is admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    // Find admin
    const admin = await Admin.findById(decoded.id).select("-password");
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated"
      });
    }

    // Attach admin to request
    req.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }
    
    console.error("Admin auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Check specific permission
exports.checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.permissions) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (!req.admin.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${requiredPermission}`
      });
    }

    next();
  };
};
