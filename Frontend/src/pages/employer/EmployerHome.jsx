import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const EmployerHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      const employerData = JSON.parse(sessionStorage.getItem("employer"));

      if (!token) {
        navigate("/employer/login");
        return;
      }

      setEmployer(employerData);

      // Fetch stats
      const response = await axios.get("http://localhost:5000/api/employer/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("employerToken");
        localStorage.removeItem("employer");
        navigate("/employer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Welcome Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold text-dark mb-1">Welcome back, {employer?.contactPerson?.name}!</h2>
            <p className="text-secondary mb-0">Manage your job postings and track applications</p>
          </div>
          <span className={`badge ${employer?.verificationStatus === 'Verified' ? 'bg-success' : employer?.verificationStatus === 'Pending' ? 'bg-warning' : 'bg-danger'} fs-6 px-3 py-2`}>
            {employer?.verificationStatus}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="fs-3">📋</span>
                </div>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{stats?.totalJobsPosted || 0}</h3>
                  <p className="text-secondary mb-0 small">Total Jobs Posted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 me-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="fs-3">✅</span>
                </div>
                <div>
                  <h3 className="fw-bold text-success mb-0">{stats?.activeJobs || 0}</h3>
                  <p className="text-secondary mb-0 small">Active Jobs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 me-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="fs-3">⏳</span>
                </div>
                <div>
                  <h3 className="fw-bold text-warning mb-0">{stats?.pendingApproval || 0}</h3>
                  <p className="text-secondary mb-0 small">Pending Approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 me-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="fs-3">📨</span>
                </div>
                <div>
                  <h3 className="fw-bold text-info mb-0">{stats?.totalApplications || 0}</h3>
                  <p className="text-secondary mb-0 small">Total Applications</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 me-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="fs-3">⭐</span>
                </div>
                <div>
                  <h3 className="fw-bold text-primary mb-0">{stats?.shortlisted || 0}</h3>
                  <p className="text-secondary mb-0 small">Shortlisted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 me-3" style={{ width: "60px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="fs-3">🎯</span>
                </div>
                <div>
                  <h3 className="fw-bold text-success mb-0">{stats?.selected || 0}</h3>
                  <p className="text-secondary mb-0 small">Selected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-3">Quick Actions</h4>
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <Link to="/employer/jobs/new" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift text-center">
                <div className="card-body p-4">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 mx-auto mb-3" style={{ width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="fs-2">➕</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Post New Job</h5>
                  <p className="text-secondary small mb-0">Create a new job posting</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/employer/jobs" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift text-center">
                <div className="card-body p-4">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 mx-auto mb-3" style={{ width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="fs-2">📋</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Manage Jobs</h5>
                  <p className="text-secondary small mb-0">View and edit your postings</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/employer/students" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift text-center">
                <div className="card-body p-4">
                  <div className="bg-info bg-opacity-10 text-info rounded-circle p-3 mx-auto mb-3" style={{ width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="fs-2">👥</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Browse Students</h5>
                  <p className="text-secondary small mb-0">Find talented candidates</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-6 col-lg-3">
            <Link to="/employer/profile" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 h-100 hover-lift text-center">
                <div className="card-body p-4">
                  <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 mx-auto mb-3" style={{ width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="fs-2">⚙️</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Company Profile</h5>
                  <p className="text-secondary small mb-0">Update company information</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default EmployerHome;
