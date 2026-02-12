import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

const ViewApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId, filter]);

  const fetchJobAndApplicants = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }

      // Fetch job details
      const jobResponse = await axios.get(
        `http://localhost:5000/api/employer/jobs/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (jobResponse.data.success) {
        setJob(jobResponse.data.job);
      }

      // Fetch applicants
      let url = `http://localhost:5000/api/employer/jobs/${jobId}/applicants`;
      if (filter !== "all") {
        url += `?status=${filter}`;
      }

      const applicantsResponse = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (applicantsResponse.data.success) {
        setApplicants(applicantsResponse.data.applications);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = sessionStorage.getItem("employerToken");
      let endpoint = "";

      switch (newStatus) {
        case "Shortlisted":
          endpoint = `/api/employer/jobs/applications/${applicationId}/shortlist`;
          break;
        case "Rejected":
          endpoint = `/api/employer/jobs/applications/${applicationId}/reject`;
          break;
        case "Selected":
          endpoint = `/api/employer/jobs/applications/${applicationId}/select`;
          break;
        default:
          return;
      }

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Applicant ${newStatus.toLowerCase()} successfully!`);
        fetchJobAndApplicants();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applicants...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Applicants</h1>
          {job && <p className="job-title">{job.title} - {job.companyName}</p>}
        </div>
        <button onClick={() => navigate("/employer/jobs")} className="btn-secondary">
          Back to Jobs
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All ({applicants.length})
        </button>
        <button
          className={filter === "Applied" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Applied")}
        >
          Applied
        </button>
        <button
          className={filter === "Shortlisted" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Shortlisted")}
        >
          Shortlisted
        </button>
        <button
          className={filter === "Selected" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Selected")}
        >
          Selected
        </button>
        <button
          className={filter === "Rejected" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Rejected")}
        >
          Rejected
        </button>
      </div>

      {/* Applicants List */}
      <div className="applicants-list">
        {applicants.length === 0 ? (
          <div className="empty-state">
            <h3>No applicants found</h3>
            <p>No students have applied to this job yet</p>
          </div>
        ) : (
          applicants.map((application) => (
            <div key={application._id} className="applicant-card">
              <div className="applicant-header">
                <div className="applicant-info">
                  <h3>{application.student?.fullName}</h3>
                  <p className="email">{application.student?.universityEmail}</p>
                </div>
                <span className={`status-badge ${application.status.toLowerCase()}`}>
                  {application.status}
                </span>
              </div>

              <div className="applicant-details">
                <div className="detail-item">
                  <span className="label">Branch:</span>
                  <span className="value">{application.student?.branch}</span>
                </div>
                <div className="detail-item">
                  <span className="label">CGPA:</span>
                  <span className="value">{application.student?.cgpa?.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{application.student?.phone || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Applied:</span>
                  <span className="value">{new Date(application.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {application.student?.skills && application.student.skills.length > 0 && (
                <div className="skills-section">
                  <span className="label">Skills:</span>
                  <div className="skills-tags">
                    {application.student.skills.slice(0, 6).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="applicant-actions">
                {application.student?.resume && (
                  <a
                    href={`http://localhost:5000${application.student.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-resume"
                  >
                    📄 View Resume
                  </a>
                )}
                
                <button
                  onClick={() => navigate(`/employer/students/${application.student._id}`)}
                  className="btn-profile"
                >
                  View Profile
                </button>

                {application.status === "Applied" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(application._id, "Shortlisted")}
                      className="btn-shortlist"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusChange(application._id, "Rejected")}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </>
                )}

                {application.status === "Shortlisted" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(application._id, "Selected")}
                      className="btn-select"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => handleStatusChange(application._id, "Rejected")}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigate(`/employer/feedback/${application._id}`)}
                  className="btn-feedback"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .job-title {
          color: #666;
          margin: 0;
          font-size: 0.95rem;
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

        .applicants-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .applicant-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .applicant-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }

        .applicant-info h3 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 1.2rem;
        }

        .email {
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

        .status-badge.applied {
          background: #3b82f6;
        }

        .status-badge.shortlisted {
          background: #f59e0b;
        }

        .status-badge.selected {
          background: #10b981;
        }

        .status-badge.rejected {
          background: #ef4444;
        }

        .applicant-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
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

        .skills-section {
          margin-bottom: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .skill-tag {
          background: #f3f4f6;
          color: #374151;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .applicant-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .btn-resume,
        .btn-profile,
        .btn-shortlist,
        .btn-reject,
        .btn-select,
        .btn-feedback,
        .btn-secondary {
          padding: 0.5rem 1.25rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-resume {
          background: #8b5cf6;
          color: white;
        }

        .btn-profile {
          background: #0ea5e9;
          color: white;
        }

        .btn-shortlist {
          background: #f59e0b;
          color: white;
        }

        .btn-select {
          background: #10b981;
          color: white;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
        }

        .btn-feedback {
          background: #6366f1;
          color: white;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
        }

        .btn-resume:hover,
        .btn-profile:hover,
        .btn-shortlist:hover,
        .btn-reject:hover,
        .btn-select:hover,
        .btn-feedback:hover,
        .btn-secondary:hover {
          transform: translateY(-2px);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .empty-state h3 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #666;
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
            gap: 1rem;
          }

          .applicant-details {
            grid-template-columns: 1fr;
          }

          .applicant-actions {
            flex-direction: column;
          }

          .applicant-actions button,
          .applicant-actions a {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewApplicants;
