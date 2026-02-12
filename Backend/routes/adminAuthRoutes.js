const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const { verifyAdminToken } = require("../middleware/adminAuth");

// Public routes
router.post("/login", adminAuthController.login);

// Protected routes
router.get("/profile", verifyAdminToken, adminAuthController.getProfile);
router.put("/profile", verifyAdminToken, adminAuthController.updateProfile);
router.put("/change-password", verifyAdminToken, adminAuthController.changePassword);

module.exports = router;
