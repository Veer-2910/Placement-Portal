const PlacementRecord = require("../models/PlacementRecord");
const Student = require("../models/Student");

// Get all placement records with optional filters
exports.getAllPlacements = async (req, res) => {
  try {
    const { department, year, company, limit, page = 1 } = req.query;

    // Build filter
    const filter = {};
    if (department) filter.department = department;
    if (year) filter.placementYear = parseInt(year);
    if (company) filter.companyName = new RegExp(company, "i");

    // Pagination
    const limitNum = limit ? parseInt(limit) : 100;
    const skip = (parseInt(page) - 1) * limitNum;

    const placements = await PlacementRecord.find(filter)
      .populate("student", "fullName universityEmail branch cgpa")
      .populate("drive", "title companyName")
      .sort({ placementDate: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await PlacementRecord.countDocuments(filter);

    res.json({
      success: true,
      count: placements.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      placements,
    });
  } catch (error) {
    console.error("Get placements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch placement records",
      error: error.message,
    });
  }
};

// Get placements for a specific department
exports.getDepartmentPlacements = async (req, res) => {
  try {
    const { dept } = req.params;
    const { year } = req.query;

    const filter = { department: dept.toUpperCase() };
    if (year) filter.placementYear = parseInt(year);

    const placements = await PlacementRecord.find(filter)
      .populate("student", "fullName universityEmail cgpa")
      .sort({ placementDate: -1 });

    res.json({
      success: true,
      department: dept.toUpperCase(),
      count: placements.length,
      placements,
    });
  } catch (error) {
    console.error("Get department placements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department placements",
      error: error.message,
    });
  }
};

// Get comprehensive placement statistics
exports.getPlacementStats = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get placement records for the year
    const placementFilter = { placementYear: currentYear };
    const placements = await PlacementRecord.find(placementFilter);

    // Calculate department-wise statistics
    const departmentStats = {};
    const departments = ["CE", "CSE", "IT", "AI/ML"];

    for (const dept of departments) {
      const deptPlacements = placements.filter((p) => p.department === dept);
      const packages = deptPlacements.map((p) => p.packageLPA);

      const placedCount = deptPlacements.length;
      
      // For now, we assume total students = placed students since we don't have complete student data
      // In production, this would query the Student model
      const studentCount = placedCount;

      departmentStats[dept] = {
        department: dept,
        totalStudents: studentCount,
        placedStudents: placedCount,
        unplacedStudents: 0, // Will be 0 until we have complete student data
        averagePackage:
          packages.length > 0
            ? parseFloat((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2))
            : 0,
        highestPackage: packages.length > 0 ? parseFloat(Math.max(...packages).toFixed(2)) : 0,
        lowestPackage: packages.length > 0 ? parseFloat(Math.min(...packages).toFixed(2)) : 0,
        placementPercentage: placedCount > 0 ? "100.00" : "0.00",
      };
    }

    // Overall statistics
    const totalPlaced = placements.length;
    const totalStudents = totalPlaced; // Same logic as above
    const totalUnplaced = 0;
    const allPackages = placements.map((p) => p.packageLPA);

    // Company-wise statistics
    const companyStats = {};
    placements.forEach((p) => {
      if (!companyStats[p.companyName]) {
        companyStats[p.companyName] = {
          companyName: p.companyName,
          numberOfPlacements: 0,
          averagePackage: 0,
          highestPackage: 0,
          departments: new Set(),
        };
      }
      companyStats[p.companyName].numberOfPlacements++;
      companyStats[p.companyName].departments.add(p.department);
      if (p.packageLPA > companyStats[p.companyName].highestPackage) {
        companyStats[p.companyName].highestPackage = parseFloat(p.packageLPA.toFixed(2));
      }
    });

    // Calculate company average packages
    Object.keys(companyStats).forEach((company) => {
      const companyPlacements = placements.filter(
        (p) => p.companyName === company
      );
      const avgPkg =
        companyPlacements.reduce((sum, p) => sum + p.packageLPA, 0) /
        companyPlacements.length;
      companyStats[company].averagePackage = parseFloat(avgPkg.toFixed(2));
      companyStats[company].departments = Array.from(
        companyStats[company].departments
      );
    });

    res.json({
      success: true,
      year: currentYear,
      overall: {
        totalStudents,
        totalPlaced,
        totalUnplaced,
        placementPercentage: totalStudents > 0 ? parseFloat(((totalPlaced / totalStudents) * 100).toFixed(2)) : 0,
        averagePackage:
          allPackages.length > 0
            ? parseFloat((
                allPackages.reduce((a, b) => a + b, 0) / allPackages.length
              ).toFixed(2))
            : 0,
        highestPackage: allPackages.length > 0 ? parseFloat(Math.max(...allPackages).toFixed(2)) : 0,
        lowestPackage: allPackages.length > 0 ? parseFloat(Math.min(...allPackages).toFixed(2)) : 0,
      },
      departmentWise: Object.values(departmentStats),
      companyWise: Object.values(companyStats).sort(
        (a, b) => b.numberOfPlacements - a.numberOfPlacements
      ),
    });
  } catch (error) {
    console.error("Get placement stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch placement statistics",
      error: error.message,
    });
  }
};

// Create a new placement record
exports.createPlacementRecord = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      studentIdNum,
      department,
      companyName,
      jobRole,
      packageLPA,
      placementYear,
      jobType,
      location,
      driveId,
      applicationId,
    } = req.body;

    // Validate required fields
    if (
      !studentId ||
      !studentName ||
      !department ||
      !companyName ||
      !jobRole ||
      !packageLPA ||
      !placementYear
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if placement record already exists for this student in this year
    const existingRecord = await PlacementRecord.findOne({
      student: studentId,
      placementYear,
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message:
          "Placement record already exists for this student in this year",
      });
    }

    const placementRecord = new PlacementRecord({
      student: studentId,
      studentName,
      studentId: studentIdNum,
      department,
      companyName,
      jobRole,
      packageLPA,
      placementYear,
      jobType,
      location,
      drive: driveId,
      application: applicationId,
    });

    await placementRecord.save();

    res.status(201).json({
      success: true,
      message: "Placement record created successfully",
      placement: placementRecord,
    });
  } catch (error) {
    console.error("Create placement record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create placement record",
      error: error.message,
    });
  }
};

// Get available years for filtering
exports.getAvailableYears = async (req, res) => {
  try {
    const years = await PlacementRecord.distinct("placementYear");
    res.json({
      success: true,
      years: years.sort((a, b) => b - a),
    });
  } catch (error) {
    console.error("Get years error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch years",
      error: error.message,
    });
  }
};

// Get available companies for filtering
exports.getAvailableCompanies = async (req, res) => {
  try {
    const companies = await PlacementRecord.distinct("companyName");
    res.json({
      success: true,
      companies: companies.sort(),
    });
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
      error: error.message,
    });
  }
};

module.exports = exports;
