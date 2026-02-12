const express = require("express");
const router = express.Router();
const stageManagementController = require("../controllers/stageManagementController");

// Authentication middleware
const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// All routes require authentication
router.use(authMiddleware);

// ==================== STAGE INFORMATION ====================
// Get all stages for a drive
router.get("/:driveId", stageManagementController.getStages);

// ==================== STUDENT PROGRESS ====================
// Get specific student's progress
router.get("/:driveId/students/:studentId/progress", stageManagementController.getStudentProgress);

// Get all students' progress for a drive (Employer/Admin/Faculty only)
router.get("/:driveId/all-progress", stageManagementController.getAllStudentsProgress);

// ==================== MANUAL PROGRESSION ====================
// Manually progress students to a specific stage (Employer/Admin only)
router.post("/:driveId/progress", stageManagementController.manualProgressStudents);

module.exports = router;
