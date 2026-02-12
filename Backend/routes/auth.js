const express = require("express");
const router = express.Router(); // ✅ define router
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Resume storage
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "student-resume-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const uploadStudentProfile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "profilePicture") {
        cb(null, "uploads/profiles/");
      } else if (file.fieldname === "resume") {
        cb(null, "uploads/resumes/");
      } else {
        cb(new Error("Invalid fieldname"), false);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const prefix = file.fieldname === "profilePicture" ? "student-profile-" : "student-resume-";
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profilePicture") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Invalid image format"), false);
      }
    } else if (file.fieldname === "resume") {
      if (file.mimetype === "application/pdf" || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF or DOCX allowed for resumes"), false);
      }
    } else {
      cb(new Error("Unknown field"), false);
    }
  },
});

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

// Public signup is disabled. All students are pre-created by the institute.
router.post("/register", (req, res) => {
  return res.status(403).json({
    message: "Public signup is disabled. Please use set-password flow.",
  });
});

// First-time password setup for existing students
// Expects: { email, studentId, password }
router.post("/activate", async (req, res) => {
  const { email, studentId, password } = req.body;



  if (!email || !studentId || !password) {
    return res
      .status(400)
      .json({ message: "Email, student ID and password are required" });
  }

  try {
    const trimmedId = String(studentId).trim();
    const emailNorm = String(email).trim().toLowerCase();

    const student = await Student.findOne({
      $and: [
        {
          $or: [
            { studentId: trimmedId },
            { enrollment: trimmedId },
            { enrollmentNumber: trimmedId },
            { rollNumber: trimmedId },
            { enrollmentNo: trimmedId },
          ],
        },
        {
          $or: [
            { universityEmail: emailNorm },
            { universityEmail: email },
            { personalEmail: emailNorm },
            { personalEmail: email },
            { email: emailNorm },
            { email: email },
            { email1: emailNorm },
            { email1: email },
          ],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        message:
          "No student found for provided email and ID. Please verify your details with the institute.",
      });
    }

    if (student.password) {
      return res.status(400).json({
        message:
          "Password is already set for this account. Please login instead.",
      });
    }

    // Populate required fields if missing so validation passes with existing data shape
    student.studentId =
      student.studentId ||
      student.enrollmentNo ||
      student.enrollmentNumber ||
      student.enrollment ||
      student.rollNumber ||
      trimmedId;

    student.universityEmail =
      student.universityEmail ||
      student.email ||
      student.email1 ||
      student.personalEmail ||
      emailNorm;

    const hashedPassword = await bcrypt.hash(String(password), 10);
    student.password = hashedPassword;


    // Mark flag if it exists in the record
    if (Object.prototype.hasOwnProperty.call(student, "isPasswordSet")) {
      student.isPasswordSet = true;
    }
    await student.save();

    return res.json({
      message: "Password set successfully. You can now login.",
    });
  } catch (error) {
    console.error("Student activate error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({
      $or: [{ universityEmail: email }, { personalEmail: email }],
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({ token, student, role: "student" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get student profile (protected)
router.get("/student/profile/:id", authMiddleware, async (req, res) => {
  try {
    // Verify the user is requesting their own profile
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Profile editing enabled for students
router.put("/student/profile/:id", authMiddleware, uploadStudentProfile.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    // Verify the user is requesting their own profile
    if (req.params.id !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { 
      fullName, personalEmail, phone, branch, semester,
      cgpa, yearOfEnrollment, expectedYearOfGraduation, address,
      bio, skills, interestAreas, socialLinks, projects,
      location, status
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Update allowable fields
    if (fullName) student.fullName = fullName;
    if (personalEmail) student.personalEmail = personalEmail;
    if (phone) student.phone = phone;
    if (branch) student.branch = branch;
    if (semester) student.semester = semester;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (yearOfEnrollment) student.yearOfEnrollment = yearOfEnrollment;
    if (expectedYearOfGraduation) student.expectedYearOfGraduation = expectedYearOfGraduation;
    if (location !== undefined) student.location = location;
    if (status) student.status = status;
    if (bio !== undefined) student.bio = bio;

    if (skills) {
      student.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }
    
    if (interestAreas) {
      student.interestAreas = Array.isArray(interestAreas) ? interestAreas : JSON.parse(interestAreas);
    }

    if (projects) {
      student.projects = Array.isArray(projects) ? projects : JSON.parse(projects);
    }

    if (socialLinks) {
       const parsedLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
       student.socialLinks = { ...student.socialLinks, ...parsedLinks };
    }

    if (address) {
      const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      student.address = {
        ...student.address,
        ...parsedAddress
      };
    }

    if (req.files) {
      if (req.files.profilePicture) {
        student.profilePicture = `/uploads/profiles/${req.files.profilePicture[0].filename}`;
      }
      if (req.files.resume) {
        student.resume = `/uploads/resumes/${req.files.resume[0].filename}`;
      }
    }

    await student.save();
    res.json({ message: "Profile updated successfully", student });
  } catch (error) {
    console.error("Student profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; // ✅ export router
