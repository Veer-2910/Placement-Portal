const express = require("express");
const router = express.Router();
const employerStudentController = require("../controllers/employerStudentController");
const { verifyEmployerToken } = require("../middleware/employerAuth");

// All routes require authentication
router.use(verifyEmployerToken);

// ==================== STUDENT BROWSING ====================
router.get("/", employerStudentController.browseStudents);
router.get("/export", employerStudentController.exportApplicants);

// ==================== INTERVIEW SCHEDULING ====================
// NOTE: /interviews MUST be before /:studentId to avoid route conflict
router.get("/interviews", employerStudentController.getAllInterviews);
router.post("/applications/:applicationId/schedule-interview", employerStudentController.scheduleInterview);
router.put("/applications/:applicationId/interviews/:interviewId", employerStudentController.updateInterviewStatus);

// ==================== STUDENT PROFILE (must be after specific routes) ====================
router.get("/:studentId", employerStudentController.getStudentProfile);

// ==================== TEST RESULTS ====================
router.post("/applications/:applicationId/test-result", employerStudentController.addTestResult);

// ==================== FEEDBACK ====================
router.post("/applications/:applicationId/feedback", employerStudentController.submitFeedback);
router.get("/applications/:applicationId/feedback", employerStudentController.getFeedback);

module.exports = router;
