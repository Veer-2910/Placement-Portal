import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }

      let url = "http://localhost:5000/api/employer/jobs";
      if (filter !== "all") {
        url += `?status=${filter}`;
      }

      const response = await axios.get(url, {
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

  const getStatusBadge = (status) => {
    const badges = {
      Pending: { color: "#f59e0b", text: "Pending Approval" },
      Approved: { color: "#10b981", text: "Approved" },
      Rejected: { color: "#ef4444", text: "Rejected" }
    };
    const badge = badges[status] || badges.Pending;
    return <span className="status-badge" style={{ background: badge.color }}>{badge.text}</span>;
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">Manage Jobs</h2>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <button
          className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"} rounded-pill`}
          onClick={() => setFilter("all")}
        >
          All Jobs ({jobs.length})
        </button>
        <button
          className={`btn ${filter === "Approved" ? "btn-success" : "btn-outline-success"} rounded-pill`}
          onClick={() => setFilter("Approved")}
        >
          Approved
        </button>
        <button
          className={`btn ${filter === "Pending" ? "btn-warning" : "btn-outline-warning"} rounded-pill`}
          onClick={() => setFilter("Pending")}
        >
          Pending
        </button>
        <button
          className={`btn ${filter === "Rejected" ? "btn-danger" : "btn-outline-danger"} rounded-pill`}
          onClick={() => setFilter("Rejected")}
        >
          Rejected
        </button>
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
                    {getStatusBadge(job.approvalStatus)}
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

                  {job.rejectionReason && (
                    <div className="alert alert-danger mb-3">
                      <strong>Rejection Reason:</strong> {job.rejectionReason}
                    </div>
                  )}

                  <div className="d-flex gap-2 flex-wrap">
                    <Link to={`/employer/jobs/${job._id}/applicants`} className="btn btn-sm btn-primary">
                      View Applicants
                    </Link>
                    <button onClick={() => navigate(`/employer/jobs/${job._id}/edit`)} className="btn btn-sm btn-success">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(job._id)} className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ManageJobs;
