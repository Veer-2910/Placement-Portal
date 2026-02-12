import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const adminData = JSON.parse(localStorage.getItem("admin"));

      if (!token) {
        navigate("/admin/login");
        return;
      }

      setAdmin(adminData);

      // Fetch system stats
      const response = await axios.get("http://localhost:5000/api/admin/stats/system", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    localStorage.removeItem("userRole");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="admin-info">
            <h1>Admin Portal</h1>
            <p>{admin?.fullName} - {admin?.designation}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Welcome back, {admin?.fullName}!</h2>
          <p>Manage the entire placement system from here</p>
        </section>

        {/* Pending Approvals Alert */}
        {(stats?.employers?.pending > 0 || stats?.jobs?.pending > 0) && (
          <div className="alert-banner">
            <span className="icon">⚠️</span>
            <div>
              <strong>Pending Approvals</strong>
              <p>
                {stats.employers.pending > 0 && `${stats.employers.pending} employer(s) `}
                {stats.employers.pending > 0 && stats.jobs.pending > 0 && "and "}
                {stats.jobs.pending > 0 && `${stats.jobs.pending} job(s) `}
                awaiting your review
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card students">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats?.students?.total || 0}</h3>
              <p>Total Students</p>
              <div className="stat-details">
                <span>Placed: {stats?.students?.placed || 0}</span>
                <span>Interning: {stats?.students?.interning || 0}</span>
              </div>
            </div>
          </div>

          <div className="stat-card employers">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>{stats?.employers?.total || 0}</h3>
              <p>Verified Employers</p>
              {stats?.employers?.pending > 0 && (
                <div className="stat-badge pending">
                  {stats.employers.pending} Pending
                </div>
              )}
            </div>
          </div>

          <div className="stat-card jobs">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>{stats?.jobs?.total || 0}</h3>
              <p>Active Jobs</p>
              {stats?.jobs?.pending > 0 && (
                <div className="stat-badge pending">
                  {stats.jobs.pending} Pending
                </div>
              )}
            </div>
          </div>

          <div className="stat-card applications">
            <div className="stat-icon">📨</div>
            <div className="stat-content">
              <h3>{stats?.applications?.total || 0}</h3>
              <p>Total Applications</p>
              <div className="stat-details">
                <span>Selected: {stats?.applications?.selected || 0}</span>
                <span>Shortlisted: {stats?.applications?.shortlisted || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button
              onClick={() => navigate("/admin/employers/verify")}
              className="action-card"
            >
              <div className="action-icon">✅</div>
              <h4>Verify Employers</h4>
              <p>Review and approve employer registrations</p>
              {stats?.employers?.pending > 0 && (
                <span className="action-badge">{stats.employers.pending}</span>
              )}
            </button>

            <button
              onClick={() => navigate("/admin/jobs/approve")}
              className="action-card"
            >
              <div className="action-icon">📋</div>
              <h4>Approve Jobs</h4>
              <p>Review and approve job postings</p>
              {stats?.jobs?.pending > 0 && (
                <span className="action-badge">{stats.jobs.pending}</span>
              )}
            </button>

            <button
              onClick={() => navigate("/admin/employers")}
              className="action-card"
            >
              <div className="action-icon">🏢</div>
              <h4>Manage Employers</h4>
              <p>View and manage all employers</p>
            </button>

            <button
              onClick={() => navigate("/admin/jobs")}
              className="action-card"
            >
              <div className="action-icon">💼</div>
              <h4>Manage Jobs</h4>
              <p>View and manage all job postings</p>
            </button>

            <button
              onClick={() => navigate("/admin/analytics")}
              className="action-card"
            >
              <div className="action-icon">📊</div>
              <h4>System Analytics</h4>
              <p>View placement statistics and reports</p>
            </button>

            <button
              onClick={() => navigate("/admin/profile")}
              className="action-card"
            >
              <div className="action-icon">⚙️</div>
              <h4>Profile Settings</h4>
              <p>Update your admin profile</p>
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f5f7fa;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-info h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
        }

        .admin-info p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .btn-logout {
          padding: 0.5rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.3s;
        }

        .btn-logout:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .welcome-section {
          margin-bottom: 2rem;
        }

        .welcome-section h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .welcome-section p {
          color: #666;
        }

        .alert-banner {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .alert-banner .icon {
          font-size: 1.5rem;
        }

        .alert-banner strong {
          display: block;
          color: #92400e;
          margin-bottom: 0.25rem;
        }

        .alert-banner p {
          margin: 0;
          color: #92400e;
          font-size: 0.9rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-content h3 {
          margin: 0;
          font-size: 2rem;
          color: #0ea5e9;
        }

        .stat-content p {
          margin: 0.25rem 0 0 0;
          color: #666;
          font-size: 0.9rem;
        }

        .stat-details {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #888;
        }

        .stat-badge {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .stat-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .quick-actions h3 {
          color: #333;
          margin-bottom: 1.5rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .action-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          text-align: center;
          position: relative;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .action-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .action-card h4 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .action-card p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .action-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0ea5e9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
