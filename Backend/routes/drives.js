const express = require("express");
const router = express.Router();
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const jwt = require("jsonwebtoken");

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// --- DRIVE MANAGEMENT ---

// Create a drive (DISABLED for Faculty - Only Employers can create drives)
router.post("/", authMiddleware, async (req, res) => {
  // Faculty can no longer create drives - only employers can create drives
  if (req.user.role === "faculty") {
    return res.status(403).json({ 
      message: "Faculty cannot create placement drives. Only employers can create drives through the employer portal." 
    });
  }

  return res.status(403).json({ message: "Access denied" });
});

// Get all drives (Active)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const drives = await Drive.find({ active: true })
      .sort({ startDate: 1 })
      .lean();

    // If student, check which drives they've applied to
    if (req.user.role === "student") {
      const studentApplications = await Application.find({
        student: req.user.id,
      }).select("drive");
      const appliedDriveIds = new Set(
        studentApplications
          .filter((app) => app.drive) // Safety check for null/undefined drive
          .map((app) => app.drive.toString())
      );

      const drivesWithStatus = drives.map((drive) => ({
        ...drive,
        applied: appliedDriveIds.has(drive._id.toString()),
      }));
      return res.json(drivesWithStatus);
    }

    res.json(drives);
  } catch (err) {
    console.error("Error fetching drives:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all drives for faculty (Read-only access)
router.get("/faculty", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    // Faculty can view ALL drives (both employer-posted and any legacy faculty-posted drives)
    const drives = await Drive.find({ approvalStatus: "Approved" })
      .populate("postedByEmployer", "companyName email")
      .populate("postedBy", "fullName universityEmail")
      .sort({ createdAt: -1 });
    res.json(drives);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single drive details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id).populate(
      "postedBy",
      "fullName universityEmail"
    );
    if (!drive) return res.status(404).json({ message: "Drive not found" });
    res.json(drive);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a drive (DISABLED for Faculty)
router.put("/:id", authMiddleware, async (req, res) => {
  // Faculty can no longer update drives
  if (req.user.role === "faculty") {
    return res.status(403).json({ 
      message: "Faculty cannot edit placement drives. Only employers can edit their own drives." 
    });
  }

  return res.status(403).json({ message: "Access denied" });
});

// Delete a drive (DISABLED for Faculty)
router.delete("/:id", authMiddleware, async (req, res) => {
  // Faculty can no longer delete drives
  if (req.user.role === "faculty") {
    return res.status(403).json({ 
      message: "Faculty cannot delete placement drives. Only employers can delete their own drives." 
    });
  }

  return res.status(403).json({ message: "Access denied" });
});

// --- APPLICATION MANAGEMENT ---

// Apply for a drive (Student only)
router.post("/apply", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Only students can apply" });
  }

  const {
    driveId,
    resume,
    notes,
    cgpaAtTime,
    backlogsCount,
    skills,
    phoneNumber,
    willingToRelocate,
  } = req.body;

  try {
    // Check if drive exists and is active
    const drive = await Drive.findById(driveId);
    if (!drive || !drive.active) {
      return res
        .status(404)
        .json({ message: "Placement drive is no longer active" });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      drive: driveId,
      student: req.user.id,
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this drive" });
    }

    const application = new Application({
      drive: driveId,
      student: req.user.id,
      resume,
      notes,
      cgpaAtTime,
      backlogsCount,
      skills,
      phoneNumber,
      willingToRelocate,
    });

    await application.save();
    res
      .status(201)
      .json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already applied for this drive" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// Get my applications (Student only)
router.get("/student/my-applications", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("drive", "companyName title driveId type location ctc")
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get applications for a specific drive (Faculty - Read-only monitoring)
router.get("/:driveId/applications", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const drive = await Drive.findById(req.params.driveId);
    if (!drive) return res.status(404).json({ message: "Drive not found" });

    // Faculty can view applications for ANY drive (monitoring role)
    const applications = await Application.find({ drive: req.params.driveId })
      .populate(
        "student",
        "fullName universityEmail studentId branch cgpa resume"
      )
      .sort({ appliedAt: 1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update application status (Faculty only - DISABLED - Faculty is read-only)
router.put(
  "/applications/:applicationId/status",
  authMiddleware,
  async (req, res) => {
    // Faculty cannot update application status - this is read-only monitoring
    return res
      .status(403)
      .json({
        message:
          "Faculty cannot modify application status. Status updates are restricted. Faculty can only review and provide feedback.",
      });

    try {
      const application = await Application.findById(
        req.params.applicationId
      ).populate("drive");
      if (!application)
        return res.status(404).json({ message: "Application not found" });

      if (application.drive.postedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      application.status = status;
      await application.save();

      res.json({ message: "Application status updated", application });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Add or update faculty review for an application (Faculty only)
router.put(
  "/applications/:applicationId/review",
  authMiddleware,
  async (req, res) => {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { rating, comments, improvementAreas, recommendedAction, status } =
      req.body;

    try {
      const application = await Application.findById(
        req.params.applicationId
      ).populate("drive");
      if (!application)
        return res.status(404).json({ message: "Application not found" });

      if (application.drive.postedBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      application.facultyReview = {
        reviewer: req.user.id,
        rating,
        comments,
        improvementAreas: Array.isArray(improvementAreas)
          ? improvementAreas
          : improvementAreas
          ? [improvementAreas]
          : [],
        recommendedAction,
        reviewedAt: new Date(),
      };

      if (status) {
        application.status = status;
      }

      await application.save();

      res.json({ message: "Faculty review saved", application });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Export applicants for a specific drive to CSV (Faculty - Read-only monitoring)
router.get("/:driveId/export", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const drive = await Drive.findById(req.params.driveId);
    if (!drive) return res.status(404).json({ message: "Drive not found" });

    // Faculty can export data for ANY drive (monitoring role)

    const applications = await Application.find({ drive: req.params.driveId })
      .populate(
        "student",
        "fullName universityEmail studentId branch cgpa institute resume"
      )
      .sort({ appliedAt: 1 });

    if (applications.length === 0) {
      return res.status(400).json({ message: "No applicants to export" });
    }

    // Simple CSV generation
    const headers = [
      "Student Name",
      "Student ID",
      "Email",
      "Phone",
      "Institute",
      "Branch",
      "CGPA (Current)",
      "CGPA (At Application)",
      "Backlogs",
      "Willing to Relocate",
      "Skills",
      "Applied At",
      "Status",
      "Resume Link",
    ];
    const rows = applications.map((app) => [
      app.student?.fullName || "N/A",
      app.student?.studentId || "N/A",
      app.student?.universityEmail || "N/A",
      app.phoneNumber || app.student?.phone || "N/A",
      app.student?.institute || "N/A",
      app.student?.branch || "N/A",
      app.student?.cgpa || "N/A",
      app.cgpaAtTime || "N/A",
      app.backlogsCount ?? "N/A",
      app.willingToRelocate ? "Yes" : "No",
      app.skills?.join("; ") || "N/A",
      new Date(app.appliedAt).toLocaleDateString(),
      app.status,
      app.student?.resume
        ? `http://localhost:5000${app.student.resume}`
        : "No Resume",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=applicants_${drive.companyName.replace(
        /\s+/g,
        "_"
      )}.csv`
    );
    res.status(200).send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
