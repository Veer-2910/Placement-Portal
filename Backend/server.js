require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const facultyRoutes = require("./routes/faculty");
const resourceRoutes = require("./routes/resource");
const announcementRoutes = require("./routes/announcement");
const driveRoutes = require("./routes/drives");
const studentManagementRoutes = require("./routes/students");
const employerAuthRoutes = require("./routes/employerAuth");
const employerJobRoutes = require("./routes/employerJobs");
const employerStudentRoutes = require("./routes/employerStudents");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");
const aptitudeResultRoutes = require("./routes/aptitudeResults");
const stageManagementRoutes = require("./routes/stageManagement");

const app = express();

// Security Middleware
app.use(helmet()); // Secure HTTP headers

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use("/api/", limiter); // Apply to all API routes

// Middleware
app.use(express.json({ limit: "10kb" })); // Body size limit to prevent DoS

// CORS setup: allow frontend ports
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/resources", resourceRoutes); // <-- Now this works
app.use("/api/announcements", announcementRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/students", studentManagementRoutes);

// Employer Routes
app.use("/api/employer", employerAuthRoutes);
app.use("/api/employer/jobs", employerJobRoutes);
app.use("/api/employer/students", employerStudentRoutes);

// Admin Routes
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminManagementRoutes);

// Stage-Based Recruitment Routes
app.use("/api/aptitude-results", aptitudeResultRoutes);
app.use("/api/stages", stageManagementRoutes);

app.use("/uploads", express.static("uploads"));

// Fallback route for testing server
app.get("/", (req, res) => res.send("Server is running"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server!" });
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("Error: MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `🚀 Server running on port ${PORT} at ${new Date().toISOString()}`
  )
);
