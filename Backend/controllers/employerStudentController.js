const Student = require("../models/Student");
const Application = require("../models/Application");
const Drive = require("../models/Drive");

// ==================== STUDENT BROWSING ====================

// Browse students with filters (limited data)
exports.browseStudents = async (req, res) => {
  try {
    const {
      branch,
      minCgpa,
      maxCgpa,
      skills,
      yearOfEnrollment,
      status,
      applicationStatus, // NEW: filter by application status
      page = 1,
      limit = 20
    } = req.query;

    // 1. Get all drives posted by this employer
    const employerDrives = await Drive.find({ postedByEmployer: req.employerId }).select("_id");
    const driveIds = employerDrives.map(d => d._id);

    if (driveIds.length === 0) {
      // Employer has no drives, return empty
      return res.json({
        success: true,
        count: 0,
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        students: []
      });
    }

    // 2. Get applications for those drives (with optional status filter)
    const appQuery = { drive: { $in: driveIds } };
    if (applicationStatus) {
      appQuery.status = applicationStatus;
    }

    const applications = await Application.find(appQuery)
      .populate("drive", "companyName title")
      .sort({ createdAt: -1 });

    if (applications.length === 0) {
      // No applications yet
      return res.json({
        success: true,
        count: 0,
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        students: []
      });
    }

    // 3. Extract student IDs and map application info
    const studentIds = [...new Set(applications.map(app => app.student))]; // unique student IDs
    const studentApplicationMap = {}; // Map student ID to their application info
    
    applications.forEach(app => {
      const studentId = app.student.toString();
      if (!studentApplicationMap[studentId]) {
        studentApplicationMap[studentId] = {
          status: app.status,
          appliedDate: app.createdAt,
          driveName: app.drive.title || app.drive.companyName,
          driveId: app.drive._id
        };
      }
    });

    // 4. Build filter with only applicant student IDs
    const filter = { _id: { $in: studentIds } };

    // 5. Apply additional filters
    if (branch) {
      filter.branch = branch;
    }

    if (minCgpa || maxCgpa) {
      filter.cgpa = {};
      if (minCgpa) filter.cgpa.$gte = parseFloat(minCgpa);
      if (maxCgpa) filter.cgpa.$lte = parseFloat(maxCgpa);
    }

    if (skills) {
      const skillArray = skills.split(",").map(s => s.trim());
      filter.skills = { $in: skillArray };
    }

    if (yearOfEnrollment) {
      filter.yearOfEnrollment = parseInt(yearOfEnrollment);
    }

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 6. Query students with LIMITED data for privacy
    const students = await Student.find(filter)
      .select("fullName branch cgpa yearOfEnrollment academicYear semester enrollmentNumber skills status profilePicture")
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ cgpa: -1 });

    // 7. Attach application info to each student
    const studentsWithAppInfo = students.map(student => {
      const studentObj = student.toObject();
      studentObj.applicationInfo = studentApplicationMap[student._id.toString()];
      return studentObj;
    });

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      count: studentsWithAppInfo.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      students: studentsWithAppInfo
    });
  } catch (error) {
    console.error("Browse students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students"
    });
  }
};

// Get student profile (full data only if student has applied)
exports.getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if student has applied to any of employer's jobs
    const employerJobs = await Drive.find({ postedByEmployer: req.employerId }).select("_id");
    const jobIds = employerJobs.map(job => job._id);

    const hasApplied = await Application.findOne({
      student: studentId,
      drive: { $in: jobIds }
    });

    let student;

    if (hasApplied) {
      // Full profile access
      student = await Student.findById(studentId).select("-password");
    } else {
      // Limited profile access
      student = await Student.findById(studentId)
        .select("fullName branch cgpa yearOfEnrollment skills status profilePicture");
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      student,
      fullAccess: !!hasApplied
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile"
    });
  }
};

// ==================== INTERVIEW SCHEDULING ====================

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { round, type, scheduledDate, duration, mode, location, interviewers } = req.body;

    const application = await Application.findById(applicationId)
      .populate("drive")
      .populate("student", "fullName universityEmail"); // Populate student for email

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Verify job belongs to employer
    if (application.drive.postedByEmployer.toString() !== req.employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Add interview to application
    application.interviews.push({
      round,
      type,
      scheduledDate,
      duration,
      mode,
      location,
      interviewers,
      status: "Scheduled"
    });

    await application.save();

    // Send email notification
    if (application.student && application.student.universityEmail) {
       const interviewDetails = {
         company: application.drive.companyName || "Company",
         role: application.drive.title || "Job Role",
         round: round || 1,
         type: type || "Interview",
         date: new Date(scheduledDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
         time: new Date(scheduledDate).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
         mode: mode || "Online",
         location: location || "TBD",
         duration: duration || 60
       };
       
       // Send email asynchronously (don't block response)
       const { sendInterviewDetails } = require("../utils/emailService");
       sendInterviewDetails(application.student.universityEmail, interviewDetails).catch(err => console.error("Email send failed:", err));
    }

    res.json({
      success: true,
      message: "Interview scheduled successfully and notification sent",
      application
    });
  } catch (error) {
    console.error("Schedule interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview"
    });
  }
};

// Update interview status
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { applicationId, interviewId } = req.params;
    const { status, feedback, result } = req.body;

    const application = await Application.findById(applicationId).populate("drive");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Verify job belongs to employer
    if (application.drive.postedByEmployer.toString() !== req.employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const interview = application.interviews.id(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found"
      });
    }

    if (status) interview.status = status;
    if (feedback) interview.feedback = feedback;
    if (result) interview.result = result;

    await application.save();

    res.json({
      success: true,
      message: "Interview updated successfully",
      application
    });
  } catch (error) {
    console.error("Update interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update interview"
    });
  }
};

// ==================== TEST RESULTS ====================

// Add test result
exports.addTestResult = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { testName, testType, conductedDate, score, maxScore, percentile, passed, feedback } = req.body;

    const application = await Application.findById(applicationId).populate("drive");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Verify job belongs to employer
    if (application.drive.postedByEmployer.toString() !== req.employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    application.testResults.push({
      testName,
      testType,
      conductedDate,
      score,
      maxScore,
      percentile,
      passed,
      feedback
    });

    await application.save();

    res.json({
      success: true,
      message: "Test result added successfully",
      application
    });
  } catch (error) {
    console.error("Add test result error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add test result"
    });
  }
};

// ==================== FEEDBACK ====================

// Submit comprehensive feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const {
      ratings,
      detailedComments,
      strengths,
      areasForImprovement,
      skillGaps,
      industryExpectations,
      marketReadiness,
      recommendation
    } = req.body;

    const application = await Application.findById(applicationId).populate("drive");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Verify job belongs to employer
    if (application.drive.postedByEmployer.toString() !== req.employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Add employer feedback
    application.employerFeedback = {
      reviewer: req.employerId,
      ratings,
      detailedComments,
      strengths,
      areasForImprovement,
      skillGaps,
      industryExpectations,
      marketReadiness,
      recommendation,
      reviewedAt: new Date()
    };

    await application.save();

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      application
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback"
    });
  }
};

// Get feedback for an application
exports.getFeedback = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate("drive")
      .populate("student", "fullName universityEmail branch cgpa");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Verify job belongs to employer
    if (application.drive.postedByEmployer.toString() !== req.employerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    res.json({
      success: true,
      feedback: application.employerFeedback,
      student: application.student,
      drive: application.drive
    });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback"
    });
  }
};

// ==================== EXPORT APPLICANTS ====================

// Export applicants data as CSV
exports.exportApplicants = async (req, res) => {
  try {
    const { driveId, status } = req.query;

    // 1. Get employer's drives (optionally filter by driveId)
    const driveQuery = { postedByEmployer: req.employerId };
    if (driveId) {
      driveQuery._id = driveId;
    }
    const drives = await Drive.find(driveQuery).select("_id");
    const driveIds = drives.map(d => d._id);

    if (driveIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No drives found"
      });
    }

    // 2. Get applications (optionally filter by status)
    const appQuery = { drive: { $in: driveIds } };
    if (status) {
      appQuery.status = status;
    }

    const applications = await Application.find(appQuery)
      .populate("student")
      .populate("drive", "title companyName")
      .sort({ createdAt: -1 });

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applicants found"
      });
    }

    // 3. Format as CSV
    const csvHeader = "Name,Email,Phone,Branch,CGPA,Year of Enrollment,Skills,Application Status,Applied Date,Drive Name\n";
    
    const csvRows = applications.map(app => {
      const student = app.student;
      return [
        `"${student.fullName || ''}"`,
        `"${student.universityEmail || ''}"`,
        `"${student.phone || ''}"`,
        `"${student.branch || ''}"`,
        student.cgpa || '',
        student.yearOfEnrollment || '',
        `"${student.skills?.join(', ') || ''}"`,
        `"${app.status || ''}"`,
        new Date(app.createdAt).toLocaleDateString(),
        `"${app.drive.title || app.drive.companyName || ''}"`
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    // 4. Send as downloadable file
    const filename = status 
      ? `applicants_${status.toLowerCase()}_${Date.now()}.csv`
      : `applicants_all_${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error("Export applicants error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export applicants"
    });
  }
};

// ==================== GET ALL INTERVIEWS ====================

// Get all interviews across all employer's drives
exports.getAllInterviews = async (req, res) => {
  try {
    // 1. Get all drives posted by this employer
    const employerDrives = await Drive.find({ postedByEmployer: req.employerId }).select("_id title companyName");
    const driveIds = employerDrives.map(d => d._id);

    if (driveIds.length === 0) {
      return res.json({
        success: true,
        interviews: []
      });
    }

    // 2. Get all applications that have interviews
    const applications = await Application.find({
      drive: { $in: driveIds },
      "interviews.0": { $exists: true }
    })
      .populate("student", "fullName universityEmail branch cgpa profilePicture enrollmentNumber")
      .populate("drive", "title companyName")
      .sort({ updatedAt: -1 });

    // 3. Flatten interviews with their application/student context
    const allInterviews = [];
    applications.forEach(app => {
      app.interviews.forEach(interview => {
        allInterviews.push({
          interviewId: interview._id,
          applicationId: app._id,
          applicationStatus: app.status,
          round: interview.round,
          type: interview.type,
          scheduledDate: interview.scheduledDate,
          duration: interview.duration,
          mode: interview.mode,
          location: interview.location,
          interviewers: interview.interviewers,
          status: interview.status,
          feedback: interview.feedback,
          result: interview.result,
          student: app.student,
          drive: app.drive,
        });
      });
    });

    // Sort by scheduled date (upcoming first)
    allInterviews.sort((a, b) => {
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return new Date(a.scheduledDate) - new Date(b.scheduledDate);
    });

    res.json({
      success: true,
      count: allInterviews.length,
      interviews: allInterviews
    });
  } catch (error) {
    console.error("Get all interviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews"
    });
  }
};

module.exports = exports;
