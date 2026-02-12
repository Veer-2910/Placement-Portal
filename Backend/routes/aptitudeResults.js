const express = require("express");
const router = express.Router();
const aptitudeResultController = require("../controllers/aptitudeResultController");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/results/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".csv", ".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only CSV and Excel files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Authentication middleware (reused from other routes)
const authMiddleware = (req, res, next) => {
  const jwt = require("jsonwebtoken");
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

// ==================== RESULT UPLOAD ====================
// Bulk CSV/Excel upload
router.post("/:driveId/upload-csv", upload.single("file"), aptitudeResultController.uploadResults);

// Manual entry for individual result
router.post("/:driveId/manual-entry", aptitudeResultController.manualEntry);

// ==================== RESULT PREVIEW & PUBLISH ====================
// Preview results before publishing (Employer/Admin/Faculty only)
router.get("/:driveId/preview", aptitudeResultController.previewResults);

// Publish results to students (Employer/Admin only)
router.post("/:driveId/publish", aptitudeResultController.publishResults);

// ==================== STUDENT ACCESS ====================
// Student views own result (only if published)
router.get("/:driveId/my-result", aptitudeResultController.getMyResult);

module.exports = router;
