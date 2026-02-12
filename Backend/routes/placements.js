const express = require("express");
const router = express.Router();
const placementController = require("../controllers/placementController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// GET routes
router.get("/", placementController.getAllPlacements);
router.get("/stats", placementController.getPlacementStats);
router.get("/years", placementController.getAvailableYears);
router.get("/companies", placementController.getAvailableCompanies);
router.get("/department/:dept", placementController.getDepartmentPlacements);

// POST routes (admin/faculty only - can add role check middleware)
router.post("/", placementController.createPlacementRecord);

module.exports = router;
