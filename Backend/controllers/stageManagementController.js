const StageProgress = require("../models/StageProgress");
const DriveStage = require("../models/DriveStage");
const Drive = require("../models/Drive");
const Application = require("../models/Application");

// Get all stages for a drive
exports.getStages = async (req, res) => {
  try {
    const { driveId } = req.params;

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    const stages = await DriveStage.find({ drive: driveId }).sort({ order: 1 });

    res.status(200).json({ stages });
  } catch (error) {
    console.error("Error fetching stages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get student's stage progress
exports.getStudentProgress = async (req, res) => {
  try {
    const { driveId, studentId } = req.params;

    // Students can only view their own progress
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const progress = await StageProgress.findOne({ drive: driveId, student: studentId })
      .populate("currentStage", "stageName stageType scheduledDate location order")
      .populate("stageHistory.stage", "stageName stageType order");

    if (!progress) {
      return res.status(404).json({ message: "No progress found for this student" });
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all students' progress for a drive (Employer/Faculty/Admin only) 
exports.getAllStudentsProgress = async (req, res) => {
  try {
    const { driveId } = req.params;

    if (req.user.role === "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    // Check employer access
    if (req.user.role === "employer" && drive.postedByEmployer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const progressList = await StageProgress.find({ drive: driveId })
      .populate("student", "fullName studentId branch universityEmail")
      .populate("currentStage", "stageName stageType order")
      .sort({ currentStageOrder: -1, createdAt: 1 });

    // Group by stage for easier frontend rendering
    const stages = await DriveStage.find({ drive: driveId }).sort({ order: 1 });
    
    const groupedByStage = stages.map(stage => ({
      stage: {
        id: stage._id,
        name: stage.stageName,
        type: stage.stageType,
        order: stage.order,
      },
      students: progressList.filter(p => 
        p.currentStage && p.currentStage._id.toString() === stage._id.toString()
      ).map(p => ({
        studentId: p.student.studentId,
        studentName: p.student.fullName,
        branch: p.student.branch,
        overallStatus: p.overallStatus,
        stageHistory: p.stageHistory,
      })),
    }));

    // Also include eliminated and selected students
    const eliminated = progressList.filter(p => p.overallStatus === "Eliminated");
    const selected = progressList.filter(p => p.overallStatus === "Selected");

    res.status(200).json({
      total: progressList.length,
      active: progressList.filter(p => p.overallStatus === "Active").length,
      eliminated: eliminated.length,
      selected: selected.length,
      groupedByStage,
      eliminatedStudents: eliminated.map(p => ({
        studentId: p.student.studentId,
        studentName: p.student.fullName,
        eliminatedAt: p.eliminatedAt,
        eliminatedReason: p.eliminatedReason,
      })),
      selectedStudents: selected.map(p => ({
        studentId: p.student.studentId,
        studentName: p.student.fullName,
        selectedAt: p.selectedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching all students progress:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Manually progress students to a specific stage (Admin/Employer only)
exports.manualProgressStudents = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { studentIds, targetStageId, reason } = req.body;

    if (req.user.role === "student" || req.user.role === "faculty") {
      return res.status(403).json({ message: "Access denied. Only employers and admins can manually progress students." });
    }

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    if (req.user.role === "employer" && drive.postedByEmployer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const targetStage = await DriveStage.findById(targetStageId);
    if (!targetStage || targetStage.drive.toString() !== driveId) {
      return res.status(404).json({ message: "Target stage not found" });
    }

    const updated = [];
    const errors = [];

    for (const studentId of studentIds) {
      try {
        const progress = await StageProgress.findOne({ drive: driveId, student: studentId });
        if (!progress) {
          errors.push(`No progress found for student ${studentId}`);
          continue;
        }

        await progress.progressToStage(targetStage, targetStage.order, "Passed");
        updated.push(studentId);
      } catch (error) {
        errors.push(`Failed to progress student ${studentId}: ${error.message}`);
      }
    }

    res.status(200).json({
      message: "Progress updated",
      updated: updated.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in manual progression:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = exports;
