import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  IdCard,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";

export default function ViewApplications({ user }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewOpenId, setReviewOpenId] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 4,
    comments: "",
    improvementAreas: "",
    recommendedAction: "Improve Project",
    setStatus: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const [appRes, jobRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/applications/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setApplications(appRes.data);
      setJobDetails(jobRes.data);
    } catch (err) {
      setError("Failed to load application data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && jobId) fetchData();
  }, [user, jobId]);

  const updateStatus = async (appId, newStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/applications/${appId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const openReview = (app) => {
    setReviewOpenId(app._id);
    setReviewForm({
      rating: app.facultyReview?.rating || 4,
      comments: app.facultyReview?.comments || "",
      improvementAreas: (app.facultyReview?.improvementAreas || []).join(", "),
      recommendedAction:
        app.facultyReview?.recommendedAction || "Improve Project",
      setStatus: false,
    });
  };

  const submitReview = async (appId) => {
    try {
      const token = sessionStorage.getItem("token");
      const body = {
        rating: reviewForm.rating,
        comments: reviewForm.comments,
        improvementAreas: reviewForm.improvementAreas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        recommendedAction: reviewForm.recommendedAction,
        status: reviewForm.setStatus ? "Shortlisted" : undefined,
      };

      const res = await axios.put(
        `http://localhost:5000/api/drives/applications/${appId}/review`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? res.data.application : a))
      );
      setReviewOpenId(null);
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "text-primary bg-primary-subtle";
      case "Shortlisted":
        return "text-purple bg-purple-subtle";
      case "Selected":
        return "text-success bg-success-subtle";
      case "Rejected":
        return "text-danger bg-danger-subtle";
      default:
        return "text-secondary bg-secondary-subtle";
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-link link-dark p-0 d-flex align-items-center gap-2 text-decoration-none fw-medium mb-3"
        >
          <ArrowLeft size={20} /> Back to Jobs
        </button>
        <div className="d-flex justify-content-between align-items-end">
          <div>
            <h1 className="display-6 fw-bold text-dark mb-1">Applications</h1>
            <p className="text-secondary fs-5 mb-0">
              {jobDetails?.title} at {jobDetails?.company}
            </p>
          </div>
          <div className="bg-white px-3 py-2 rounded-3 border shadow-sm">
            <span className="text-secondary small fw-bold text-uppercase d-block">
              Total Applicants
            </span>
            <span className="fs-4 fw-bold text-primary">
              {applications.length}
            </span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 border-0">Student Information</th>
                <th className="py-3 border-0">Branch & CGPA</th>
                <th className="py-3 border-0">Status</th>
                <th className="px-4 py-3 border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    No applications received yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <>
                    <tr key={app._id} className="transition-all">
                      <td className="px-4 py-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3 border">
                            <User size={24} className="text-secondary" />
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold text-dark">
                              {app.student?.fullName}
                            </h6>
                            <div className="d-flex align-items-center gap-2 text-secondary small">
                              <Mail size={12} /> {app.student?.universityEmail}
                            </div>
                            <div className="d-flex align-items-center gap-2 text-secondary small">
                              <IdCard size={12} /> {app.student?.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="d-flex flex-column">
                          <span className="fw-medium text-dark">
                            {app.student?.branch}
                          </span>
                          <span className="text-secondary small d-flex align-items-center gap-1">
                            <Award size={14} className="text-warning" /> CGPA:{" "}
                            {app.student?.cgpa || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`badge rounded-pill px-3 py-2 fw-medium ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {app.status === "Applied" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(app._id, "Shortlisted")
                                }
                                className="btn btn-sm btn-outline-purple rounded-pill"
                                title="Shortlist"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(app._id, "Rejected")
                                }
                                className="btn btn-sm btn-outline-danger rounded-pill"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {app.status === "Shortlisted" && (
                            <>
                              <button
                                onClick={() =>
                                  updateStatus(app._id, "Selected")
                                }
                                className="btn btn-sm btn-outline-success rounded-pill"
                                title="Mark as Selected"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(app._id, "Rejected")
                                }
                                className="btn btn-sm btn-outline-danger rounded-pill"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <a
                            href={
                              app.student?.resume
                                ? `http://localhost:5000${app.student.resume}`
                                : "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`btn btn-sm btn-light border rounded-pill ${
                              !app.student?.resume ? "disabled" : ""
                            }`}
                            title="View Resume"
                          >
                            <FileText size={16} className="text-primary" />
                          </a>
                        </div>
                      </td>
                    </tr>
                    {reviewOpenId === app._id && (
                      <tr key={app._id + "-review"} className="bg-white">
                        <td colSpan="4" className="p-3">
                          <div className="d-flex gap-3 align-items-start">
                            <div style={{ width: 220 }}>
                              <label className="small fw-medium">Rating</label>
                              <select
                                className="form-select"
                                value={reviewForm.rating}
                                onChange={(e) =>
                                  setReviewForm((f) => ({
                                    ...f,
                                    rating: Number(e.target.value),
                                  }))
                                }
                              >
                                {[5, 4, 3, 2, 1].map((n) => (
                                  <option key={n} value={n}>
                                    {n} / 5
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-grow-1">
                              <label className="small fw-medium">
                                Comments
                              </label>
                              <textarea
                                className="form-control mb-2"
                                rows={3}
                                value={reviewForm.comments}
                                onChange={(e) =>
                                  setReviewForm((f) => ({
                                    ...f,
                                    comments: e.target.value,
                                  }))
                                }
                              />
                              <label className="small fw-medium">
                                Improvement Areas (comma separated)
                              </label>
                              <input
                                className="form-control mb-2"
                                value={reviewForm.improvementAreas}
                                onChange={(e) =>
                                  setReviewForm((f) => ({
                                    ...f,
                                    improvementAreas: e.target.value,
                                  }))
                                }
                              />
                              <div className="d-flex gap-2 align-items-center">
                                <label className="small fw-medium me-2">
                                  Recommended Action
                                </label>
                                <select
                                  className="form-select w-auto"
                                  value={reviewForm.recommendedAction}
                                  onChange={(e) =>
                                    setReviewForm((f) => ({
                                      ...f,
                                      recommendedAction: e.target.value,
                                    }))
                                  }
                                >
                                  <option>Improve Project</option>
                                  <option>Resubmit</option>
                                  <option>Shortlist</option>
                                  <option>Reject</option>
                                </select>
                                <div className="form-check ms-3">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={reviewForm.setStatus}
                                    onChange={(e) =>
                                      setReviewForm((f) => ({
                                        ...f,
                                        setStatus: e.target.checked,
                                      }))
                                    }
                                    id={`setStatus-${app._id}`}
                                  />
                                  <label
                                    className="form-check-label small"
                                    htmlFor={`setStatus-${app._id}`}
                                  >
                                    Also set status to Shortlisted
                                  </label>
                                </div>
                              </div>
                              <div className="mt-2 d-flex gap-2 justify-content-end">
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => setReviewOpenId(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => submitReview(app._id)}
                                >
                                  Save Review
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
