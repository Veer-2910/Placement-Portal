import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  TrendingUp,
  Users,
  Building2,
  Award,
  Filter,
  FileSpreadsheet,
  FileText,
  Briefcase,
  Target,
  DollarSign,
  BarChart3,
  Calendar,
} from "lucide-react";

export default function PlacementAnalytics() {
  const [stats, setStats] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [availableYears, setAvailableYears] = useState([2023, 2024, 2025]);
  const [availableCompanies, setAvailableCompanies] = useState([]);

  const departments = ["CE", "CSE", "IT", "AI/ML"];

  useEffect(() => {
    // Get user role from sessionStorage
    const role = sessionStorage.getItem("role") || "";
    setUserRole(role.toLowerCase());
    
    fetchData();
    fetchFilterOptions();
  }, [selectedYear]);

  const fetchFilterOptions = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const [yearsRes, companiesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/placements/years", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/placements/companies", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (yearsRes.data.success) setAvailableYears(yearsRes.data.years);
      if (companiesRes.data.success) setAvailableCompanies(companiesRes.data.companies);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const [statsRes, placementsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/placements/stats?year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/placements?year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data);
      if (placementsRes.data.success) setPlacements(placementsRes.data.placements);
    } catch (err) {
      setError("Failed to load placement data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlacements = placements.filter((p) => {
    if (selectedDepartment && p.department !== selectedDepartment) return false;
    if (selectedCompany && p.companyName !== selectedCompany) return false;
    return true;
  });

  const exportToExcel = () => {
    const data = filteredPlacements.map((p) => ({
      "Student Name": p.studentName,
      "Student ID": p.studentId,
      Department: p.department,
      Company: p.companyName,
      "Job Role": p.jobRole,
      "Package (LPA)": p.packageLPA,
      Year: p.placementYear,
      Date: new Date(p.placementDate).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placements");
    XLSX.writeFile(wb, `Placement_Report_${selectedYear}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("Placement Analytics Report", 14, 22);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Academic Year: ${selectedYear}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    if (stats) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Summary Statistics", 14, 48);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Students: ${stats.overall.totalStudents}`, 14, 56);
      doc.text(`Students Placed: ${stats.overall.totalPlaced} (${stats.overall.placementPercentage}%)`, 14, 62);
      doc.text(`Average Package: â‚¹${stats.overall.averagePackage} LPA`, 14, 68);
      doc.text(`Highest Package: â‚¹${stats.overall.highestPackage} LPA`, 14, 74);
    }

    const studentData = filteredPlacements.slice(0, 100).map((p) => [
      p.studentName,
      p.studentId,
      p.department,
      p.companyName,
      `â‚¹${p.packageLPA}`,
    ]);

    doc.autoTable({
      head: [["Student Name", "ID", "Department", "Company", "Package"]],
      body: studentData,
      startY: 85,
      headStyles: { fillColor: [14, 116, 144], fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`Placement_Analytics_${selectedYear}.pdf`);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div className="spinner-border" role="status" style={{ width: "4rem", height: "4rem", color: "#0e7490" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-4 text-secondary fs-5 fw-medium">Loading Analytics Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-5">
        <div className="alert alert-danger rounded-4 p-4 border-0 shadow-sm">
          <h4 className="alert-heading fw-bold">âš ï¸ Error</h4>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 100 }}>
        <div className="container-fluid px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{ background: "linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)", width: "48px", height: "48px" }}
