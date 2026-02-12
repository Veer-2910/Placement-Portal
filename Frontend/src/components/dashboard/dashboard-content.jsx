"use client";

import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCheck, Folder, Building2, GraduationCap, Briefcase, Bell, CheckCircle, Clock, Star, Lightbulb } from "lucide-react";
import { calculateProfileStrength, getStrengthTips } from "../../utils/profile-utils";

export default function DashboardContent({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(user || null);
  const [appsCount, setAppsCount] = useState(0);
  const [activeDrives, setActiveDrives] = useState(0);

  const [error, setError] = useState("");
  const navigate = useNavigate();



  const normalizeProfile = (data) => {
    if (!data) return null;
    const p = { ...data };
    p.fullName = data.fullName || data.name || data.displayName || "Student";
    p.enrollment =
      data.studentId ||
      data.enrollmentNo ||
      data.enrollmentNumber ||
      data.enrollment ||
      data.rollNumber ||
      "";
    p.email =
      data.universityEmail ||
      data.email1 ||
      data.email ||
      data.personalEmail ||
      "";
    p.institute = data.institute || data.instituteName || "";
    p.branch = data.branch || data.department || data.program || "";
    p.semester = data.semester || "";
    p.academicYear = data.academicYear || "";
    p.cgpa = data.cgpa || "";
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
          `http://localhost:5000/api/auth/student/profile/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(normalizeProfile(profileRes.data));

        // Fetch Applications
        const appsRes = await axios.get("http://localhost:5000/api/drives/student/my-applications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppsCount(appsRes.data.length);

        // Fetch Drives
        const drivesRes = await axios.get("http://localhost:5000/api/drives", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveDrives(drivesRes.data.length);



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

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-danger">{error}</div>;
  if (!profile) return <div className="p-4 text-center">No data found.</div>;

  const actionCardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
  };

  const actionButtonStyle = {
    backgroundColor: "#34495e",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "500",
  };

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      {/* Welcome Banner - Professional Gradient */}
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
          <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2">STUDENT PORTAL</p>
          <h1 className="dash-title display-6 fw-bold text-dark mb-2">
            Welcome back, {profile.fullName?.split(" ")[0] || "Student"}
          </h1>
          <p className="text-secondary fs-5 mb-4" style={{maxWidth: '600px'}}>
            Track your placement journey, manage resources, and stay updated with the latest announcements.
          </p>

          <div className="profile-strength-tip bg-white p-3 rounded-4 shadow-sm border border-light-subtle d-inline-flex align-items-center gap-3 mb-4">
             <div className="flex-shrink-0 position-relative" style={{width: 50, height: 50}}>
                <svg viewBox="0 0 36 36" className="w-100 h-100">
                  <path className="text-light-subtle" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-primary" strokeDasharray={`${calculateProfileStrength(profile)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="position-absolute top-50 start-50 translate-middle small fw-bold text-dark">{calculateProfileStrength(profile)}%</div>
             </div>
             <div>
                <h6 className="mb-1 fw-bold text-dark d-flex align-items-center gap-2">
                  <Lightbulb size={16} className="text-warning" /> 
                  {calculateProfileStrength(profile) < 100 ? "Boost Your Profile" : "Profile Perfected"}
                </h6>
                <p className="text-secondary small mb-0">
                  {getStrengthTips(calculateProfileStrength(profile))}
                </p>
             </div>
          </div>
          
          <div className="d-flex flex-wrap gap-3">
             <div className="d-inline-flex align-items-center bg-white px-3 py-2 rounded-pill shadow-sm border border-light">
                <span className="badge bg-primary-subtle text-primary rounded-pill me-2">ID</span>
                <span className="fw-medium text-dark">{profile.enrollment || "N/A"}</span>
             </div>
             <div className="d-inline-flex align-items-center bg-white px-3 py-2 rounded-pill shadow-sm border border-light">
                <span className="badge bg-info-subtle text-info rounded-pill me-2">Sem</span>
                <span className="fw-medium text-dark">{profile.semester || "N/A"}</span>
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
        {/* Journey Stats */}
        <div className="col-12">
            <div className="row g-4 mb-2">
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-primary-subtle text-primary rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <Briefcase size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">{activeDrives}</h3>
                            <p className="text-secondary small mb-0 fw-bold text-uppercase">Active Drives</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-info-subtle text-info rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <Clock size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">{appsCount}</h3>
                            <p className="text-secondary small mb-0 fw-bold text-uppercase">Applications</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-emerald-subtle text-emerald-600 rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <CheckCircle size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">{profile.status === 'Placed' ? 'Placed' : 'Active'}</h3>
                            <p className="text-secondary small mb-0 fw-bold text-uppercase">Current Status</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-amber-subtle text-amber-600 rounded-circle p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                                <Bell size={24} />
                            </div>
                            <h3 className="fw-bold text-dark mb-1">New</h3>
                            <p className="text-secondary small mb-0 fw-bold text-uppercase">Latest Updates</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>




      </div>
    </div>
  );
}
