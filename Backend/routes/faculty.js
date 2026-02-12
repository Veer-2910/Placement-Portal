const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const Faculty = require("../models/Faculty");
const OTP = require("../models/OTP");
const Resource = require("../models/Resource");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");
const { sendOTP } = require("../utils/emailService");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resources/");
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
    // Allow all file types for resources
    cb(null, true);
  },
});

// Profile photo storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for photos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Rate limiter for OTP endpoints (max 3 requests per 10 minutes)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: "Too many OTP requests. Please try again after 10 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========================================
// OTP ENDPOINTS FOR FACULTY ACTIVATION
// ========================================

// Send OTP for faculty email verification
router.post("/send-activation-otp", otpLimiter, async (req, res) => {
  const { email, employeeId } = req.body;

  if (!email || !employeeId) {
    return res.status(400).json({
      message: "Email and employee ID are required",
    });
  }

  try {
    const emailNorm = String(email).trim().toLowerCase();
    const trimmedId = String(employeeId).trim();
    const numericId = parseInt(trimmedId);

    const employeeIdConditions = [
      { employeeId: trimmedId },
      { employeeId: numericId },
      { staffId: trimmedId },
      { facultyId: trimmedId },
    ];

    // Check if faculty exists
    const faculty = await Faculty.findOne({
      $and: [
        {
          $or: employeeIdConditions,
        },
        {
          $or: [
            { universityEmail: emailNorm },
            { email: emailNorm },
            { officialEmail: emailNorm },
          ],
        },
      ],
    });

    if (!faculty) {
      return res.status(404).json({
        message: "No faculty found with provided email and ID. Please verify your details.",
      });
    }

    // Check if password already set
    if (faculty.password && faculty.password.length > 0) {
      return res.status(400).json({
        message: "Password is already set for this account. Please login instead.",
      });
    }

    // Generate and save OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.deleteMany({ email: emailNorm });
    await OTP.create({
      email: emailNorm,
      otp: hashedOTP,
      attempts: 0,
    });

    // Send OTP email
    await sendOTP(email, otp);

    return res.json({
      message: "OTP sent successfully to your email. Valid for 5 minutes.",
      email: emailNorm,
    });
  } catch (error) {
    console.error("Faculty send OTP error:", error);
    
    if (error.message && error.message.includes("Email")) {
      return res.status(500).json({
        message: "Failed to send email. Please check your email configuration.",
      });
    }
    
    return res.status(500).json({
      message: "Failed to send OTP. Please try again.",
    });
  }
});

// Verify OTP for faculty
router.post("/verify-activation-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  try {
    const emailNorm = String(email).trim().toLowerCase();

    const otpRecord = await OTP.findOne({ email: emailNorm });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP. Please request a new one.",
      });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ email: emailNorm });
      return res.status(400).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
      });
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { email: emailNorm, type: "otp-verified" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    await OTP.deleteOne({ email: emailNorm });

    return res.json({
      message: "Email verified successfully",
      verified: true,
      verificationToken,
    });
  } catch (error) {
    console.error("Faculty verify OTP error:", error);
    return res.status(500).json({
      message: "Failed to verify OTP. Please try again.",
    });
  }
});

// Public signup is disabled. All faculty are pre-created by the institute.
router.post("/register", (req, res) => {
  return res.status(403).json({
    message: "Public signup is disabled. Please use set-password flow.",
  });
});

// First-time password setup for existing faculty
// Expects: { email, employeeId, password, verificationToken }
router.post("/activate", async (req, res) => {
  try {
    const { email, employeeId, password, verificationToken } = req.body;

    if (!email || !employeeId || !password) {
      return res
        .status(400)
        .json({ message: "Email, employee ID and password are required" });
    }

    // Verify OTP token
    if (!verificationToken) {
      return res.status(400).json({
        message: "Email verification required. Please verify your email first.",
      });
    }

    // Verify the verification token
    let decoded;
    try {
      decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({
        message: "Invalid or expired verification token.",
      });
    }
    
    if (decoded.type !== "otp-verified") {
      return res.status(400).json({
        message: "Invalid verification token.",
      });
    }

    const emailNorm = String(email).trim().toLowerCase();
    
    // Ensure the email matches the verified email
    if (decoded.email !== emailNorm) {
      return res.status(400).json({
        message: "Email mismatch. Please verify the correct email.",
      });
    }

    const trimmedId = String(employeeId).trim();
    const numericId = parseInt(trimmedId);

    // Create search conditions for employeeId that handle both string and numeric types
    const employeeIdConditions = [
      { employeeId: trimmedId },
      { employeeId: numericId },
    ];

    // Also search for the original employeeId value in case it's already the correct type
    if (typeof employeeId !== "string") {
      employeeIdConditions.push({ employeeId: employeeId });
    }

    // Debug logging - remove in production
    console.log("Faculty activation attempt:");
    console.log("- Email:", email);
    console.log("- Email normalized:", emailNorm);
    console.log("- Employee ID:", employeeId);
    console.log("- Employee ID type:", typeof employeeId);
    console.log("- Trimmed ID:", trimmedId);
    console.log("- Numeric ID:", numericId);
    console.log("- isNaN(numericId):", isNaN(numericId));
    console.log("- Employee ID conditions:", employeeIdConditions);

    const faculty = await Faculty.findOne({
      $and: [
        {
          $or: [
            ...employeeIdConditions,
            { staffId: trimmedId },
            { facultyId: trimmedId },
          ],
        },
        {
          $or: [
            { universityEmail: emailNorm },
            { email: emailNorm },
            { officialEmail: emailNorm },
          ],
        },
      ],
    });

    // Debug logging - remove in production
    console.log("Faculty query result:", faculty ? "Found" : "Not found");
    if (faculty) {
      console.log("Found faculty:", {
        id: faculty._id,
        fullName: faculty.fullName,
        employeeId: faculty.employeeId,
        universityEmail: faculty.universityEmail,
        password: faculty.password,
        passwordType: typeof faculty.password,
        passwordExists: "password" in faculty,
      });
    }

    if (!faculty) {
      return res.status(404).json({
        message:
          "No faculty found for provided email and ID. Please verify your details with the institute.",
      });
    }

    // Check if password is already set
    console.log("Password check:", {
      password: faculty.password,
      passwordLength: faculty.password ? faculty.password.length : "N/A",
      passwordCheck: faculty.password && faculty.password.length > 0,
    });

    if (faculty.password && faculty.password.length > 0) {
      return res.status(400).json({
        message:
          "Password is already set for this account. Please login instead.",
      });
    }

    console.log("Setting password for faculty:", faculty._id);
    const hashed = await bcrypt.hash(String(password), 10);
    faculty.password = hashed;
    await faculty.save();
    console.log("Password set successfully for faculty:", faculty._id);

    return res.json({
      message: "Password set successfully. You can now login.",
    });
  } catch (err) {
    console.error("Faculty activate error:", err);
    // Return a more specific error message that matches what the user is seeing
    return res.status(500).json({
      message: "Failed to set password. Please contact your institute.",
    });
  }
});

// POST /api/faculty/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const faculty = await Faculty.findOne({
      universityEmail: email.toLowerCase(),
    });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    const ok = await bcrypt.compare(password, faculty.password);
    if (!ok) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign(
      { id: faculty._id, role: "faculty" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password: _pw, ...rest } = faculty.toObject();
    return res.json({ token, faculty: rest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/faculty/profile/:id
router.get("/profile/:id", async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).select("-password");
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    return res.json(faculty);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/faculty/profile (Update own profile)
router.put(
  "/profile",
  authMiddleware,
  uploadProfile.single("profilePicture"),
  async (req, res) => {
    try {
      const {
        fullName,
        mobile,
        department,
        institute,
        designation,
        personalEmail,
        bio,
        skills,
        socialLinks,
        researchInterests,
        experience,
        location,
        availability,
      } = req.body;
      const facultyId = req.user.id;

      const faculty = await Faculty.findById(facultyId);
      if (!faculty)
        return res.status(404).json({ message: "Faculty not found" });

      // Update allowable fields
      if (fullName) faculty.fullName = fullName;
      if (mobile) faculty.mobile = mobile;
      if (department) faculty.department = department;
      if (institute) faculty.institute = institute;
      if (designation) faculty.designation = designation;
      if (location !== undefined) faculty.location = location;
      if (availability) faculty.availability = availability;
      if (personalEmail) faculty.personalEmail = personalEmail;
      if (bio !== undefined) faculty.bio = bio;

      if (skills) {
        faculty.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
      }

      if (researchInterests) {
        faculty.researchInterests = Array.isArray(researchInterests)
          ? researchInterests
          : JSON.parse(researchInterests);
      }

      if (experience) {
        faculty.experience = Array.isArray(experience)
          ? experience
          : JSON.parse(experience);
      }

      if (socialLinks) {
        const parsedLinks =
          typeof socialLinks === "string"
            ? JSON.parse(socialLinks)
            : socialLinks;
        faculty.socialLinks = { ...faculty.socialLinks, ...parsedLinks };
      }

      if (req.file) {
        faculty.profilePicture = `/uploads/profiles/${req.file.filename}`;
      }

      await faculty.save();

      const { password: _pw, ...rest } = faculty.toObject();
      res.json({ message: "Profile updated successfully", faculty: rest });
    } catch (err) {
      console.error("Faculty profile update error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Upload a new resource (link or file)
router.post(
  "/resources/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, description, link, category, tags } = req.body;
      const facultyId = req.user.id;

      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      if (!link && !req.file) {
        return res
          .status(400)
          .json({ message: "Either a link or file must be provided" });
      }

      // Get faculty details
      const faculty = await Faculty.findById(facultyId);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }

      const resourceData = {
        title,
        description,
        category,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
        uploadedBy: facultyId,
        uploadedByName: faculty.fullName,
        institute: faculty.institute,
        department: faculty.department,
      };

      // Handle file upload
      if (req.file) {
        resourceData.filePath = req.file.path;
        resourceData.fileName = req.file.filename;
        resourceData.fileType = req.file.mimetype;
        resourceData.fileSize = req.file.size;
      }
      // Handle link
      else if (link) {
        resourceData.link = link;
      }

      const resource = new Resource(resourceData);
      await resource.save();

      return res.status(201).json({
        message: "Resource uploaded successfully",
        resource,
      });
    } catch (err) {
      console.error("Resource upload error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all resources for a faculty member with search/filtering
router.get("/resources", authMiddleware, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { search, category, tag } = req.query;

    // Build query
    const query = { uploadedBy: facultyId };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const resources = await Resource.find(query).sort({
      createdAt: -1,
    });

    return res.json(resources);
  } catch (err) {
    console.error("Get resources error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all resources (for students) with search/filtering
router.get("/resources/all", authMiddleware, async (req, res) => {
  try {
    const { search, category, tag } = req.query;

    // Build query
    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "fullName department institute");

    return res.json(resources);
  } catch (err) {
    console.error("Get all resources error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get available categories and tags for filtering
router.get("/resources/filters", authMiddleware, async (req, res) => {
  try {
    // Get distinct categories
    const categories = await Resource.distinct("category", {
      category: { $ne: null, $ne: "" },
    });

    // Get distinct tags
    const tags = await Resource.distinct("tags");

    return res.json({
      categories: categories.filter((cat) => cat), // Remove null/empty values
      tags: tags.filter((tag) => tag), // Remove null/empty values
    });
  } catch (err) {
    console.error("Get filters error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Update a resource
router.put(
  "/resources/:id",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, description, link, category, tags } = req.body;
      const resourceId = req.params.id;
      const facultyId = req.user.id;

      let resource = await Resource.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Check ownership
      if (resource.uploadedBy.toString() !== facultyId) {
        return res
          .status(403)
          .json({ message: "Not authorized to edit this resource" });
      }

      // Update basic fields
      resource.title = title || resource.title;
      resource.description = description || resource.description;
      resource.category = category || resource.category;

      if (tags) {
        resource.tags = Array.isArray(tags) ? tags : [tags];
      }

      // Handle file update
      if (req.file) {
        resource.filePath = req.file.path;
        resource.fileName = req.file.filename;
        resource.fileType = req.file.mimetype;
        resource.fileSize = req.file.size;
        // If updating file, remove link
        resource.link = undefined;
      }
      // Handle link update
      else if (link) {
        resource.link = link;
        // If updating link, remove file info if user wants to switch (handled by frontend logic usually, but here we can force clear if needed?)
        // Let's assume if link is provided, we might want to clear file path if the user intends to switch type.
        // For now, let's keep it simple: if link is sent and no file, update link.
        // If the user wants to switch from file to link, frontend should probably clear the file inputs.
      }

      await resource.save();

      return res.json({
        message: "Resource updated successfully",
        resource,
      });
    } catch (err) {
      console.error("Resource update error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete a resource
router.delete("/resources/:id", authMiddleware, async (req, res) => {
  try {
    const resourceId = req.params.id;
    const facultyId = req.user.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check ownership
    if (resource.uploadedBy.toString() !== facultyId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this resource" });
    }

    await Resource.findByIdAndDelete(resourceId);

    return res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    console.error("Resource delete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get matched students for a drive (Faculty Smart Matching)
router.get("/drives/:driveId/matched-students", authMiddleware, async (req, res) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const Drive = require("../models/Drive");
    const Student = require("../models/Student");
    const { getMatchedStudents } = require("../utils/jobMatcher");
    
    const drive = await Drive.findById(req.params.driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    // Get all students
    const students = await Student.find().select("-password");
    
    // Calculate matches
    const matchedStudents = getMatchedStudents(drive, students);
    
    // Return top 50 matches
    res.json(matchedStudents.slice(0, 50));
  } catch (err) {
    console.error("Matched students error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
