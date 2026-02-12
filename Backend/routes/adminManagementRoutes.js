const express = require("express");
const router = express.Router();
const adminManagementController = require("../controllers/adminManagementController");
const { verifyAdminToken, checkPermission } = require("../middleware/adminAuth");

// All routes require admin authentication
router.use(verifyAdminToken);

// ==================== EMPLOYER MANAGEMENT ====================
router.get("/employers/pending", 
  checkPermission("verify_employers"),
  adminManagementController.getPendingEmployers
);

router.post("/employers/:id/verify",
  checkPermission("verify_employers"),
  adminManagementController.verifyEmployer
);

router.post("/employers/:id/reject",
  checkPermission("verify_employers"),
  adminManagementController.rejectEmployer
);

router.get("/employers",
  checkPermission("verify_employers"),
  adminManagementController.getAllEmployers
);

router.get("/employers/:id",
  checkPermission("verify_employers"),
  adminManagementController.getEmployerDetails
);

router.put("/employers/:id/deactivate",
  checkPermission("verify_employers"),
  adminManagementController.deactivateEmployer
);

// ==================== JOB APPROVAL ====================
router.get("/jobs/pending",
  checkPermission("approve_jobs"),
  adminManagementController.getPendingJobs
);

router.post("/jobs/:id/approve",
  checkPermission("approve_jobs"),
  adminManagementController.approveJob
);

router.post("/jobs/:id/reject",
  checkPermission("approve_jobs"),
  adminManagementController.rejectJob
);

router.get("/jobs",
  checkPermission("approve_jobs"),
  adminManagementController.getAllJobs
);

router.put("/jobs/:id/deactivate",
  checkPermission("approve_jobs"),
  adminManagementController.deactivateJob
);

// ==================== SYSTEM ANALYTICS ====================
router.get("/stats/system",
  checkPermission("view_analytics"),
  adminManagementController.getSystemStats
);

router.get("/stats/placements",
  checkPermission("view_analytics"),
  adminManagementController.getPlacementStats
);

module.exports = router;
