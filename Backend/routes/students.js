const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");

// Get all students (Faculty only)
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const students = await Student.find().select("-password").sort({ fullName: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Student Statistics (Faculty only)
router.get("/stats", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const students = await Student.find().select("-password");
    
    const stats = {
      total: students.length,
      avgCgpa: (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(2),
      branchWise: {},
      statusWise: {
        Active: 0,
        Interning: 0,
        Placed: 0,
        Graduated: 0,
        "Seeking Opportunities": 0
      }
    };

    students.forEach(s => {
      // Branch distribution
      if (s.branch) {
        stats.branchWise[s.branch] = (stats.branchWise[s.branch] || 0) + 1;
      }
      // Status distribution
      if (s.status) {
        stats.statusWise[s.status] = (stats.statusWise[s.status] || 0) + 1;
      } else {
        stats.statusWise["Active"]++;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new student (Faculty only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const { studentId, fullName, universityEmail, branch, cgpa, institute } = req.body;
    
    // Simple validation
    if (!studentId || !fullName || !universityEmail) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existing = await Student.findOne({ $or: [{ studentId }, { universityEmail }] });
    if (existing) {
      return res.status(400).json({ message: "Student ID or Email already exists" });
    }

    const student = new Student({
      studentId,
      fullName,
      universityEmail,
      branch,
      cgpa,
      institute,
      status: "Active"
    });

    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update student info (Faculty only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");
    
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Patch student status (Faculty only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const { status } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");
    
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get detailed student profile with application history (Faculty only)
router.get("/:id/history", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const student = await Student.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const applications = await Application.find({ student: req.params.id })
      .populate("drive", "companyName title driveId type location ctc")
      .sort({ appliedAt: -1 });

    res.json({ student, applications });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle Job Bookmark (Student only)
router.post("/bookmarks/toggle", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const { driveId } = req.body;
    const student = await Student.findById(req.user.id);
    
    if (!student) return res.status(404).json({ message: "Student not found" });

    const isBookmarked = student.bookmarkedJobs.includes(driveId);
    
    if (isBookmarked) {
      student.bookmarkedJobs = student.bookmarkedJobs.filter(id => id.toString() !== driveId);
    } else {
      student.bookmarkedJobs.push(driveId);
    }

    await student.save();
    res.json({ bookmarkedJobs: student.bookmarkedJobs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get matched jobs for student (Smart Job Matching)
router.get("/matched-jobs", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const Drive = require("../models/Drive");
    const { getMatchedJobs } = require("../utils/jobMatcher");
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all active drives
    const drives = await Drive.find({ active: true });
    
    // Calculate matches
    const matchedDrives = getMatchedJobs(student, drives);
    
    res.json(matchedDrives);
  } catch (err) {
    console.error("Matched jobs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update student job preferences
router.put("/preferences", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const { jobTypes, locations, minSalary, roles } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          jobTypes: jobTypes || [],
          locations: locations || [],
          minSalary: minSalary || null,
          roles: roles || []
        }
      },
      { new: true }
    ).select("-password");

    res.json({ 
      message: "Preferences updated successfully", 
      preferences: student.preferences 
    });
  } catch (err) {
    console.error("Update preferences error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student preferences
router.get("/preferences", authMiddleware, async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const student = await Student.findById(req.user.id).select("preferences");
    res.json(student.preferences || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

