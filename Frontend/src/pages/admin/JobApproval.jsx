import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

const JobApproval = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      let url = "http://localhost:5000/api/admin/jobs";
      if (filter === "Pending") {
        url = "http://localhost:5000/api/admin/jobs/pending";
      } else if (filter !== "All") {
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

  const handleAction = (job, actionType) => {
    setSelectedJob(job);
    setAction(actionType);
    setShowModal(true);
    setRejectionReason("");
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = action === "approve"
        ? `/api/admin/jobs/${selectedJob._id}/approve`
        : `/api/admin/jobs/${selectedJob._id}/reject`;

      const payload = action === "reject" ? { rejectionReason } : {};

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(response.data.message);
        // Update local state immediately for "real-time" feel
        if (filter === "All") {
          setJobs((prevJobs) =>
            prevJobs.map((job) =>
              job._id === selectedJob._id
                ? { ...job, approvalStatus: action === "approve" ? "Approved" : "Rejected", rejectionReason: action === "reject" ? rejectionReason : null }
                : job
            )
          );
        } else {
          // If we are in specific status filter (e.g. Pending), remove it
          setJobs((prevJobs) => prevJobs.filter((job) => job._id !== selectedJob._id));
        }

        setShowModal(false);
        // fetchJobs(); // Optional: Sync with backend in background if accurate consistency is needed, but local update is faster
      }
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Job Approval</h1>
        <button onClick={() => navigate("/admin/dashboard")} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={filter === "Pending" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Pending")}
        >
          Pending
        </button>
        <button
          className={filter === "Approved" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Approved")}
        >
          Approved
        </button>
        <button
          className={filter === "Rejected" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Rejected")}
        >
          Rejected
        </button>
        <button
          className={filter === "All" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("All")}
        >
          All
        </button>
      </div>

      {/* Jobs List */}
      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>No jobs match the selected filter</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <div>
                  <h3>{job.title || job.companyName}</h3>
                  <p className="company">
                    {job.postedByEmployer?.companyName || job.companyName}
                  </p>
                </div>
                <span className={`status-badge ${job.approvalStatus?.toLowerCase()}`}>
                  {job.approvalStatus || "Pending"}
                </span>
              </div>

              <div className="job-details">
                <div className="detail-row">
                  <span className="label">Job ID:</span>
                  <span className="value">{job.jobId}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Role:</span>
                  <span className="value">{job.role}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{job.jobType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">CTC:</span>
                  <span className="value">{job.ctc}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{job.location}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Work Mode:</span>
                  <span className="value">{job.workMode}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Posted:</span>
                  <span className="value">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Apply By:</span>
                  <span className="value">
                    {job.applicationDeadline
                      ? new Date(job.applicationDeadline).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              {job.jobDescription && (
                <div className="job-description">
                  <strong>Job Description:</strong>
                  <p>{job.jobDescription}</p>
                </div>
              )}

              {job.eligibilityCriteria && (
                <div className="eligibility">
                  <strong>Eligibility:</strong>
                  <div className="eligibility-details">
                    {job.eligibilityCriteria.minimumCGPA && (
                      <span>Min CGPA: {job.eligibilityCriteria.minimumCGPA}</span>
                    )}
                    {job.eligibilityCriteria.allowedBranches?.length > 0 && (
                      <span>Branches: {job.eligibilityCriteria.allowedBranches.join(", ")}</span>
                    )}
                    {job.eligibilityCriteria.maxBacklogs !== undefined && (
                      <span>Max Backlogs: {job.eligibilityCriteria.maxBacklogs}</span>
                    )}
                  </div>
                </div>
              )}

              {job.requiredSkills?.length > 0 && (
                <div className="skills">
                  <strong>Required Skills:</strong>
                  <div className="skills-tags">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {job.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong> {job.rejectionReason}
                </div>
              )}

              {job.approvalStatus === "Pending" && (
                <div className="job-actions">
                  <button
                    onClick={() => handleAction(job, "approve")}
                    className="btn-approve"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleAction(job, "reject")}
                    className="btn-reject"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{action === "approve" ? "Approve Job" : "Reject Job"}</h3>
            <p>
              {action === "approve"
                ? `Are you sure you want to approve "${selectedJob?.title || selectedJob?.companyName}"?`
                : `Are you sure you want to reject "${selectedJob?.title || selectedJob?.companyName}"?`}
            </p>

            {action === "reject" && (
              <div className="form-group">
                <label>Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  placeholder="Provide a reason for rejection..."
                  required
                />
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={action === "approve" ? "btn-approve" : "btn-reject"}
                disabled={action === "reject" && !rejectionReason}
              >
                {action === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          color: #333;
          margin: 0;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1.5rem;
          border: 2px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .filter-btn.active {
          background: #0ea5e9;
          color: white;
          border-color: #0ea5e9;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .job-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }

        .job-header h3 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 1.3rem;
        }

        .company {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }

        .status-badge.pending {
          background: #f59e0b;
        }

        .status-badge.approved {
          background: #10b981;
        }

        .status-badge.rejected {
          background: #ef4444;
        }

        .job-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .label {
          color: #666;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .value {
          color: #333;
          font-size: 0.95rem;
        }

        .job-description,
        .eligibility,
        .skills {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .job-description strong,
        .eligibility strong,
        .skills strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .job-description p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .eligibility-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.9rem;
          color: #666;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          background: #0ea5e9;
          color: white;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .rejection-reason {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .job-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .btn-approve,
        .btn-reject,
        .btn-secondary,
        .btn-cancel {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-approve {
          background: #10b981;
          color: white;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
        }

        .btn-cancel {
          background: #e5e7eb;
          color: #333;
        }

        .btn-approve:hover,
        .btn-reject:hover,
        .btn-secondary:hover,
        .btn-cancel:hover {
          transform: translateY(-2px);
        }

        .btn-approve:disabled,
        .btn-reject:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
        }

        .modal-content h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .modal-content p {
          margin: 0 0 1.5rem 0;
          color: #666;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .loading-container {
          min-height: 50vh;
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
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .job-details {
            grid-template-columns: 1fr;
          }

          .job-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default JobApproval;
