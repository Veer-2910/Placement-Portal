const express = require("express");
const router = express.Router();
const employerStudentController = require("../controllers/employerStudentController");
const { verifyEmployerToken } = require("../middleware/employerAuth");

// All routes require authentication
router.use(verifyEmployerToken);

// ==================== STUDENT BROWSING ====================
router.get("/", employerStudentController.browseStudents);
router.get("/export", employerStudentController.exportApplicants); // NEW: Export applicants
router.get("/:studentId", employerStudentController.getStudentProfile);

// ==================== INTERVIEW SCHEDULING ====================
router.post("/applications/:applicationId/schedule-interview", employerStudentController.scheduleInterview);
router.put("/applications/:applicationId/interviews/:interviewId", employerStudentController.updateInterviewStatus);

// ==================== TEST RESULTS ====================
router.post("/applications/:applicationId/test-result", employerStudentController.addTestResult);

// ==================== FEEDBACK ====================
router.post("/applications/:applicationId/feedback", employerStudentController.submitFeedback);
router.get("/applications/:applicationId/feedback", employerStudentController.getFeedback);

module.exports = router;
