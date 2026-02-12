const express = require("express");
const router = express.Router();
const employerJobController = require("../controllers/employerJobController");
const { verifyEmployerToken } = require("../middleware/employerAuth");

// All routes require authentication
router.use(verifyEmployerToken);

// ==================== JOB POSTING ====================
router.post("/", employerJobController.createJob);
router.get("/", employerJobController.getMyJobs);
router.get("/:id", employerJobController.getJobById);
router.put("/:id", employerJobController.updateJob);
router.delete("/:id", employerJobController.deleteJob);

// ==================== APPLICANT MANAGEMENT ====================
router.get("/:jobId/applicants", employerJobController.getApplicants);
router.post("/applications/:applicationId/shortlist", employerJobController.shortlistApplicant);
router.post("/applications/:applicationId/reject", employerJobController.rejectApplicant);
router.post("/applications/:applicationId/select", employerJobController.selectApplicant);

module.exports = router;
