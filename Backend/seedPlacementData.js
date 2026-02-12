require("dotenv").config();
const mongoose = require("mongoose");
const PlacementRecord = require("./models/PlacementRecord");
const Student = require("./models/Student");

// Sample data
const departments = ["CE", "CSE", "IT", "AI/ML"];

const companies = [
  // Tier 1 companies (High packages)
  { name: "Google", avgPackage: 45, range: [35, 55] },
  { name: "Microsoft", avgPackage: 42, range: [35, 50] },
  { name: "Amazon", avgPackage: 40, range: [32, 48] },
  { name: "Meta", avgPackage: 48, range: [38, 60] },
  { name: "Apple", avgPackage: 44, range: [36, 52] },
  
  // Tier 2 companies (Medium-High packages)
  { name: "Adobe", avgPackage: 28, range: [22, 35] },
  { name: "Salesforce", avgPackage: 26, range: [20, 32] },
  { name: "Oracle", avgPackage: 24, range: [18, 30] },
  { name: "SAP", avgPackage: 22, range: [18, 28] },
  { name: "VMware", avgPackage: 25, range: [20, 32] },
  { name: "Cisco", avgPackage: 23, range: [18, 28] },
  
  // Tier 3 companies (Medium packages)
  { name: "Infosys", avgPackage: 8, range: [6, 12] },
  { name: "TCS", avgPackage: 7, range: [5, 10] },
  { name: "Wipro", avgPackage: 7.5, range: [5.5, 11] },
  { name: "Cognizant", avgPackage: 8, range: [6, 11] },
  { name: "HCL", avgPackage: 7, range: [5, 10] },
  { name: "Tech Mahindra", avgPackage: 7.5, range: [6, 11] },
  { name: "Capgemini", avgPackage: 8.5, range: [6.5, 12] },
  { name: "Accenture", avgPackage: 9, range: [7, 13] },
  
  // Tier 4 companies (Entry-level packages)
  { name: "Persistent Systems", avgPackage: 6, range: [4.5, 8] },
  { name: "L&T Infotech", avgPackage: 6.5, range: [5, 9] },
  { name: "Mphasis", avgPackage: 6, range: [4.5, 8.5] },
  { name: "Mindtree", avgPackage: 6.5, range: [5, 9] },
  { name: "Zensar", avgPackage: 5.5, range: [4, 7.5] },
];

const jobRoles = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "System Engineer",
  "Software Developer",
  "Associate Software Engineer",
  "Junior Developer",
];

const locations = [
  "Bangalore",
  "Pune",
  "Mumbai",
  "Hyderabad",
  "Chennai",
  "Gurugram",
  "Noida",
  "Ahmedabad",
  "Kolkata",
  "Remote",
];

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Rohan", "Ishaan", "Shaurya",
  "Advait", "Krishna", "Aadhya", "Ananya", "Diya", "Isha", "Kavya", "Meera",
  "Saanvi", "Sara", "Shanaya", "Tara", "Amit", "Raj", "Priya", "Neha",
  "Rahul", "Riya", "Yash", "Pooja", "Karan", "Divya", "Harsh", "Sneha",
  "Varun", "Tanvi", "Dev", "Kriti", "Parth", "Nisha", "Aryan", "Sakshi",
];

const lastNames = [
  "Sharma", "Patel", "Kumar", "Singh", "Verma", "Gupta", "Joshi", "Desai",
  "Shah", "Mehta", "Trivedi", "Pandey", "Reddy", "Nair", "Iyer", "Menon",
  "Chauhan", "Rao", "Agarwal", "Jain", "Malhotra", "Kapoor", "Khanna", "Chopra",
];

// Helper functions
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStudentName() {
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

function generateStudentId(year, dept, index) {
  const yearCode = year.toString().slice(2);
  const deptCode = dept === "AI/ML" ? "AI" : dept;
  const numStr = String(index).padStart(3, "0");
  return `${yearCode}${deptCode}${numStr}`;
}

function getPackageForCompany(company) {
  const [min, max] = company.range;
  return parseFloat(getRandomNumber(min, max).toFixed(2));
}

function generatePlacementDate(year) {
  // Placements typically happen between August and December
  const month = getRandomInt(8, 12);
  const day = getRandomInt(1, 28);
  return new Date(year, month - 1, day);
}

async function seedPlacementData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing placement records
    console.log("🗑️ Clearing existing placement records...");
    await PlacementRecord.deleteMany({});
    console.log("✅ Cleared existing records");

    const placementRecords = [];
    const years = [2023, 2024, 2025];
    const recordsPerYear = Math.floor(800 / years.length); // ~267 per year
    
    let totalRecords = 0;
    
    for (const year of years) {
      console.log(`\n📊 Generating placement data for year ${year}...`);
      
      // Distribute records across departments
      const recordsPerDept = Math.floor(recordsPerYear / departments.length);
      
      for (const dept of departments) {
        console.log(`  📝 Generating ${recordsPerDept} records for ${dept}...`);
        
        for (let i = 0; i < recordsPerDept; i++) {
          const company = getRandomElement(companies);
          const studentName = generateStudentName();
          const studentId = generateStudentId(year, dept, totalRecords + i + 1);
          
          const record = {
            student: new mongoose.Types.ObjectId(), // Dummy ObjectId
            studentName,
            studentId,
            department: dept,
            companyName: company.name,
            jobRole: getRandomElement(jobRoles),
            packageLPA: getPackageForCompany(company),
            placementYear: year,
            placementDate: generatePlacementDate(year),
            jobType: Math.random() > 0.1 ? "Full-time" : "Internship",
            location: getRandomElement(locations),
          };
          
          placementRecords.push(record);
        }
        
        totalRecords += recordsPerDept;
      }
    }

    console.log(`\n💾 Inserting ${placementRecords.length} placement records...`);
    await PlacementRecord.insertMany(placementRecords);
    console.log(`✅ Successfully inserted ${placementRecords.length} placement records!`);

    // Generate statistics
    console.log("\n📈 Generating statistics...");
    
    for (const year of years) {
      const yearRecords = placementRecords.filter(r => r.placementYear === year);
      const packages = yearRecords.map(r => r.packageLPA);
      
      console.log(`\n📊 Year ${year}:`);
      console.log(`  Total Placements: ${yearRecords.length}`);
      console.log(`  Average Package: ₹${(packages.reduce((a, b) => a + b) / packages.length).toFixed(2)} LPA`);
      console.log(`  Highest Package: ₹${Math.max(...packages)} LPA`);
      console.log(`  Lowest Package: ₹${Math.min(...packages)} LPA`);
      
      // Department-wise breakdown
      for (const dept of departments) {
        const deptRecords = yearRecords.filter(r => r.department === dept);
        const deptPackages = deptRecords.map(r => r.packageLPA);
        
        if (deptPackages.length > 0) {
          console.log(`  ${dept}:`);
          console.log(`    Placements: ${deptRecords.length}`);
          console.log(`    Avg Package: ₹${(deptPackages.reduce((a, b) => a + b) / deptPackages.length).toFixed(2)} LPA`);
          console.log(`    Highest: ₹${Math.max(...deptPackages)} LPA`);
        }
      }
    }

    console.log("\n✨ Data seeding completed successfully!");
    console.log(`\n🎯 Total records created: ${placementRecords.length}`);
    console.log("📍 You can now view the analytics at: /analytics");
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

// Run the seeder
seedPlacementData();
