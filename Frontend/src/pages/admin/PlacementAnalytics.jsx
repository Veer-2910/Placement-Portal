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
    // The role is stored in the userDetails object, not as a separate key
    const userDetailsStr = sessionStorage.getItem("userDetails");
    let role = "";
    
    if (userDetailsStr) {
      try {
        const userDetails = JSON.parse(userDetailsStr);
        role = userDetails.role || "";
      } catch (error) {
        console.error("Error parsing userDetails:", error);
      }
    }
    
    const normalizedRole = role.toLowerCase();
    setUserRole(normalizedRole);
    
    console.log("🔍 Analytics Debug - Raw role from userDetails:", role);
    console.log("🔍 Analytics Debug - Normalized role:", normalizedRole);
    console.log("🔍 Analytics Debug - Should show tables?", normalizedRole === "admin" || normalizedRole === "faculty");
    
    fetchData();
    fetchFilterOptions();
  }, [selectedYear, selectedDepartment, selectedCompany]);

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
      doc.text(`Average Package: ₹${stats.overall.averagePackage} LPA`, 14, 68);
      doc.text(`Highest Package: ₹${stats.overall.highestPackage} LPA`, 14, 74);
    }

    const studentData = filteredPlacements.slice(0, 100).map((p) => [
      p.studentName,
      p.studentId,
      p.department,
      p.companyName,
      `₹${p.packageLPA}`,
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
          <h4 className="alert-heading fw-bold">⚠️ Error</h4>
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
              >
                <BarChart3 size={28} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>Placement Analytics</h4>
                <p className="mb-0 small text-secondary">
                  Academic Year {selectedYear} • Role: <span className="badge bg-info px-2">{userRole || "Not Set"}</span>
                </p>
              </div>
            </div>
            {(userRole === "admin" || userRole === "faculty") && (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3"
                  onClick={exportToExcel}
                  style={{ borderRadius: "8px" }}
                >
                  <FileSpreadsheet size={18} />
                  <span className="d-none d-md-inline">Excel</span>
                </button>
                <button
                  className="btn d-flex align-items-center gap-2 px-3"
                  onClick={exportToPDF}
                  style={{ background: "#0e7490", color: "white", borderRadius: "8px", border: "none" }}
                >
                  <FileText size={18} />
                  <span className="d-none d-md-inline">PDF Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {/* Filters - Available for all users */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px" }}>
            <div className="card-body p-4">
              <div className="row align-items-end g-3">
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-2">
                    <Building2 size={14} className="me-1" />
                    Department
                  </label>
                  <select
                    className="form-select"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={{ borderRadius: "8px", borderColor: "#d1d5db" }}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-2">
                    <Calendar size={14} className="me-1" />
                    Academic Year
                  </label>
                  <select
                    className="form-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{ borderRadius: "8px", borderColor: "#d1d5db" }}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-semibold text-secondary mb-2">
                    <Briefcase size={14} className="me-1" />
                    Company
                  </label>
                  <select
                    className="form-select"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    style={{ borderRadius: "8px", borderColor: "#d1d5db" }}
                  >
                    <option value="">All Companies</option>
                    {availableCompanies.map((company) => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-3 col-md-6">
                  <button
                    className="btn w-100"
                    onClick={() => {
                      setSelectedDepartment("");
                      setSelectedCompany("");
                      fetchData();
                    }}
                    style={{ background: "#f3f4f6", color: "#374151", borderRadius: "8px", border: "none", fontWeight: 600 }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

        {/* Message for Students */}
        {userRole === "student" && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "12px", background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)" }}>
            <div className="card-body p-4 text-center">
              <div className="mb-3">
                <BarChart3 size={48} color="#0e7490" strokeWidth={1.5} />
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#0e7490" }}>Placement Analytics Overview</h5>
              <p className="text-secondary mb-0">
                Use the filters above to explore placement statistics across different years, departments, and companies. Individual student records are available only to faculty and administrators.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {stats && (
          <div className="row g-3 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", borderLeft: "4px solid #8b5cf6" }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-secondary small mb-1 fw-medium">TOTAL STUDENTS</p>
                      <h2 className="mb-0 fw-bold" style={{ fontSize: "2.5rem", color: "#1e293b" }}>
                        {stats.overall.totalStudents}
                      </h2>
                    </div>
                    <div className="p-3 rounded-3" style={{ background: "#f3e8ff" }}>
                      <Users size={28} color="#8b5cf6" strokeWidth={2} />
                    </div>
                  </div>
                  <p className="text-secondary mb-0 small">Registered for placements</p>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", borderLeft: "4px solid #10b981" }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-secondary small mb-1 fw-medium">STUDENTS PLACED</p>
                      <h2 className="mb-0 fw-bold" style={{ fontSize: "2.5rem", color: "#1e293b" }}>
                        {stats.overall.totalPlaced}
                      </h2>
                    </div>
                    <div className="p-3 rounded-3" style={{ background: "#d1fae5" }}>
                      <TrendingUp size={28} color="#10b981" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge px-2 py-1" style={{ background: "#dcfce7", color: "#166534", fontSize: "0.75rem" }}>
                      {stats.overall.placementPercentage}% Success
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", borderLeft: "4px solid #f59e0b" }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-secondary small mb-1 fw-medium">AVERAGE PACKAGE</p>
                      <h2 className="mb-0 fw-bold" style={{ fontSize: "2.5rem", color: "#1e293b" }}>
                        ₹{stats.overall.averagePackage}
                      </h2>
                    </div>
                    <div className="p-3 rounded-3" style={{ background: "#fef3c7" }}>
                      <DollarSign size={28} color="#f59e0b" strokeWidth={2} />
                    </div>
                  </div>
                  <p className="text-secondary mb-0 small">LPA (Lakh per annum)</p>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px", borderLeft: "4px solid #ef4444" }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <p className="text-secondary small mb-1 fw-medium">HIGHEST PACKAGE</p>
                      <h2 className="mb-0 fw-bold" style={{ fontSize: "2.5rem", color: "#1e293b" }}>
                        ₹{stats.overall.highestPackage}
                      </h2>
                    </div>
                    <div className="p-3 rounded-3" style={{ background: "#fee2e2" }}>
                      <Award size={28} color="#ef4444" strokeWidth={2} />
                    </div>
                  </div>
                  <p className="text-secondary mb-0 small">Top placement offer</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        {stats && (
          <div className="row g-4 mb-4">
            {/* Bar Chart */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0" style={{ color: "#1e293b" }}>Department-wise Package Analysis</h5>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.departmentWise} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="department"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          padding: "12px",
                        }}
                        formatter={(value) => [`₹${value} LPA`, "Average Package"]}
                      />
                      <Bar dataKey="averagePackage" fill="#0e7490" radius={[6, 6, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Placement Status</h5>
                  <div style={{ position: "relative", height: "340px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Placed", value: stats.overall.totalPlaced, color: "#10b981" },
                            { name: "Unplaced", value: stats.overall.totalUnplaced || 0, color: "#e5e7eb" },
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={85}
                          outerRadius={125}
                          paddingAngle={2}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {[
                            { name: "Placed", value: stats.overall.totalPlaced, color: "#10b981" },
                            { name: "Unplaced", value: stats.overall.totalUnplaced || 0, color: "#e5e7eb" },
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value, name) => [`${value} students`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#10b981", lineHeight: 1 }}>
                        {stats.overall.totalPlaced}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "8px", fontWeight: 500 }}>
                        Students Placed
                      </div>
                      <div
                        className="mt-2 px-3 py-1 d-inline-block"
                        style={{ background: "#dcfce7", color: "#166534", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        {stats.overall.placementPercentage}% Success
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Performance Cards */}
        {stats && (
          <div className="row g-3 mb-4">
            {stats.departmentWise.map((dept, idx) => {
              const colors = ["#8b5cf6", "#0e7490", "#f59e0b", "#ef4444"];
              const bgColors = ["#f3e8ff", "#cffafe", "#fef3c7", "#fee2e2"];
              return (
                <div key={dept.department} className="col-xl-3 col-md-6">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>{dept.department}</h5>
                        <div className="p-2 rounded-2" style={{ background: bgColors[idx] }}>
                          <Building2 size={20} color={colors[idx]} strokeWidth={2} />
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-baseline mb-2">
                          <span className="small text-secondary">Avg Package</span>
                          <span className="fw-bold fs-5" style={{ color: colors[idx] }}>₹{dept.averagePackage}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-baseline mb-2">
                          <span className="small text-secondary">Highest</span>
                          <span className="fw-semibold">₹{dept.highestPackage}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-baseline mb-2">
                          <span className="small text-secondary">Total</span>
                          <span className="fw-semibold">{dept.totalStudents}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-baseline">
                          <span className="small text-secondary">Placed</span>
                          <span className="badge px-2" style={{ background: "#dcfce7", color: "#166534", fontSize: "0.75rem" }}>
                            {dept.placedStudents} ({dept.placementPercentage}%)
                          </span>
                        </div>
                      </div>
                      <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${dept.placementPercentage}%`,
                            background: colors[idx],
                            borderRadius: "4px",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tables - Only for Faculty and Admin */}
        {(userRole === "admin" || userRole === "faculty") && (
          <div className="row g-4">
            {/* Student Table */}
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Student Placement Records</h5>
                  <div className="table-responsive">
                    <table className="table align-middle" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          <th className="border-0 py-3 px-3 fw-semibold small text-secondary">STUDENT NAME</th>
                          <th className="border-0 py-3 px-3 fw-semibold small text-secondary">ID</th>
                          <th className="border-0 py-3 px-3 fw-semibold small text-secondary">DEPARTMENT</th>
                          <th className="border-0 py-3 px-3 fw-semibold small text-secondary">COMPANY</th>
                          <th className="border-0 py-3 px-3 fw-semibold small text-secondary">ROLE</th>
                          <th className="border-0 py-3 px-3 fw-semibold small text-secondary">PACKAGE</th>
                          <th className="border-0 py-3 px-3 fw-semibold small text-secondary">DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlacements.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center py-5">
                              <div className="text-secondary">No records found</div>
                            </td>
                          </tr>
                        ) : (
                          filteredPlacements.map((p, idx) => (
                            <tr key={p._id} style={{ borderBottom: idx < filteredPlacements.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                              <td className="py-3 px-3 fw-medium" style={{ color: "#1e293b" }}>{p.studentName}</td>
                              <td className="py-3 px-3 text-secondary">{p.studentId}</td>
                              <td className="py-3 px-3">
                                <span className="badge px-2 py-1" style={{ background: "#e0f2fe", color: "#075985", fontSize: "0.75rem" }}>
                                  {p.department}
                                </span>
                              </td>
                              <td className="py-3 px-3" style={{ color: "#475569" }}>{p.companyName}</td>
                              <td className="py-3 px-3 small text-secondary">{p.jobRole}</td>
                              <td className="py-3 px-3 fw-bold" style={{ color: "#10b981" }}>₹{p.packageLPA} LPA</td>
                              <td className="py-3 px-3 small text-secondary">
                                {new Date(p.placementDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {filteredPlacements.length > 0 && (
                      <div className="text-center mt-3 py-2" style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                        <small className="text-secondary fw-semibold">
                          Showing all {filteredPlacements.length} placement records
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Table */}
            {stats && (
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Company Placement Statistics</h5>
                    <div className="table-responsive">
                      <table className="table align-middle" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            <th className="border-0 py-3 px-3 fw-semibold small text-secondary">COMPANY</th>
                            <th className="border-0 py-3 px-3 fw-semibold small text-secondary">PLACEMENTS</th>
                            <th className="border-0 py-3 px-3 fw-semibold small text-secondary">AVG PACKAGE</th>
                            <th className="border-0 py-3 px-3 fw-semibold small text-secondary">HIGHEST</th>
                            <th className="border-0 py-3 px-3 fw-semibold small text-secondary">DEPARTMENTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.companyWise.map((company, idx) => (
                            <tr key={company.companyName} style={{ borderBottom: idx < stats.companyWise.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                              <td className="py-3 px-3 fw-bold" style={{ color: "#1e293b" }}>{company.companyName}</td>
                              <td className="py-3 px-3">
                                <span className="badge px-2 py-1" style={{ background: "#e0f2fe", color: "#075985", fontSize: "0.75rem" }}>
                                  {company.numberOfPlacements} students
                                </span>
                              </td>
                              <td className="py-3 px-3 fw-semibold" style={{ color: "#0e7490" }}>₹{company.averagePackage} LPA</td>
                              <td className="py-3 px-3 fw-bold" style={{ color: "#10b981" }}>₹{company.highestPackage} LPA</td>
                              <td className="py-3 px-3">
                                <div className="d-flex gap-1 flex-wrap">
                                  {company.departments.map((dept) => (
                                    <span key={dept} className="badge px-2 py-1" style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.7rem" }}>
                                      {dept}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
