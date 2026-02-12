require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@university.edu" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Admin ID:", existingAdmin.adminId);
      console.log("\nIf you forgot the password, delete this admin and run the script again.");
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      adminId: "ADMIN001",
      fullName: "TNP Head",
      email: "admin@university.edu",
      password: "admin123", // Will be hashed automatically by the model
      designation: "TNP Head",
      phone: "9876543210",
      department: "Training & Placement Cell",
      permissions: [
        "verify_employers",
        "approve_jobs",
        "manage_students",
        "manage_faculty",
        "view_analytics",
        "manage_announcements",
        "manage_resources",
        "system_settings"
      ],
      isActive: true
    });

    await admin.save();

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📋 Admin Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email:        admin@university.edu");
    console.log("Password:     admin123");
    console.log("Admin ID:     ADMIN001");
    console.log("Designation:  TNP Head");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔗 Login URL: http://localhost:5173/admin/login");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
