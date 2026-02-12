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
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">Manage Jobs</h2>
          <p className="text-secondary mb-0">View, track, and manage all your job postings</p>
        </div>
        <Link to="/employer/jobs/new" className="btn px-4 py-2 d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none' }}>
          <span className="fs-5">+</span> Post New Job
        </Link>
      </div>

      {/* Jobs List */}
      <div className="row g-4">
        {jobs.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 text-center p-5 bg-light">
              <div className="mb-3 text-secondary opacity-50">
                <span style={{ fontSize: '4rem' }}>💼</span>
              </div>
              <h3 className="fw-bold text-dark mb-2">No jobs found</h3>
              <p className="text-secondary mb-4">Start by posting your first job opportunity to find great talent.</p>
              <Link to="/employer/jobs/new" className="btn px-4 py-2" style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none' }}>
                Post Job
              </Link>
            </div>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4 hover-lift transition-all overflow-hidden">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">{job.title}</h4>
                      <p className="text-secondary mb-0 fw-medium">{job.companyName}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      {/* Drive Status Toggle */}
                      <div className="d-flex align-items-center bg-light rounded-pill p-1 pe-3 border">
                        <div className="form-check form-switch mb-0 ms-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={job.active}
                            onChange={() => handleToggleActive(job._id, job.active)}
                            style={{ cursor: 'pointer', width: '2.5rem', height: '1.25rem' }}
                          />
                        </div>
                        <span className={`ms-2 small fw-bold ${job.active ? 'text-success' : 'text-secondary'}`}>
                          {job.active ? 'Live' : 'Stopped'}
                        </span>
                      </div>
                      
                      {job.stagesEnabled && (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2">
                          Stage-Based
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <span className="bg-light p-2 rounded-circle">💼</span>
                        <span className="small fw-medium">{job.jobType}</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <span className="bg-light p-2 rounded-circle">📍</span>
                        <span className="small fw-medium">{job.location}</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <span className="bg-light p-2 rounded-circle">💰</span>
                        <span className="small fw-medium">{job.ctc}</span>
                      </div>
                    </div>
                    <div className="col-md-3 col-6">
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <span className="bg-light p-2 rounded-circle">🏢</span>
                        <span className="small fw-medium">{job.workMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <div className="d-flex gap-4 text-secondary small">
                      <span>Posted: <span className="fw-medium text-dark">{new Date(job.createdAt).toLocaleDateString()}</span></span>
                      <span>Deadline: <span className="fw-medium text-danger">{new Date(job.endDate).toLocaleDateString()}</span></span>
                    </div>

                    <div className="d-flex gap-2">
                      <Link to={`/employer/jobs/${job._id}/applicants`} className="btn btn-sm px-3 py-2 rounded-3 shadow-sm" style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none' }}>
                        View Applicants
                      </Link>
                      {job.stagesEnabled && (
                        <Link to={`/employer/jobs/${job._id}/upload-results`} className="btn btn-sm px-3 py-2 rounded-3 shadow-sm" style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>
                          Upload Results
                        </Link>
                      )}
                      <button onClick={() => navigate(`/employer/jobs/${job._id}/edit`)} className="btn btn-sm px-3 py-2 rounded-3" style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(job._id)} className="btn btn-sm px-3 py-2 rounded-3" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        }
        .btn-primary {
          background-color: var(--color-primary-600);
          border-color: var(--color-primary-600);
        }
        .btn-primary:hover {
          background-color: var(--color-primary-700);
          border-color: var(--color-primary-700);
        }
      `}</style>
    </div>
  );
};

export default ManageJobs;

