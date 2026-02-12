const Drive = require("../models/Drive");
const Application = require("../models/Application");
const Employer = require("../models/Employer");

// ==================== JOB POSTING ====================

// Create new job posting
exports.createJob = async (req, res) => {
  try {
    const {
      driveId,
      companyName,
      title,
      jobRole,
      ctc,
      startDate,
      endDate,
      location,
      eligibility,
      requirements,
      process,
      description,
      aboutCompany,
      contactEmail,
      requiredSkills,
      preferredSkills,
      jobType,
      workMode
    } = req.body;

    // Validate required fields
    if (!driveId || !companyName || !title || !startDate || !endDate || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if driveId already exists
    const existingDrive = await Drive.findOne({ driveId });
    if (existingDrive) {
      return res.status(400).json({
        success: false,
        message: "A job with this ID already exists"
      });
    }

    // Create new job posting
    const drive = new Drive({
      driveId,
      companyName,
      title,
      jobRole,
      ctc,
      startDate,
      endDate,
      location,
      eligibility,
      requirements,
      process,
      description,
      aboutCompany,
      contactEmail,
      requiredSkills,
      preferredSkills,
      jobType,
      workMode,
      postedByEmployer: req.employerId,
      approvalStatus: "Pending", // Requires faculty approval
      active: false // Will be activated after approval
    });

    await drive.save();

    // Update employer stats
    await Employer.findByIdAndUpdate(req.employerId, {
      $inc: { "stats.totalJobsPosted": 1 }
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully! Waiting for admin approval.",
      drive
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job posting"
    });
  }
};

// Get all jobs posted by employer
exports.getMyJobs = async (req, res) => {
  try {
    const { status, active } = req.query;

    const filter = { postedByEmployer: req.employerId };

    if (status) {
      filter.approvalStatus = status;
    }

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const jobs = await Drive.find(filter)
      .sort({ createdAt: -1 })
      .populate("approvedBy", "fullName email");

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("Get employer jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs"
    });
  }
};

// Get specific job details
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Drive.findOne({
      _id: id,
      postedByEmployer: req.employerId
    }).populate("approvedBy", "fullName email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Get application statistics
    const totalApplications = await Application.countDocuments({ drive: job._id });
    const statusBreakdown = await Application.aggregate([
      { $match: { drive: job._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      job,
      applicationStats: {
        total: totalApplications,
        breakdown: statusBreakdown
      }
    });
  } catch (error) {
    console.error("Get job by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job details"
    });
  }
};

// Update job posting
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find job
    const job = await Drive.findOne({
      _id: id,
      postedByEmployer: req.employerId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Don't allow updates to approved jobs without re-approval
    if (job.approvalStatus === "Approved") {
      updates.approvalStatus = "Pending";
      updates.active = false;
    }

    // Fields that cannot be updated
    const restrictedFields = ["postedByEmployer", "postedBy", "approvedBy", "approvedAt"];
    restrictedFields.forEach(field => delete updates[field]);

    const updatedJob = await Drive.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: job.approvalStatus === "Approved" 
        ? "Job updated. Requires re-approval from admin." 
        : "Job updated successfully",
      job: updatedJob
    });
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update job"
    });
  }
};

// Delete job posting
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Drive.findOne({
      _id: id,
      postedByEmployer: req.employerId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Check if there are applications
    const applicationCount = await Application.countDocuments({ drive: job._id });
    
    if (applicationCount > 0) {
      // Don't delete, just deactivate
      job.active = false;
      await job.save();

      return res.json({
        success: true,
        message: "Job deactivated successfully (has existing applications)"
      });
    }

    // Delete if no applications
    await Drive.findByIdAndDelete(id);

    // Update employer stats
    await Employer.findByIdAndUpdate(req.employerId, {
      $inc: { "stats.totalJobsPosted": -1 }
    });

    res.json({
      success: true,
      message: "Job deleted successfully"
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job"
    });
  }
};

// ==================== APPLICANT MANAGEMENT ====================

// Get all applicants for a job
exports.getApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, sortBy = "appliedAt", order = "desc" } = req.query;

    // Verify job belongs to employer
    const job = await Drive.findOne({
      _id: jobId,
      postedByEmployer: req.employerId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const filter = { drive: jobId };
    if (status) {
      filter.status = status;
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const applications = await Application.find(filter)
      .populate("student", "fullName universityEmail branch cgpa phone skills profilePicture resume")
      .sort(sortOptions);

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error("Get applicants error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applicants"
    });
  }
};

// Shortlist an applicant
exports.shortlistApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;

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

    application.status = "Shortlisted";
    await application.save();

    res.json({
      success: true,
      message: "Applicant shortlisted successfully",
      application
    });
  } catch (error) {
    console.error("Shortlist applicant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to shortlist applicant"
    });
  }
};

// Reject an applicant
exports.rejectApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

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

    application.status = "Rejected";
    if (reason) {
      application.notes = reason;
    }
    await application.save();

    res.json({
      success: true,
      message: "Applicant rejected",
      application
    });
  } catch (error) {
    console.error("Reject applicant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject applicant"
    });
  }
};

// Select an applicant (final selection)
exports.selectApplicant = async (req, res) => {
  try {
    const { applicationId } = req.params;

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

    application.status = "Selected";
    await application.save();

    // Update employer stats
    await Employer.findByIdAndUpdate(req.employerId, {
      $inc: { "stats.totalHires": 1 }
    });

    res.json({
      success: true,
      message: "Applicant selected successfully",
      application
    });
  } catch (error) {
    console.error("Select applicant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to select applicant"
    });
  }
};

module.exports = exports;
