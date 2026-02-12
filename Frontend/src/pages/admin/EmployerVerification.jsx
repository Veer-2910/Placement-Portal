import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

const EmployerVerification = () => {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchEmployers();
  }, [filter]);

  const fetchEmployers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      let url = "http://localhost:5000/api/admin/employers";
      if (filter === "Pending") {
        url = "http://localhost:5000/api/admin/employers/pending";
      } else if (filter !== "All") {
        url += `?status=${filter}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEmployers(response.data.employers);
      }
    } catch (error) {
      console.error("Error fetching employers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (employer, actionType) => {
    setSelectedEmployer(employer);
    setAction(actionType);
    setShowModal(true);
    setRejectionReason("");
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = action === "verify"
        ? `/api/admin/employers/${selectedEmployer._id}/verify`
        : `/api/admin/employers/${selectedEmployer._id}/reject`;

      const payload = action === "reject" ? { rejectionReason } : {};

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(response.data.message);
        setShowModal(false);
        fetchEmployers();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading employers...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Employer Verification</h1>
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
          className={filter === "Verified" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("Verified")}
        >
          Verified
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

      {/* Employers List */}
      <div className="employers-list">
        {employers.length === 0 ? (
          <div className="empty-state">
            <h3>No employers found</h3>
            <p>No employers match the selected filter</p>
          </div>
        ) : (
          employers.map((employer) => (
            <div key={employer._id} className="employer-card">
              <div className="employer-header">
                <div>
                  <h3>{employer.companyName}</h3>
                  <p className="email">{employer.companyEmail}</p>
                </div>
                <span className={`status-badge ${employer.verificationStatus.toLowerCase()}`}>
                  {employer.verificationStatus}
                </span>
              </div>

              <div className="employer-details">
                <div className="detail-row">
                  <span className="label">Industry:</span>
                  <span className="value">{employer.industry}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Company Size:</span>
                  <span className="value">{employer.companySize}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Website:</span>
                  <span className="value">
                    {employer.website ? (
                      <a href={employer.website} target="_blank" rel="noopener noreferrer">
                        {employer.website}
                      </a>
                    ) : "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Contact Person:</span>
                  <span className="value">{employer.contactPerson?.name || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Registered:</span>
                  <span className="value">{new Date(employer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {employer.description && (
                <div className="employer-description">
                  <strong>About:</strong>
                  <p>{employer.description}</p>
                </div>
              )}

              {employer.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong> {employer.rejectionReason}
                </div>
              )}

              {employer.verificationStatus === "Pending" && (
                <div className="employer-actions">
                  <button
                    onClick={() => handleAction(employer, "verify")}
                    className="btn-verify"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => handleAction(employer, "reject")}
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
            <h3>{action === "verify" ? "Verify Employer" : "Reject Employer"}</h3>
            <p>
              {action === "verify"
                ? `Are you sure you want to verify ${selectedEmployer?.companyName}?`
                : `Are you sure you want to reject ${selectedEmployer?.companyName}?`}
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
                className={action === "verify" ? "btn-verify" : "btn-reject"}
                disabled={action === "reject" && !rejectionReason}
              >
                {action === "verify" ? "Verify" : "Reject"}
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

        .employers-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .employer-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .employer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }

        .employer-header h3 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 1.3rem;
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

        .status-badge.pending {
          background: #f59e0b;
        }

        .status-badge.verified {
          background: #10b981;
        }

        .status-badge.rejected {
          background: #ef4444;
        }

        .employer-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        .value a {
          color: #0ea5e9;
          text-decoration: none;
        }

        .employer-description {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .employer-description strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .employer-description p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .rejection-reason {
          background: #fee;
          color: #c33;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .employer-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .btn-verify,
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

        .btn-verify {
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

        .btn-verify:hover,
        .btn-reject:hover,
        .btn-secondary:hover,
        .btn-cancel:hover {
          transform: translateY(-2px);
        }

        .btn-verify:disabled,
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

          .employer-details {
            grid-template-columns: 1fr;
          }

          .employer-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerVerification;
