import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = sessionStorage.getItem("employerToken");
      const response = await axios.delete(
        `http://localhost:5000/api/employer/jobs/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(response.data.message);
        fetchJobs();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete job");
    }
  };

  const handleToggleActive = async (jobId, currentStatus) => {
    const action = currentStatus ? "stop" : "start";
    if (!confirm(`Are you sure you want to ${action} this drive? Students ${currentStatus ? "won't" : "will"} be able to apply.`)) return;

    try {
      const token = sessionStorage.getItem("employerToken");
      const response = await axios.patch(
        `http://localhost:5000/api/employer/jobs/${jobId}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(response.data.message);
        fetchJobs(); // Refresh jobs list
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to toggle drive status");
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
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Manage Jobs</h2>
          <p className="text-secondary mb-0">View and manage your job postings</p>
        </div>
        <Link to="/employer/jobs/new" className="btn btn-primary px-4">
          + Post New Job
        </Link>
      </div>

      {/* Jobs List */}
      <div className="row g-4">
        {jobs.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 text-center p-5">
              <h3 className="fw-bold text-dark mb-2">No jobs found</h3>
              <p className="text-secondary mb-3">Start by posting your first job opportunity</p>
              <Link to="/employer/jobs/new" className="btn btn-primary">
                Post Job
              </Link>
            </div>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4 hover-lift">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">{job.title}</h4>
                      <p className="text-secondary mb-0">{job.companyName}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      {/* Drive Status Toggle */}
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${job.active ? 'bg-success' : 'bg-secondary'} px-3 py-2`}>
                          {job.active ? '● Live' : '○ Stopped'}
                        </span>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={job.active}
                            onChange={() => handleToggleActive(job._id, job.active)}
                            style={{ cursor: 'pointer', width: '3rem', height: '1.5rem' }}
                          />
                        </div>
                      </div>
                      {job.stagesEnabled && (
                        <span className="badge bg-primary rounded-pill px-3 py-2">
                          Stage-Based Recruitment
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mb-3 pb-3 border-bottom">
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <span>💼</span>
                        <span className="text-secondary small">{job.jobType}</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <span>📍</span>
                        <span className="text-secondary small">{job.location}</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <span>💰</span>
                        <span className="text-secondary small">{job.ctc}</span>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <span>🏢</span>
                        <span className="text-secondary small">{job.workMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3 text-secondary small">
                    <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                    <span>Deadline: {new Date(job.endDate).toLocaleDateString()}</span>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <Link to={`/employer/jobs/${job._id}/applicants`} className="btn btn-primary btn-sm px-3">
                      View Applicants
                    </Link>
                    {job.stagesEnabled && (
                      <Link to={`/employer/jobs/${job._id}/upload-results`} className="btn btn-success btn-sm px-3">
                        📊 Upload Results
                      </Link>
                    )}
                    <button onClick={() => navigate(`/employer/jobs/${job._id}/edit`)} className="btn btn-outline-secondary btn-sm px-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(job._id)} className="btn btn-outline-danger btn-sm px-3">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          border: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-outline-secondary {
          border-color: #cbd5e1;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .btn-outline-secondary:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #475569;
          transform: translateY(-1px);
        }

        .btn-outline-danger {
          border-color: #fecaca;
          color: #dc2626;
          transition: all 0.2s ease;
        }

        .btn-outline-danger:hover {
          background-color: #fef2f2;
          border-color: #f87171;
          color: #b91c1c;
          transform: translateY(-1px);
        }

        .badge {
          font-weight: 600;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default ManageJobs;

