"use client";

import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCheck, Folder, Building2, GraduationCap, Users, Briefcase, Bell, LayoutDashboard, PieChart, TrendingUp, Users2 } from "lucide-react";
import Skeleton from "../ui/Skeleton";

export default function FacultyDashboardContent({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(user || null);
  const [stats, setStats] = useState(null);
  const [driveCount, setDriveCount] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const normalizeProfile = (data) => {
    if (!data) return null;
    const p = { ...data };
    p.fullName = data.fullName || data.name || data.displayName || "Faculty";
    p.employeeId = data.employeeId || data.staffId || data.facultyId || "";
    p.email = data.universityEmail || data.email || data.officialEmail || "";
    p.institute = data.institute || data.instituteName || "";
    p.department = data.department || data.dept || "";
    p.designation = data.designation || "";
    return p;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        
        // Fetch Profile
        const profileRes = await axios.get(
          `http://localhost:5000/api/faculty/profile/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(normalizeProfile(profileRes.data));

        // Fetch Student Stats
        const statsRes = await axios.get("http://localhost:5000/api/students/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);

        // Fetch Drive Count
        const drivesRes = await axios.get("http://localhost:5000/api/drives/faculty", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDriveCount(drivesRes.data.length);

      } catch (err) {
        console.error("Dashboard data load failed:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data."
        );
        setProfile(normalizeProfile(user));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="dash-container bg-transparent p-0 border-0">
        <Skeleton height="200px" borderRadius="24px" className="mb-4" />
        <div className="row g-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="col-md-3">
              <Skeleton height="150px" borderRadius="16px" />
            </div>
          ))}
          <div className="col-12 mt-4">
            <Skeleton height="300px" borderRadius="24px" />
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="p-4 text-center text-danger">{error}</div>;
  if (!profile) return <div className="p-4 text-center">No data found.</div>;

  // const actionCardStyle = {
  //   backgroundColor: "#ffffff",
  //   borderRadius: "12px",
  //   border: "1px solid #e0e0e0",
  // };

  // const actionButtonStyle = {
  //   backgroundColor: "#34495e",
  //   color: "#ffffff",
  //   border: "none",
  //   borderRadius: "8px",
  //   fontWeight: "500",
  // };

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      {/* Welcome Banner - Professional Gradient */}
      <div 
        className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
        style={{ 
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)", 
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)"
        }}
      >
        <div className="position-relative z-1">
          <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2">FACULTY PORTAL</p>
          <h1 className="dash-title display-6 fw-bold text-dark mb-2">
            Welcome back, {profile.fullName?.split(" ")[0] || "Faculty"}
          </h1>
          <p className="text-secondary fs-5 mb-4" style={{maxWidth: '600px'}}>
            Manage resources, track student progress, and oversee placement activities.
          </p>
          
          <div className="d-flex flex-wrap gap-3">
             <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill shadow-sm border border-white" style={{ background: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(10px)" }}>
                <span className="badge bg-primary-subtle text-primary rounded-pill me-2">ID</span>
                <span className="fw-medium text-dark">{profile.employeeId || "N/A"}</span>
             </div>
             <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill shadow-sm border border-white" style={{ background: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(10px)" }}>
                <span className="badge bg-info-subtle text-info rounded-pill me-2">Dept</span>
                <span className="fw-medium text-dark">{profile.department || "N/A"}</span>
             </div>
          </div>
        </div>
        {/* Abstract Background Decoration */}
        <div className="position-absolute top-0 end-0 h-100 w-50 d-none d-md-block" 
             style={{ 
               background: "radial-gradient(circle at 70% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 70%)",
               opacity: 0.7
             }} 
        />
      </div>

      <div className="row g-4">
        {/* Statistics Widgets */}
        <div className="col-12">
            <div className="row g-4 mb-2">
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-primary-subtle text-primary rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <Users size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">{stats?.total || 0}</h3>
                            <p className="text-secondary small mb-0 fw-bold">TOTAL STUDENTS</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-info-subtle text-info rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <Briefcase size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">{driveCount}</h3>
                            <p className="text-secondary small mb-0 fw-bold">MANAGED DRIVES</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-emerald-subtle text-emerald-600 rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <UserCheck size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">{(stats?.statusWise?.Placed || 0) + (stats?.statusWise?.Interning || 0)}</h3>
                            <p className="text-secondary small mb-0 fw-bold">PLACED / INTERNING</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-amber-subtle text-amber-600 rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <Bell size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">Live</h3>
                            <p className="text-secondary small mb-0 fw-bold">ANNOUNCEMENTS</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>




      </div>
    </div>
  );
}
