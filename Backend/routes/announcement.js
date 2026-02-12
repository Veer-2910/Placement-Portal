const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const Faculty = require("../models/Faculty");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/announcementFiles/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    cb(null, true);
  },
});

// POST /api/announcements - Faculty can create announcements
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    // Only faculty can create announcements
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Get faculty details
    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const announcementData = {
      title,
      description,
      category: req.body.category || "General",
      uploadedBy: req.user.id,
      uploadedByName: faculty.fullName,
      institute: faculty.institute,
      department: faculty.department,
    };

    // Handle file upload
    if (req.file) {
      announcementData.filePath = req.file.path;
      announcementData.fileName = req.file.filename;
      announcementData.fileType = req.file.mimetype;
      announcementData.fileSize = req.file.size;
    }

    const announcement = new Announcement(announcementData);

    await announcement.save();
    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (err) {
    console.error("Announcement creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/announcements - Students can view announcements
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Both faculty and students can view announcements
    let query = {};

    // If user is a student, allow filtering by department/institute
    if (req.user.role === "student") {
      // Optional: filter by department or institute if provided in query params
      if (req.query.department) {
        query.department = req.query.department;
      }
      if (req.query.institute) {
        query.institute = req.query.institute;
      }
    }

    // If user is faculty, they can filter by their own department/institute
    if (req.user.role === "faculty") {
      if (req.query.department) {
        query.department = req.query.department;
      }
      if (req.query.institute) {
        query.institute = req.query.institute;
      }
    }

    // Add search functionality if search query is provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate("uploadedBy", "fullName department institute")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    console.error("Get announcements error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/announcements/filters - Get available filters (departments and institutes)
router.get("/filters", authMiddleware, async (req, res) => {
  try {
    // Get unique departments and institutes
    const departments = await Announcement.distinct("department");
    const institutes = await Announcement.distinct("institute");

    res.json({
      departments: departments.filter((dept) => dept && dept.trim() !== ""),
      institutes: institutes.filter((inst) => inst && inst.trim() !== ""),
    });
  } catch (err) {
    console.error("Get filters error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/announcements/unread-count - Get count of unread announcements for a student
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const unreadCount = await Announcement.countDocuments({
      readBy: { $ne: req.user.id },
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error("Get unread announcements count error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/announcements/:id/mark-as-read - Mark an announcement as read
router.get("/:id/mark-as-read", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if student has already read this announcement
    if (!announcement.readBy.includes(req.user.id)) {
      announcement.readBy.push(req.user.id);
      await announcement.save();
    }

    res.json({ message: "Announcement marked as read" });
  } catch (err) {
    console.error("Mark announcement as read error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/announcements/:id/download - Download an announcement file
router.get("/:id/download", authMiddleware, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (!announcement.filePath) {
      return res.status(404).json({ message: "File not found" });
    }

    // Serve the file with proper headers for download
    res.download(announcement.filePath, announcement.fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        // Check if headers have already been sent
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to download file" });
        }
      }
    });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/announcements/:id - Faculty can update their announcements
router.put("/:id", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    // Only faculty can update announcements
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description, category } = req.body;

    // Find the announcement
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if the faculty is the owner of the announcement
    if (announcement.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update announcement data
    const updateData = {
      updatedAt: Date.now(),
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;

    // Handle file upload
    if (req.file) {
      updateData.filePath = req.file.path;
      updateData.fileName = req.file.filename;
      updateData.fileType = req.file.mimetype;
      updateData.fileSize = req.file.size;
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    });
  } catch (err) {
    console.error("Announcement update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/announcements/:id - Faculty can delete their announcements
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Only faculty can delete announcements
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find the announcement
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if the faculty is the owner of the announcement
    if (announcement.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Announcement deletion error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
