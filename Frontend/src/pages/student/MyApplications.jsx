import { useState, useEffect } from "react";
import axios from "axios";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink,
  Building2,
  Navigation,
  ChevronRight,
  X,
  Star,
} from "lucide-react";

export default function MyApplications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      // Updated to match consolidated drive-based routes
      const response = await axios.get(
        "http://localhost:5000/api/drives/student/my-applications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(response.data);
    } catch (err) {
      setError("Failed to load your applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Applied":
        return (
          <span className="badge bg-blue-50 text-blue-600 border border-blue-100 rounded-pill fw-bold px-3 py-2 d-inline-flex align-items-center gap-1">
            <Clock size={14} /> Applied
          </span>
        );
      case "Shortlisted":
        return (
          <span className="badge bg-info-50 text-info-700 border border-info-100 rounded-pill fw-bold px-3 py-2 d-inline-flex align-items-center gap-1">
            <AlertCircle size={14} /> Shortlisted
          </span>
        );
      case "Selected":
        return (
          <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-pill fw-bold px-3 py-2 d-inline-flex align-items-center gap-1">
            <CheckCircle2 size={14} /> Selected
          </span>
        );
      case "Rejected":
        return (
          <span className="badge bg-rose-50 text-rose-700 border border-rose-100 rounded-pill fw-bold px-3 py-2 d-inline-flex align-items-center gap-1">
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className="badge bg-slate-100 text-slate-600 rounded-pill px-3 py-2">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div
        className="dash-hero mb-5 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)",
        }}
      >
        <div className="position-relative z-1">
          <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2">
            CAREER JOURNEY
          </p>
          <h1 className="dash-title display-6 fw-bold text-dark mb-2">
            My Applications
          </h1>
          <p className="text-secondary fs-5 mb-0" style={{ maxWidth: "600px" }}>
            A comprehensive overview of your recruitment progress and
            application statuses.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-5 px-4">
              <div className="bg-slate-50 rounded-circle d-inline-flex p-4 mb-4 border shadow-sm">
                <Briefcase size={64} className="text-slate-300" />
              </div>
              <h4 className="fw-bold text-dark">No Active Applications</h4>
              <p
                className="text-secondary mx-auto mb-4"
                style={{ maxWidth: "400px" }}
              >
                You haven't applied to any recruitment drives yet. Discover and
                apply for elite opportunities in the recruitment hub.
              </p>
              <a
                href="/student-dashboard/drives"
                className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
              >
                <Navigation size={18} /> Explore Placement Drives
              </a>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-slate-50 border-bottom">
                  <tr>
                    <th className="px-5 py-4 border-0 text-secondary small fw-bold text-uppercase">
                      Opportunity & Company
                    </th>
                    <th className="py-4 border-0 text-secondary small fw-bold text-uppercase">
                      Applied On
                    </th>
                    <th className="py-4 border-0 text-secondary small fw-bold text-uppercase text-center">
                      Current Status
                    </th>
                    <th className="px-5 py-4 border-0 text-secondary small fw-bold text-uppercase text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <>
                      <tr
                        key={app._id}
                        className="transition-all hover-translate-x"
                      >
                        <td className="px-5 py-4">
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-slate-900 text-white rounded-4 p-3 me-3 shadow-md"
                              style={{
                                width: "52px",
                                height: "52px",
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <Building2 size={24} />
                            </div>
                            <div>
                              <h6 className="mb-1 fw-bold text-dark">
                                {app.drive?.title || "Recruitment Drive"}
                              </h6>
                              <p className="text-blue-600 fw-bold small mb-0">
                                {app.drive?.companyName || "Company"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-secondary">
                          <div className="d-flex align-items-center gap-2 fw-medium">
                            <Calendar size={16} className="text-slate-400" />
                            {new Date(app.appliedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-5 py-4 text-end">
                          <button
                            className="btn btn-light rounded-pill px-4 btn-sm fw-bold border d-inline-flex align-items-center gap-2"
                            onClick={() => setSelectedApp(app)}
                          >
                            Review Details <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div
            className="card border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column"
            style={{
              maxWidth: "800px",
              width: "95%",
              maxHeight: "95vh",
              height: "auto",
            }}
          >
            {/* Fixed Header */}
            <div
              className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-shrink-0"
              style={{ position: "sticky", top: 0, zIndex: 1051 }}
            >
              <div>
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Building2 size={20} className="text-primary" />
                  {selectedApp.drive?.companyName}
                </h5>
                <p className="text-secondary small mb-0 mt-1">
                  {selectedApp.drive?.title}
                </p>
              </div>
              <button
                className="btn btn-light rounded-circle p-2"
                onClick={() => setSelectedApp(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              className="card-body p-4 p-lg-5"
              style={{
                overflowY: "auto",
                overflowX: "hidden",
                flex: 1,
                scrollBehavior: "smooth",
              }}
              onScroll={(e) => {
                // Custom scroll styling
                e.target.style.scrollbarWidth = "thin";
              }}
            >
              {/* Application Details Section */}
              <h6 className="fw-bold mb-4 text-dark">
                Your Application Details
              </h6>

              {/* Responsive Grid for Application Info */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {/* Status */}
                <div className="p-3 bg-light rounded-3 border">
                  <p className="small text-secondary fw-bold text-uppercase mb-2">
                    Status
                  </p>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>

                {/* Applied On */}
                <div className="p-3 bg-light rounded-3 border">
                  <p className="small text-secondary fw-bold text-uppercase mb-2">
                    Applied On
                  </p>
                  <p className="mb-0 fw-medium text-dark">
                    {new Date(selectedApp.appliedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </p>
                  <p className="small text-secondary mt-1 mb-0">
                    {new Date(selectedApp.appliedAt).toLocaleTimeString(
                      "en-US",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </div>

                {/* CGPA */}
                {selectedApp.cgpaAtTime || selectedApp.student?.cgpa ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      CGPA at Application
                    </p>
                    <p className="mb-0 fw-medium text-dark">
                      {selectedApp.cgpaAtTime ||
                        selectedApp.student?.cgpa ||
                        "N/A"}
                    </p>
                  </div>
                ) : null}

                {/* Active Backlogs */}
                {selectedApp.backlogsCount !== undefined ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Active Backlogs
                    </p>
                    <p className="mb-0 fw-medium text-dark">
                      {selectedApp.backlogsCount ?? "None"}
                    </p>
                  </div>
                ) : null}

                {/* Willing to Relocate */}
                {selectedApp.willingToRelocate !== undefined ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Willing to Relocate
                    </p>
                    <p className="mb-0 fw-medium text-dark">
                      {selectedApp.willingToRelocate ? "Yes" : "No"}
                    </p>
                  </div>
                ) : null}

                {/* Contact Number */}
                {selectedApp.phoneNumber ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Contact Number
                    </p>
                    <p className="mb-0 fw-medium text-dark">
                      {selectedApp.phoneNumber}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Skills, Certifications, Profiles Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {selectedApp.skills && selectedApp.skills.length > 0 ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Technical Skills
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedApp.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="badge bg-primary text-white small"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedApp.linkedinProfile ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      LinkedIn Profile
                    </p>
                    <a
                      href={selectedApp.linkedinProfile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-decoration-none fw-medium small"
                      style={{ wordBreak: "break-all" }}
                    >
                      {selectedApp.linkedinProfile}
                    </a>
                  </div>
                ) : null}

                {selectedApp.githubProfile ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      GitHub Profile
                    </p>
                    <a
                      href={selectedApp.githubProfile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-decoration-none fw-medium small"
                      style={{ wordBreak: "break-all" }}
                    >
                      {selectedApp.githubProfile}
                    </a>
                  </div>
                ) : null}

                {selectedApp.certifications &&
                selectedApp.certifications.length > 0 ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Certifications
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedApp.certifications.map((cert, i) => (
                        <span
                          key={i}
                          className="badge bg-white border text-dark small"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedApp.student?.resume ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Resume
                    </p>
                    <a
                      href={`http://localhost:5000${selectedApp.student.resume}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      <FileText size={14} className="me-1" /> View Resume
                    </a>
                  </div>
                ) : null}
              </div>

              {/* Full Width Sections */}
              {selectedApp.coverLetter ? (
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <p className="small text-secondary fw-bold text-uppercase mb-2">
                    Cover Letter / Statement
                  </p>
                  <p
                    className="mb-0 text-dark"
                    style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
                  >
                    {selectedApp.coverLetter}
                  </p>
                </div>
              ) : null}

              {selectedApp.notes ? (
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <p className="small text-secondary fw-bold text-uppercase mb-2">
                    Additional Notes
                  </p>
                  <p
                    className="mb-0 text-dark"
                    style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
                  >
                    {selectedApp.notes}
                  </p>
                </div>
              ) : null}

              {/* Divider */}
              <hr className="my-4" />

              {/* Faculty Feedback Section */}
              <h6 className="fw-bold mb-3 text-dark">Faculty Feedback</h6>

              {selectedApp.facultyReview ? (
                <div
                  className="p-4 bg-gradient rounded-4 border"
                  style={{ backgroundColor: "#f0f9ff", borderColor: "#0ea5e9" }}
                >
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <div
                      className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <CheckCircle2 size={20} />
                    </div>
                    <h5 className="fw-bold mb-0 text-dark">Faculty Feedback</h5>
                  </div>

                  {/* Rating */}
                  <div className="mb-4 p-3 bg-white rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Rating
                    </p>
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={24}
                            className={
                              i < (selectedApp.facultyReview.rating || 0)
                                ? "text-warning"
                                : "text-muted"
                            }
                            fill={
                              i < (selectedApp.facultyReview.rating || 0)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        ))}
                      </div>
                      <span className="fw-bold text-dark">
                        {selectedApp.facultyReview.rating || "N/A"} / 5
                      </span>
                    </div>
                  </div>

                  {/* Comments */}
                  {selectedApp.facultyReview.comments && (
                    <div className="mb-4 p-3 bg-white rounded-3 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-2">
                        Comments
                      </p>
                      <p
                        className="text-dark mb-0"
                        style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                      >
                        {selectedApp.facultyReview.comments}
                      </p>
                    </div>
                  )}

                  {/* Improvement Areas & Recommended Action */}
                  <div className="row g-3">
                    {selectedApp.facultyReview.improvementAreas?.length > 0 && (
                      <div className="col-md-6">
                        <div className="p-3 bg-white rounded-3 border h-100">
                          <p className="small text-secondary fw-bold text-uppercase mb-2">
                            Areas for Improvement
                          </p>
                          <ul className="mb-0 ps-3">
                            {selectedApp.facultyReview.improvementAreas.map(
                              (area, i) => (
                                <li key={i} className="text-dark mb-1">
                                  {area}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedApp.facultyReview.recommendedAction && (
                      <div
                        className={`col-md-${
                          selectedApp.facultyReview.improvementAreas?.length > 0
                            ? "6"
                            : "12"
                        }`}
                      >
                        <div className="p-3 bg-white rounded-3 border h-100">
                          <p className="small text-secondary fw-bold text-uppercase mb-2">
                            Recommended Action
                          </p>
                          <span
                            className={`badge px-4 py-3 fw-bold rounded-pill text-uppercase ${
                              selectedApp.facultyReview.recommendedAction ===
                              "Excellent Work"
                                ? "bg-success-subtle text-success"
                                : selectedApp.facultyReview
                                    .recommendedAction === "Improve Project"
                                ? "bg-warning-subtle text-warning"
                                : selectedApp.facultyReview
                                    .recommendedAction === "Resubmit"
                                ? "bg-info-subtle text-info"
                                : "bg-danger-subtle text-danger"
                            }`}
                          >
                            {selectedApp.facultyReview.recommendedAction}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reviewed Date */}
                  <div className="mt-4 pt-3 border-top text-center">
                    <p className="small text-secondary mb-0">
                      Reviewed on{" "}
                      {selectedApp.facultyReview.reviewedAt
                        ? new Date(
                            selectedApp.facultyReview.reviewedAt
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-light rounded-4 border text-center">
                  <AlertCircle
                    size={32}
                    className="text-muted mb-2 mx-auto d-block"
                  />
                  <p className="text-secondary fw-medium">
                    No faculty feedback yet.
                  </p>
                  <p className="text-secondary small">
                    Faculty will review your application and provide feedback
                    soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
