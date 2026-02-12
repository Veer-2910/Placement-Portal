const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const { verifyEmployerToken } = require("../middleware/employerAuth");

// ==================== PUBLIC ROUTES ====================
// Registration and Login
router.post("/register", employerController.register);
router.post("/login", employerController.login);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication
router.use(verifyEmployerToken);

// Profile Management
router.get("/profile", employerController.getProfile);
router.put("/profile", employerController.updateProfile);
router.post("/upload-logo", employerController.uploadLogo);
router.post("/upload-document", employerController.uploadDocument);

// Statistics
router.get("/stats", employerController.getStats);

module.exports = router;
