const Employer = require("../models/Employer");
const Drive = require("../models/Drive");
const Student = require("../models/Student");
const Application = require("../models/Application");

// ==================== EMPLOYER MANAGEMENT ====================

// Get pending employers
exports.getPendingEmployers = async (req, res) => {
  try {
    const employers = await Employer.find({ verificationStatus: "Pending" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employers.length,
      employers
    });
  } catch (error) {
    console.error("Get pending employers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Verify employer
exports.verifyEmployer = async (req, res) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found"
      });
    }

    if (employer.verificationStatus === "Verified") {
      return res.status(400).json({
        success: false,
        message: "Employer is already verified"
      });
    }

    // Update employer
    employer.verificationStatus = "Verified";
    employer.isActive = true;
    employer.verifiedBy = req.admin.id;
    employer.verifiedAt = new Date();
    
    await employer.save();

    res.status(200).json({
      success: true,
      message: "Employer verified successfully",
      employer
    });
  } catch (error) {
    console.error("Verify employer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Reject employer
exports.rejectEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Please provide rejection reason"
      });
    }

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found"
      });
    }

    // Update employer
    employer.verificationStatus = "Rejected";
    employer.isActive = false;
    employer.rejectionReason = rejectionReason;
    employer.verifiedBy = req.admin.id;
    employer.verifiedAt = new Date();
    
    await employer.save();

    res.status(200).json({
      success: true,
      message: "Employer rejected",
      employer
    });
  } catch (error) {
    console.error("Reject employer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get all employers
exports.getAllEmployers = async (req, res) => {
  try {
    const { status, search, industry } = req.query;
    
    let query = {};
    
    if (status) {
      query.verificationStatus = status;
    }
    
    if (industry) {
      query.industry = industry;
    }
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { companyEmail: { $regex: search, $options: "i" } }
      ];
    }

    const employers = await Employer.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employers.length,
      employers
    });
  } catch (error) {
    console.error("Get all employers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get employer details
exports.getEmployerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const employer = await Employer.findById(id).select("-password");
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found"
      });
    }

    // Get employer's jobs
    const jobs = await Drive.find({ postedByEmployer: id });

    res.status(200).json({
      success: true,
      employer,
      stats: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.active).length,
        pendingJobs: jobs.filter(j => j.approvalStatus === "Pending").length
      }
    });
  } catch (error) {
    console.error("Get employer details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Deactivate employer
exports.deactivateEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found"
      });
    }

    employer.isActive = !employer.isActive;
    if (reason) {
      employer.rejectionReason = reason;
    }
    
    await employer.save();

    res.status(200).json({
      success: true,
      message: `Employer ${employer.isActive ? "activated" : "deactivated"} successfully`,
      employer
    });
  } catch (error) {
    console.error("Deactivate employer error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ==================== JOB APPROVAL ====================

// Get pending jobs
exports.getPendingJobs = async (req, res) => {
  try {
    const jobs = await Drive.find({ 
      approvalStatus: "Pending",
      postedByEmployer: { $exists: true }
    })
      .populate("postedByEmployer", "companyName companyEmail industry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("Get pending jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Approve job
exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Drive.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (job.approvalStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Job is already approved"
      });
    }

    // Update job
    job.approvalStatus = "Approved";
    job.active = true;
    job.approvedBy = req.admin.id;
    job.approvedAt = new Date();
    
    await job.save();

    res.status(200).json({
      success: true,
      message: "Job approved successfully",
      job
    });
  } catch (error) {
    console.error("Approve job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Reject job
exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Please provide rejection reason"
      });
    }

    const job = await Drive.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    // Update job
    job.approvalStatus = "Rejected";
    job.active = false;
    job.rejectionReason = rejectionReason;
    job.approvedBy = req.admin.id;
    job.approvedAt = new Date();
    
    await job.save();

    res.status(200).json({
      success: true,
      message: "Job rejected",
      job
    });
  } catch (error) {
    console.error("Reject job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { status, type, employer } = req.query;
    
    let query = {};
    
    if (status) {
      query.approvalStatus = status;
    }
    
    if (type) {
      query.jobType = type;
    }
    
    if (employer) {
      query.postedByEmployer = employer;
    }

    const jobs = await Drive.find(query)
      .populate("postedByEmployer", "companyName")
      .populate("postedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Deactivate job
exports.deactivateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Drive.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    job.active = !job.active;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job ${job.active ? "activated" : "deactivated"} successfully`,
      job
    });
  } catch (error) {
    console.error("Deactivate job error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ==================== SYSTEM ANALYTICS ====================

// Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    // Count totals
    const totalStudents = await Student.countDocuments();
    const totalEmployers = await Employer.countDocuments({ verificationStatus: "Verified" });
    const totalJobs = await Drive.countDocuments({ active: true });
    const totalApplications = await Application.countDocuments();

    // Pending approvals
    const pendingEmployers = await Employer.countDocuments({ verificationStatus: "Pending" });
    const pendingJobs = await Drive.countDocuments({ approvalStatus: "Pending" });

    // Placement stats
    const placedStudents = await Student.countDocuments({ status: "Placed" });
    const interningStudents = await Student.countDocuments({ status: "Interning" });

    // Application stats
    const shortlistedApplications = await Application.countDocuments({ status: "Shortlisted" });
    const selectedApplications = await Application.countDocuments({ status: "Selected" });

    res.status(200).json({
      success: true,
      stats: {
        students: {
          total: totalStudents,
          placed: placedStudents,
          interning: interningStudents,
          seeking: totalStudents - placedStudents - interningStudents
        },
        employers: {
          total: totalEmployers,
          pending: pendingEmployers
        },
        jobs: {
          total: totalJobs,
          pending: pendingJobs
        },
        applications: {
          total: totalApplications,
          shortlisted: shortlistedApplications,
          selected: selectedApplications
        }
      }
    });
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get placement statistics
exports.getPlacementStats = async (req, res) => {
  try {
    // Placement by branch
    const placementByBranch = await Student.aggregate([
      {
        $group: {
          _id: "$branch",
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ["$status", "Placed"] }, 1, 0] }
          }
        }
      }
    ]);

    // Recent placements
    const recentPlacements = await Application.find({ status: "Selected" })
      .populate("student", "fullName branch")
      .populate("drive", "companyName title")
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      placementByBranch,
      recentPlacements
    });
  } catch (error) {
    console.error("Get placement stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
