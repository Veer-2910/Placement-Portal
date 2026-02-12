const AptitudeResult = require("../models/AptitudeResult");
const StageProgress = require("../models/StageProgress");
const DriveStage = require("../models/DriveStage");
const Application = require("../models/Application");
const Drive = require("../models/Drive");
const Student = require("../models/Student");
const ResultPublication = require("../models/ResultPublication");
const AuditLog = require("../models/AuditLog");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const fs = require("fs");

// Helper function to create audit log
const createAuditLog = async (action, performedBy, performerModel, drive, stage, affectedStudents, details, req) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      performerModel,
      drive,
      stage,
      affectedStudents,
      affectedCount: affectedStudents?.length || 0,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
      success: true,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

// Upload CSV/Excel for aptitude results
exports.uploadResults = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { stageId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Verify drive exists and user has permission
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    // Check if user is employer who posted the drive
    if (req.user.role === "employer" && drive.postedByEmployer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. You can only upload results for your own drives." });
    }

    // Verify stage exists and belongs to drive
    const stage = await DriveStage.findOne({ _id: stageId, drive: driveId });
    if (!stage) {
      return res.status(404).json({ message: "Stage not found for this drive" });
    }

    // Parse CSV/Excel file
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    let results = [];

    if (fileExtension === "csv") {
      // Parse CSV
      const fileContent = fs.readFileSync(file.path, "utf8");
      const lines = fileContent.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: "CSV file is empty or has no data rows" });
      }

      // Parse header
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const studentIdIndex = headers.findIndex(h => h.includes("student") && h.includes("id"));
      const marksIndex = headers.findIndex(h => h.includes("marks") || h.includes("score"));
      
      if (studentIdIndex === -1 || marksIndex === -1) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ 
          message: "Invalid CSV format. Required columns: Student ID, Marks Obtained" 
        });
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        if (values.length > 1) {
          results.push({
            studentId: values[studentIdIndex],
            marksObtained: parseFloat(values[marksIndex]) || 0,
          });
        }
      }
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Parse Excel
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      results = data.map(row => ({
        studentId: row["Student ID"] || row["student_id"] || row["StudentID"],
        marksObtained: parseFloat(row["Marks Obtained"] || row["Marks"] || row["Score"] || 0),
      }));
    } else {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Invalid file format. Only CSV and Excel files are supported." });
    }

    // Delete uploaded file
    fs.unlinkSync(file.path);

    if (results.length === 0) {
      return res.status(400).json({ message: "No valid data found in file" });
    }

    // Validate and process results
    const processedResults = [];
    const errors = [];
    const affectedStudents = [];

    for (const row of results) {
      // Find student
      const student = await Student.findOne({ studentId: row.studentId });
      if (!student) {
        errors.push(`Student ID ${row.studentId} not found`);
        continue;
      }

      // Check if student applied to this drive
      const application = await Application.findOne({ drive: driveId, student: student._id });
      if (!application) {
        errors.push(`Student ${row.studentId} has not applied to this drive`);
        continue;
      }

      // Create or update result
      const totalMarks = stage.cutoffCriteria?.totalMarks || 100;
      const percentage = (row.marksObtained / totalMarks) * 100;
      const cutoffValue = stage.cutoffCriteria?.value || 0;
      
      let status = "Pending";
      if (stage.cutoffCriteria?.type === "percentage") {
        status = percentage >= cutoffValue ? "Qualified" : "Not Qualified";
      } else if (stage.cutoffCriteria?.type === "marks") {
        status = row.marksObtained >= cutoffValue ? "Qualified" : "Not Qualified";
      }

      const resultData = {
        drive: driveId,
        student: student._id,
        application: application._id,
        stage: stageId,
        marksObtained: row.marksObtained,
        totalMarks,
        percentage,
        status,
        evaluatedBy: req.user.id,
        evaluatorModel: req.user.role === "employer" ? "Employer" : req.user.role === "faculty" ? "Faculty" : "Admin",
        evaluatedAt: new Date(),
        uploadMethod: fileExtension === "csv" ? "CSV" : "Excel",
        published: false,
        originalData: row,
      };

      // Check if result already exists
      const existingResult = await AptitudeResult.findOne({
        drive: driveId,
        student: student._id,
        stage: stageId,
      });

      if (existingResult) {
        // Update existing result
        Object.assign(existingResult, resultData);
        await existingResult.save();
      } else {
        // Create new result
        await AptitudeResult.create(resultData);
      }

      // AUTO-SHORTLIST: Update Application status based on result
      if (status === "Qualified") {
        await Application.findByIdAndUpdate(application._id, { 
          status: "Shortlisted"
        });
      } else if (status === "Not Qualified") {
        await Application.findByIdAndUpdate(application._id, { 
          status: "Rejected"
        });
      }

      processedResults.push({
        studentId: row.studentId,
        studentName: student.fullName,
        marksObtained: row.marksObtained,
        totalMarks,
        percentage: percentage.toFixed(2),
        status,
        applicationStatus: status === "Qualified" ? "Shortlisted" : status === "Not Qualified" ? "Rejected" : "Applied"
      });

      affectedStudents.push(student._id);
    }

    // Create audit log
    await createAuditLog(
      "Bulk Upload",
      req.user.id,
      req.user.role === "employer" ? "Employer" : req.user.role === "faculty" ? "Faculty" : "Admin",
      driveId,
      stageId,
      affectedStudents,
      {
        fileName: file.originalname,
        totalRows: results.length,
        processedRows: processedResults.length,
        errors: errors.length,
      },
      req
    );

    res.status(200).json({
      message: "Results uploaded successfully",
      processedCount: processedResults.length,
      totalCount: results.length,
      results: processedResults,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error uploading results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Manual entry for individual result
exports.manualEntry = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { stageId, studentId, marksObtained, remarks } = req.body;

    // Verify drive exists
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    // Check if user is employer who posted the drive
    if (req.user.role === "employer" && drive.postedByEmployer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Verify stage
    const stage = await DriveStage.findOne({ _id: stageId, drive: driveId });
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    // Find student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check application
    const application = await Application.findOne({ drive: driveId, student: student._id });
    if (!application) {
      return res.status(400).json({ message: "Student has not applied to this drive" });
    }

    // Calculate result
    const totalMarks = stage.cutoffCriteria?.totalMarks || 100;
    const percentage = (marksObtained / totalMarks) * 100;
    const cutoffValue = stage.cutoffCriteria?.value || 0;
    
    let status = "Pending";
    if (stage.cutoffCriteria?.type === "percentage") {
      status = percentage >= cutoffValue ? "Qualified" : "Not Qualified";
    } else if (stage.cutoffCriteria?.type === "marks") {
      status = marksObtained >= cutoffValue ? "Qualified" : "Not Qualified";
    }

    // Create or update result
    let result = await AptitudeResult.findOne({ drive: driveId, student: student._id, stage: stageId });
    
    if (result) {
      // Update
      result.marksObtained = marksObtained;
      result.totalMarks = totalMarks;
      result.percentage = percentage;
      result.status = status;
      result.remarks = remarks;
      result.evaluatedBy = req.user.id;
      result.evaluatorModel = req.user.role === "employer" ? "Employer" : req.user.role === "faculty" ? "Faculty" : "Admin";
      result.evaluatedAt = new Date();
      result.uploadMethod = "Manual";
      await result.save();
    } else {
      // Create
      result = await AptitudeResult.create({
        drive: driveId,
        student: student._id,
        application: application._id,
        stage: stageId,
        marksObtained,
        totalMarks,
        percentage,
        status,
        remarks,
        evaluatedBy: req.user.id,
        evaluatorModel: req.user.role === "employer" ? "Employer" : req.user.role === "faculty" ? "Faculty" : "Admin",
        evaluatedAt: new Date(),
        uploadMethod: "Manual",
        published: false,
      });
    }

    // Create audit log
    await createAuditLog(
      "Manual Entry",
      req.user.id,
      req.user.role === "employer" ? "Employer" : "Faculty",
      driveId,
      stageId,
      [student._id],
      { studentId, marksObtained, status },
      req
    );

    res.status(200).json({
      message: "Result saved successfully",
      result: {
        studentId,
        studentName: student.fullName,
        marksObtained,
        totalMarks,
        percentage: percentage.toFixed(2),
        status,
      },
    });
  } catch (error) {
    console.error("Error in manual entry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Preview results before publishing
exports.previewResults = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { stageId } = req.query;

    if (!stageId) {
      return res.status(400).json({ message: "Stage ID is required" });
    }

    // Verify access
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    if (req.user.role === "employer" && drive.postedByEmployer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all results for this stage
    const results = await AptitudeResult.find({ drive: driveId, stage: stageId })
      .populate("student", "fullName studentId branch universityEmail")
      .sort({ percentage: -1 });

    // Calculate statistics
    const totalStudents = results.length;
    const qualified = results.filter(r => r.status === "Qualified").length;
    const notQualified = results.filter(r => r.status === "Not Qualified").length;
    const pending = results.filter(r => r.status === "Pending").length;

    const marks = results.map(r => r.marksObtained);
    const averageMarks = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
    const highestMarks = marks.length > 0 ? Math.max(...marks) : 0;
    const lowestMarks = marks.length > 0 ? Math.min(...marks) : 0;

    const stage = await DriveStage.findById(stageId);

    res.status(200).json({
      statistics: {
        totalStudents,
        qualified,
        notQualified,
        pending,
        cutoffPercentage: stage.cutoffCriteria?.value || 0,
        averageMarks: averageMarks.toFixed(2),
        highestMarks,
        lowestMarks,
      },
      results: results.map(r => ({
        id: r._id,
        studentId: r.student.studentId,
        studentName: r.student.fullName,
        branch: r.student.branch,
        email: r.student.universityEmail,
        marksObtained: r.marksObtained,
        totalMarks: r.totalMarks,
        percentage: r.percentage.toFixed(2),
        status: r.status,
        remarks: r.remarks,
        published: r.published,
      })),
    });
  } catch (error) {
    console.error("Error previewing results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Publish results to students
exports.publishResults = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { stageId, remarks } = req.body;

    if (!stageId) {
      return res.status(400).json({ message: "Stage ID is required" });
    }

    // Verify access
    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    if (req.user.role === "employer" && drive.postedByEmployer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const stage = await DriveStage.findById(stageId);
    if (!stage) {
      return res.status(404).json({ message: "Stage not found" });
    }

    // Mark all results as published
    const results = await AptitudeResult.find({ drive: driveId, stage: stageId });
    
    if (results.length === 0) {
      return res.status(400).json({ message: "No results found to publish" });
    }

    const publishedAt = new Date();
    const affectedStudents = [];

    for (const result of results) {
      result.published = true;
      result.publishedAt = publishedAt;
      await result.save();
      affectedStudents.push(result.student);

      // Auto-progress qualified students to next stage
      if (result.status === "Qualified") {
        await autoProgressStudent(result, drive, stage);
      } else if (result.status === "Not Qualified") {
        await eliminateStudent(result, drive, stage);
      }
    }

    // Calculate statistics
    const qualified = results.filter(r => r.status === "Qualified").length;
    const notQualified = results.filter(r => r.status === "Not Qualified").length;
    const marks = results.map(r => r.marksObtained);
    const averageMarks = marks.reduce((a, b) => a + b, 0) / marks.length;

    // Create or update publication record
    await ResultPublication.findOneAndUpdate(
      { drive: driveId, stage: stageId },
      {
        drive: driveId,
        stage: stageId,
        publishedBy: req.user.id,
        publisherModel: req.user.role === "employer" ? "Employer" : "Faculty",
        publishedAt,
        isPublished: true,
        previewData: {
          totalStudents: results.length,
          qualified,
          notQualified,
          pending: 0,
          cutoffPercentage: stage.cutoffCriteria?.value || 0,
          averageMarks,
          highestMarks: Math.max(...marks),
          lowestMarks: Math.min(...marks),
        },
        remarks,
        notificationsSent: false,
      },
      { upsert: true, new: true }
    );

    // Create audit log
    await createAuditLog(
      "Result Published",
      req.user.id,
      req.user.role === "employer" ? "Employer" : "Faculty",
      driveId,
      stageId,
      affectedStudents,
      { qualified, notQualified, totalPublished: results.length },
      req
    );

    // TODO: Send notifications to students
    // This will be implemented in the notification helper

    res.status(200).json({
      message: "Results published successfully",
      published: results.length,
      qualified,
      notQualified,
    });
  } catch (error) {
    console.error("Error publishing results:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Student views own result
exports.getMyResult = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { stageId } = req.query;

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Students only." });
    }

    // Check if student applied to this drive
    const application = await Application.findOne({ drive: driveId, student: req.user.id });
    if (!application) {
      return res.status(403).json({ message: "You have not applied to this drive" });
    }

    // Get result (only if published)
    const result = await AptitudeResult.findOne({
      drive: driveId,
      student: req.user.id,
      stage: stageId,
      published: true,
    }).populate("stage", "stageName stageType cutoffCriteria");

    if (!result) {
      return res.status(404).json({ message: "Result not yet published or not found" });
    }

    // Get stage progress for next steps
    const stageProgress = await StageProgress.findOne({ drive: driveId, student: req.user.id })
      .populate("currentStage", "stageName stageType scheduledDate location");

    res.status(200).json({
      result: {
        marksObtained: result.marksObtained,
        totalMarks: result.totalMarks,
        percentage: result.percentage.toFixed(2),
        status: result.status,
        stageName: result.stage.stageName,
        cutoff: result.stage.cutoffCriteria?.value || "N/A",
        cutoffType: result.stage.cutoffCriteria?.type || "N/A",
        publishedAt: result.publishedAt,
      },
      nextStage: result.status === "Qualified" && stageProgress?.currentStage ? {
        stageName: stageProgress.currentStage.stageName,
        stageType: stageProgress.currentStage.stageType,
        scheduledDate: stageProgress.currentStage.scheduledDate,
        location: stageProgress.currentStage.location,
      } : null,
      message: result.status === "Qualified" 
        ? "Congratulations! You have qualified for the next round." 
        : "Unfortunately, you did not qualify for the next round.",
    });
  } catch (error) {
    console.error("Error fetching student result:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper: Auto-progress qualified students
async function autoProgressStudent(result, drive, currentStage) {
  try {
    // Get next stage
    const allStages = await DriveStage.find({ drive: drive._id }).sort({ order: 1 });
    const currentIndex = allStages.findIndex(s => s._id.toString() === currentStage._id.toString());
    const nextStage = allStages[currentIndex + 1];

    if (!nextStage) {
      // No more stages - mark as selected
      let progress = await StageProgress.findOne({ drive: drive._id, student: result.student });
      if (progress) {
        await progress.selectStudent();
      }
      return;
    }

    // Get or create stage progress
    let progress = await StageProgress.findOne({ drive: drive._id, student: result.student });
    
    if (!progress) {
      // Create initial progress
      progress = await StageProgress.create({
        drive: drive._id,
        student: result.student,
        application: result.application,
        currentStage: nextStage._id,
        currentStageOrder: nextStage.order,
        stageHistory: [{
          stage: currentStage._id,
          stageName: currentStage.stageName,
          enteredAt: result.evaluatedAt || new Date(),
          exitedAt: new Date(),
          status: "Passed",
          result: result._id,
        }, {
          stage: nextStage._id,
          stageName: nextStage.stageName,
          enteredAt: new Date(),
          status: "In Progress",
        }],
        overallStatus: "Active",
      });
    } else {
      // Progress to next stage
      await progress.progressToStage(nextStage, nextStage.order, "Passed");
    }

    // Create audit log
    await AuditLog.create({
      action: "Stage Progression",
      performedBy: result.evaluatedBy,
      performerModel: result.evaluatorModel,
      drive: drive._id,
      stage: nextStage._id,
      affectedStudents: [result.student],
      affectedCount: 1,
      details: {
        from: currentStage.stageName,
        to: nextStage.stageName,
        reason: "Qualified in " + currentStage.stageName,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error auto-progressing student:", error);
  }
}

// Helper: Eliminate student who failed
async function eliminateStudent(result, drive, currentStage) {
  try {
    let progress = await StageProgress.findOne({ drive: drive._id, student: result.student });
    
    if (!progress) {
      // Create eliminated progress
      progress = await StageProgress.create({
        drive: drive._id,
        student: result.student,
        application: result.application,
        currentStage: currentStage._id,
        currentStageOrder: currentStage.order,
        stageHistory: [{
          stage: currentStage._id,
          stageName: currentStage.stageName,
          enteredAt: result.evaluatedAt || new Date(),
          exitedAt: new Date(),
          status: "Failed",
          result: result._id,
        }],
        overallStatus: "Eliminated",
        eliminatedAt: new Date(),
        eliminatedReason: `Did not qualify in ${currentStage.stageName}`,
      });
    } else {
      await progress.eliminate(`Did not qualify in ${currentStage.stageName}`);
    }
  } catch (error) {
    console.error("Error eliminating student:", error);
  }
}

module.exports = exports;
