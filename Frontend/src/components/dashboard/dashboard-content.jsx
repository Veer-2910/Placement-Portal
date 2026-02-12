"use client";

import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserCheck, Folder, Building2, GraduationCap, Briefcase, Bell, CheckCircle, Clock, Star, Lightbulb } from "lucide-react";
import { calculateProfileStrength, getStrengthTips } from "../../utils/profile-utils";

export default function DashboardContent({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(user || null);
  const [stats, setStats] = useState({
    applications: 0,
    activeDrives: 0,
    shortlisted: 0,
    interviews: 0
  });

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
        const applications = appsRes.data;
        
        // Calculate dynamic stats
        const shortlistedCount = applications.filter(app => 
          ['Shortlisted', 'Interview Scheduled', 'Selected'].includes(app.status)
        ).length;
        
        const interviewCount = applications.filter(app => 
          app.status === 'Interview Scheduled'
        ).length;

        // Fetch Drives
        const drivesRes = await axios.get("http://localhost:5000/api/drives", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats({
          applications: applications.length,
          shortlisted: shortlistedCount,
          interviews: interviewCount,
          activeDrives: drivesRes.data.length
        });

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

  return (
    <div className="bg-transparent" style={{ minHeight: "100%" }}>
      {/* Welcome Hero Section */}
      <div className="mb-5 p-5 rounded-4 position-relative overflow-hidden shadow-sm" style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)", 
        border: "1px solid #dbeafe" 
      }}>
        <div className="position-relative z-1">
          <div className="d-flex align-items-center gap-3 mb-3">
             <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary border border-primary-subtle">
                <UserCheck size={28} strokeWidth={2.5} />
             </div>
             <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider" style={{fontSize: '0.75rem'}}>
                Student Dashboard
             </span>
          </div>
          <h1 className="display-5 fw-bold text-dark mb-2">
            Welcome back, <span className="text-primary">{profile.fullName.split(' ')[0]}</span>!
          </h1>
          <p className="lead text-secondary mb-4" style={{maxWidth: "600px"}}>
            Your gateway to career opportunities. Track applications, explore drives, and manage your profile efficiently.
          </p>
          
          <div className="d-flex flex-wrap gap-3">
             <Link to="/student-dashboard/profile" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-medium d-flex align-items-center gap-2">
                <UserCheck size={18} /> Complete Profile
             </Link>
             <Link to="/student-dashboard/drives" className="btn btn-white bg-white text-primary border border-primary-subtle px-4 py-2 rounded-pill shadow-sm fw-medium d-flex align-items-center gap-2">
                <Building2 size={18} /> Browse Drives
             </Link>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="position-absolute end-0 top-0 h-100 w-50 d-none d-lg-block" style={{opacity: 0.1}}>
           <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-100 w-100">
             <path fill="#0EA5E9" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.4,82.2,23.1,70.6,33.5C59,43.9,47.1,51.1,35.4,56.8C23.7,62.5,12.2,66.7,0.4,66C-11.4,65.3,-23.1,59.7,-34.4,53.7C-45.7,47.7,-56.6,41.3,-64.8,32.3C-73,23.3,-78.5,11.7,-78.3,0.3C-78.1,-11.1,-72.2,-22.2,-63.5,-30.9C-54.8,-39.6,-43.3,-45.9,-32.1,-54.6C-20.9,-63.3,-10.1,-74.4,2.3,-78.4C14.7,-82.4,29.4,-79.3,30.5,-83.6L44.7,-76.4Z" transform="translate(100 100)" />
           </svg>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
           <div className="d-flex align-items-center mb-4">
             <div className="bg-warning bg-opacity-10 p-2 rounded-circle text-warning me-3">
                <Lightbulb size={24} fill="currentColor" />
             </div>
             <h4 className="fw-bold text-dark mb-0">Quick Actions</h4>
           </div>
           
           <div className="row g-4">
              {[
                { 
                  title: "View Drives", 
                  desc: "Explore active placement drives", 
                  icon: <Building2 className="text-primary" size={24} />,
                  link: "/student-dashboard/drives",
                  color: "primary",
                  bgColor: "#eff6ff", // blue-50
                  borderColor: "#dbeafe"
                },
                { 
                  title: "My Applications", 
                  desc: "Track your application status", 
                  icon: <Briefcase className="text-info" size={24} />,
                  link: "/student-dashboard/applications",
                  color: "info",
                  bgColor: "#ecfeff", // cyan-50
                  borderColor: "#cffafe"
                },
                { 
                  title: "Resources", 
                  desc: "Access study materials", 
                  icon: <Folder className="text-warning" size={24} />,
                  link: "/student-dashboard/resources",
                  color: "warning",
                  bgColor: "#fffbeb", // amber-50
                  borderColor: "#fef3c7"
                },
                { 
                   title: "Profile", 
                   desc: "Update your resume & details", 
                   icon: <UserCheck className="text-success" size={24} />,
                   link: "/student-dashboard/profile",
                   color: "success",
                   bgColor: "#f0fdf4", // green-50
                   borderColor: "#dcfce7"
                 }
              ].map((action, idx) => (
                <div key={idx} className="col-md-6">
                   <Link to={action.link} className="text-decoration-none d-block h-100">
                     <div 
                        className="card h-100 p-4 border-0 shadow-sm hover-lift position-relative overflow-hidden" 
                        style={{
                           background: `linear-gradient(135deg, #ffffff 0%, ${action.bgColor} 100%)`,
                           borderRadius: "16px",
                           border: `1px solid ${action.borderColor}`
                        }}
                     >
                        <div className={`position-absolute top-0 end-0 p-3 opacity-25 text-${action.color}`}>
                           {action.icon}
                        </div>
                        <div className="d-flex flex-column h-100 position-relative z-1">
                           <div className={`mb-3 p-3 rounded-3 bg-white shadow-sm w-auto d-inline-block text-${action.color} border border-${action.color}-subtle`}>
                              {action.icon}
                           </div>
                           <h5 className="fw-bold text-dark mb-1">{action.title}</h5>
                           <p className="text-secondary small mb-0 text-truncate">{action.desc}</p>
                        </div>
                     </div>
                   </Link>
                </div>
              ))}
           </div>
        </div>

        <div className="col-lg-4">
           {/* Profile Strength Card */}
           <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{
              background: "white",
              border: "1px solid #e0f2fe"
           }}>
              <div className="card-body p-4 d-flex flex-column h-100">
                 <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-dark mb-0">Profile Strength</h5>
                    <Star className="text-warning" fill="currentColor" size={24} />
                 </div>
                 
                 <div className="text-center py-3 mb-4 flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="position-relative d-inline-block">
                       <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
                          <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                          <circle 
                             cx="60" cy="60" r="54" 
                             fill="none" 
                             stroke="#fbbf24" 
                             strokeWidth="10"
                             strokeDasharray="339.292"
                             strokeDashoffset={339.292 - (339.292 * calculateProfileStrength(profile)) / 100}
                             strokeLinecap="round"
                             style={{transition: "stroke-dashoffset 1s ease-in-out"}}
                          />
                       </svg>
                       <div className="position-absolute top-50 start-50 translate-middle text-center">
                          <span className="display-6 fw-bold text-dark mb-0 d-block">{calculateProfileStrength(profile)}%</span>
                       </div>
                    </div>
                 </div>
                 
                 <div>
                    <h6 className="fw-bold mb-3 small text-uppercase text-secondary tracking-wide">
                       Suggestions
                    </h6>
                    <div className="d-flex flex-column gap-2">
                       {getStrengthTips(profile).slice(0, 3).map((tip, i) => (
                          <div key={i} className="d-flex align-items-center gap-3 bg-light rounded-3 p-2 border border-light-subtle">
                             <div className="bg-white p-1 rounded-circle text-success shadow-sm flex-shrink-0">
                                <CheckCircle size={14} />
                             </div>
                             <span className="text-dark small fw-medium text-truncate">{tip}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <h5 className="fw-bold text-dark mb-4 px-1">Overview</h5>
      <div className="row g-4 mb-2">
          <div className="col-md-6 col-xl-3">
             <div className="card h-100 p-4 card-ocean-white hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-3">
                   <div className="bg-blue-50 p-3 rounded-4 text-primary border border-blue-100">
                      <Briefcase size={24} strokeWidth={2} />
                   </div>
                   {stats.applications > 0 && (
                      <span className="badge bg-green-50 text-success border border-green-100 rounded-pill px-3 py-2 fw-bold">Active</span>
                   )}
                </div>
                <h2 className="fw-bold text-dark mb-1 display-5">{stats.applications}</h2>
                <p className="text-secondary small mb-0 fw-bold text-uppercase tracking-wide">Total Applications</p>
             </div>
          </div>
          
          <div className="col-md-6 col-xl-3">
             <div className="card h-100 p-4 card-ocean-white hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-3">
                   <div className="bg-cyan-50 p-3 rounded-4 text-info border border-cyan-100">
                      <Building2 size={24} strokeWidth={2} />
                   </div>
                   <span className="badge bg-blue-50 text-primary border border-blue-100 rounded-pill px-3 py-2 fw-bold">Active</span>
                </div>
                <h2 className="fw-bold text-dark mb-1 display-5">{stats.activeDrives}</h2>
                <p className="text-secondary small mb-0 fw-bold text-uppercase tracking-wide">Placement Drives</p>
             </div>
          </div>
          
          <div className="col-md-6 col-xl-3">
             <div className="card h-100 p-4 card-ocean-white hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-3">
                   <div className="bg-purple-50 p-3 rounded-4 text-purple border border-purple-100" style={{color: '#9333ea', backgroundColor: '#f3e8ff', borderColor: '#e9d5ff'}}>
                      <CheckCircle size={24} strokeWidth={2} />
                   </div>
                </div>
                <h2 className="fw-bold text-dark mb-1 display-5">{stats.shortlisted}</h2>
                <p className="text-secondary small mb-0 fw-bold text-uppercase tracking-wide">Shortlisted</p>
             </div>
          </div>

          <div className="col-md-6 col-xl-3">
             <div className="card h-100 p-4 card-ocean-white hover-lift">
                <div className="d-flex align-items-center justify-content-between mb-3">
                   <div className="bg-orange-50 p-3 rounded-4 text-orange border border-orange-100" style={{color: '#ea580c', backgroundColor: '#ffedd5', borderColor: '#fed7aa'}}>
                      <Clock size={24} strokeWidth={2} />
                   </div>
                </div>
                <h2 className="fw-bold text-dark mb-1 display-5">{stats.interviews}</h2>
                <p className="text-secondary small mb-0 fw-bold text-uppercase tracking-wide">Upcoming Interviews</p>
             </div>
          </div>
      </div>
      
      <style jsx>{`
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important; }
        .card-ocean { background: linear-gradient(135deg, #f8fcff 0%, #eff6ff 100%); border: 1px solid #dbeafe; }
        .card-ocean-white { background: white; border: 1px solid #e0f2fe; }
      `}</style>
    </div>
  );
}
