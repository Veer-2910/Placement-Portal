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
  MapPin,
  Video,
  Users,
  Timer,
  Award,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function MyApplications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${BACKEND_URL}/api/drives/student/my-applications`,
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

  // Status timeline steps
  const statusSteps = [
    { key: "Applied", label: "Applied", icon: <FileText size={16} /> },
    { key: "Shortlisted", label: "Shortlisted", icon: <Star size={16} /> },
    { key: "Interview", label: "Interview", icon: <Users size={16} /> },
    { key: "Selected", label: "Selected", icon: <CheckCircle2 size={16} /> },
  ];

  const getStatusIndex = (status) => {
    if (status === "Applied") return 0;
    if (status === "Shortlisted") return 1;
    if (status === "Rejected") return -1; // Special case
    if (status === "Selected") return 3;
    return 0;
  };

  const hasInterviews = (app) => app.interviews && app.interviews.length > 0;

  const getStatusBadge = (status) => {
    const styles = {
      Applied: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
      Shortlisted: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
      Selected: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
      Rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    };
    const s = styles[status] || { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
    const icons = {
      Applied: <Clock size={14} />,
      Shortlisted: <AlertCircle size={14} />,
      Selected: <CheckCircle2 size={14} />,
      Rejected: <XCircle size={14} />,
    };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          borderRadius: "20px",
          padding: "6px 14px",
          fontWeight: 600,
          fontSize: "0.8rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {icons[status] || null} {status}
      </span>
    );
  };

  const getInterviewStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
      case "Completed": return { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
      case "Cancelled": return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
      case "Rescheduled": return { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" };
      default: return { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
    }
  };

  const getInterviewResultColor = (result) => {
    switch (result) {
      case "Passed": return { bg: "#ecfdf5", color: "#059669" };
      case "Failed": return { bg: "#fef2f2", color: "#dc2626" };
      default: return { bg: "#fff7ed", color: "#ea580c" };
    }
  };

  // --- Status Timeline Component ---
  const StatusTimeline = ({ app }) => {
    const currentIndex = getStatusIndex(app.status);
    const isRejected = app.status === "Rejected";
    const hasInterview = hasInterviews(app);

    return (
      <div style={{ padding: "24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          {/* Background line */}
          <div style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            right: "40px",
            height: "3px",
            background: "#e2e8f0",
            zIndex: 0,
          }} />
          {/* Progress line */}
          <div style={{
            position: "absolute",
            top: "20px",
            left: "40px",
            width: isRejected
              ? `${(1 / 3) * 100}%`
              : `${(Math.max(0, currentIndex + (hasInterview && currentIndex >= 1 ? 0.5 : 0)) / 3) * (100 - 20)}%`,
            height: "3px",
            background: isRejected
              ? "linear-gradient(90deg, #2563eb, #dc2626)"
              : "linear-gradient(90deg, #2563eb, #0ea5e9)",
            zIndex: 1,
            transition: "width 0.5s ease",
          }} />

          {statusSteps.map((step, index) => {
            let isActive = false;
            let isCompleted = false;

            if (isRejected) {
              isCompleted = index === 0;
              isActive = index === 1; // Mark where rejection happened
            } else {
              isCompleted = index < currentIndex;
              isActive = index === currentIndex;
              if (step.key === "Interview" && hasInterview) {
                isActive = true;
              }
            }

            return (
              <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isRejected && index === 1
                    ? "#dc2626"
                    : isCompleted
                      ? "linear-gradient(135deg, #2563eb, #0ea5e9)"
                      : isActive
                        ? "linear-gradient(135deg, #0ea5e9, #06b6d4)"
                        : "#e2e8f0",
                  color: isCompleted || isActive || (isRejected && index === 1) ? "white" : "#94a3b8",
                  transition: "all 0.3s ease",
                  boxShadow: isActive ? "0 0 0 4px rgba(14, 165, 233, 0.2)" : "none",
                }}>
                  {isRejected && index === 1 ? <XCircle size={18} /> : 
                   isCompleted ? <CheckCircle2 size={18} /> : step.icon}
                </div>
                <span style={{
                  marginTop: "8px",
                  fontSize: "0.75rem",
                  fontWeight: isActive || isCompleted ? 700 : 500,
                  color: isActive ? "#0ea5e9" : isCompleted ? "#2563eb" : (isRejected && index === 1 ? "#dc2626" : "#94a3b8"),
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {isRejected && index === 1 ? "Rejected" : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Interview Cards Component ---
  const InterviewCards = ({ interviews }) => {
    if (!interviews || interviews.length === 0) {
      return (
        <div style={{
          textAlign: "center", padding: "32px 16px",
          background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0",
        }}>
          <Users size={32} style={{ color: "#94a3b8", marginBottom: "8px" }} />
          <p style={{ color: "#64748b", fontWeight: 500, margin: 0 }}>No interviews scheduled yet</p>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "4px 0 0" }}>
            Interviews will appear here once they are scheduled by the employer.
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {interviews.map((interview, index) => {
          const statusColor = getInterviewStatusColor(interview.status);
          const resultColor = interview.result ? getInterviewResultColor(interview.result) : null;
          return (
            <div key={index} style={{
              background: "white", borderRadius: "12px", border: "1px solid #e2e8f0",
              padding: "16px 20px", transition: "box-shadow 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                  }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{interview.round || index + 1}</span>
                  </div>
                  <div>
                    <h6 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                      Round {interview.round || index + 1}: {interview.type || "Interview"}
                    </h6>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {interview.duration ? `${interview.duration} mins` : ""}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span style={{
                    background: statusColor.bg, color: statusColor.color,
                    border: `1px solid ${statusColor.border}`,
                    borderRadius: "6px", padding: "4px 10px",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}>
                    {interview.status || "Scheduled"}
                  </span>
                  {resultColor && (
                    <span style={{
                      background: resultColor.bg, color: resultColor.color,
                      borderRadius: "6px", padding: "4px 10px",
                      fontSize: "0.75rem", fontWeight: 600,
                    }}>
                      {interview.result}
                    </span>
                  )}
                </div>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "8px",
              }}>
                {interview.scheduledDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                    <Calendar size={14} style={{ color: "#0ea5e9" }} />
                    {new Date(interview.scheduledDate).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                    {" "}
                    {new Date(interview.scheduledDate).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                )}
                {interview.mode && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                    <Video size={14} style={{ color: "#0ea5e9" }} />
                    {interview.mode}
                  </div>
                )}
                {interview.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                    <MapPin size={14} style={{ color: "#0ea5e9" }} />
                    {interview.location.startsWith("http") ? (
                      <a href={interview.location} target="_blank" rel="noreferrer"
                        style={{ color: "#0ea5e9", textDecoration: "none" }}>
                        Join Meeting <ExternalLink size={12} />
                      </a>
                    ) : (
                      interview.location
                    )}
                  </div>
                )}
              </div>

              {interview.interviewers && interview.interviewers.length > 0 && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.83rem", color: "#64748b" }}>
                  <Users size={14} style={{ color: "#94a3b8" }} />
                  Interviewers: {interview.interviewers.join(", ")}
                </div>
              )}

              {interview.feedback && (
                <div style={{
                  marginTop: "10px", padding: "10px 14px",
                  background: "#f0f9ff", borderRadius: "8px", border: "1px solid #bae6fd",
                  fontSize: "0.85rem", color: "#0c4a6e",
                }}>
                  <strong>Feedback:</strong> {interview.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // --- Test Results Component ---
  const TestResults = ({ tests }) => {
    if (!tests || tests.length === 0) {
      return (
        <div style={{
          textAlign: "center", padding: "32px 16px",
          background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0",
        }}>
          <Award size={32} style={{ color: "#94a3b8", marginBottom: "8px" }} />
          <p style={{ color: "#64748b", fontWeight: 500, margin: 0 }}>No test results yet</p>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
        {tests.map((test, index) => (
          <div key={index} style={{
            background: "white", borderRadius: "12px", border: "1px solid #e2e8f0",
            padding: "16px", transition: "box-shadow 0.2s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                {test.testName || "Assessment"}
              </h6>
              {test.passed !== undefined && (
                <span style={{
                  background: test.passed ? "#ecfdf5" : "#fef2f2",
                  color: test.passed ? "#059669" : "#dc2626",
                  borderRadius: "6px", padding: "4px 10px",
                  fontSize: "0.75rem", fontWeight: 600,
                }}>
                  {test.passed ? "Passed ✓" : "Failed ✗"}
                </span>
              )}
            </div>
            {test.testType && (
              <span style={{
                background: "#f0f9ff", color: "#0284c7",
                borderRadius: "4px", padding: "2px 8px",
                fontSize: "0.75rem", fontWeight: 500, marginBottom: "8px", display: "inline-block",
              }}>
                {test.testType}
              </span>
            )}
            {(test.score !== undefined || test.maxScore) && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Score</span>
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>
                    {test.score ?? "N/A"} / {test.maxScore ?? "N/A"}
                  </span>
                </div>
                {test.maxScore > 0 && (
                  <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min((test.score / test.maxScore) * 100, 100)}%`,
                      height: "100%",
                      background: test.passed ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #f87171, #dc2626)",
                      borderRadius: "3px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                )}
              </div>
            )}
            {test.percentile && (
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "6px", marginBottom: 0 }}>
                Percentile: <strong>{test.percentile}%</strong>
              </p>
            )}
          </div>
        ))}
      </div>
    );
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
                    <th className="py-4 border-0 text-secondary small fw-bold text-uppercase text-center">
                      Interviews
                    </th>
                    <th className="px-5 py-4 border-0 text-secondary small fw-bold text-uppercase text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} className="transition-all hover-translate-x">
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
                      <td className="py-4 text-center">
                        {app.interviews && app.interviews.length > 0 ? (
                          <span style={{
                            background: "#eff6ff", color: "#2563eb",
                            borderRadius: "20px", padding: "4px 12px",
                            fontSize: "0.8rem", fontWeight: 600,
                          }}>
                            {app.interviews.length} Round{app.interviews.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-end">
                        <button
                          className="btn btn-light rounded-pill px-4 btn-sm fw-bold border d-inline-flex align-items-center gap-2"
                          onClick={() => { setSelectedApp(app); setActiveTab("details"); }}
                        >
                          Track Status <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
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
              maxWidth: "850px",
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

            {/* Status Timeline */}
            <div style={{ padding: "0 24px", background: "#fafbfc", borderBottom: "1px solid #e2e8f0" }}>
              <StatusTimeline app={selectedApp} />
            </div>

            {/* Tab Navigation */}
            <div style={{
              display: "flex", gap: "0", borderBottom: "2px solid #e2e8f0",
              background: "white", flexShrink: 0,
            }}>
              {[
                { key: "details", label: "Details", icon: <FileText size={15} /> },
                { key: "interviews", label: `Interviews${selectedApp.interviews?.length ? ` (${selectedApp.interviews.length})` : ""}`, icon: <Users size={15} /> },
                { key: "tests", label: `Tests${selectedApp.testResults?.length ? ` (${selectedApp.testResults.length})` : ""}`, icon: <Award size={15} /> },
                { key: "feedback", label: "Feedback", icon: <Star size={15} /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: activeTab === tab.key ? "2px solid #0ea5e9" : "2px solid transparent",
                    color: activeTab === tab.key ? "#0ea5e9" : "#64748b",
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                    marginBottom: "-2px",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
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
            >
              {/* ==== DETAILS TAB ==== */}
              {activeTab === "details" && (
                <>
                  <h6 className="fw-bold mb-4 text-dark">
                    Your Application Details
                  </h6>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <div className="p-3 bg-light rounded-3 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-2">
                        Status
                      </p>
                      <div>{getStatusBadge(selectedApp.status)}</div>
                    </div>

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

                    {(selectedApp.cgpaAtTime || selectedApp.student?.cgpa) && (
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
                    )}

                    {selectedApp.backlogsCount !== undefined && (
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary fw-bold text-uppercase mb-2">
                          Active Backlogs
                        </p>
                        <p className="mb-0 fw-medium text-dark">
                          {selectedApp.backlogsCount ?? "None"}
                        </p>
                      </div>
                    )}

                    {selectedApp.willingToRelocate !== undefined && (
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary fw-bold text-uppercase mb-2">
                          Willing to Relocate
                        </p>
                        <p className="mb-0 fw-medium text-dark">
                          {selectedApp.willingToRelocate ? "Yes" : "No"}
                        </p>
                      </div>
                    )}

                    {selectedApp.phoneNumber && (
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary fw-bold text-uppercase mb-2">
                          Contact Number
                        </p>
                        <p className="mb-0 fw-medium text-dark">
                          {selectedApp.phoneNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      marginBottom: "2rem",
                    }}
                  >
                    {selectedApp.skills && selectedApp.skills.length > 0 && (
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
                    )}

                    {selectedApp.linkedinProfile && (
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
                    )}

                    {selectedApp.githubProfile && (
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
                    )}

                    {selectedApp.certifications &&
                    selectedApp.certifications.length > 0 && (
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
                    )}

                    {selectedApp.student?.resume && (
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary fw-bold text-uppercase mb-2">
                          Resume
                        </p>
                        <a
                          href={`${BACKEND_URL}${selectedApp.student.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-primary"
                        >
                          <FileText size={14} className="me-1" /> View Resume
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedApp.coverLetter && (
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
                  )}

                  {selectedApp.notes && (
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
                  )}
                </>
              )}

              {/* ==== INTERVIEWS TAB ==== */}
              {activeTab === "interviews" && (
                <>
                  <h6 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                    <Users size={18} className="text-primary" /> Interview Schedule
                  </h6>
                  <InterviewCards interviews={selectedApp.interviews} />
                </>
              )}

              {/* ==== TESTS TAB ==== */}
              {activeTab === "tests" && (
                <>
                  <h6 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                    <Award size={18} className="text-primary" /> Assessment Results
                  </h6>
                  <TestResults tests={selectedApp.testResults} />
                </>
              )}

              {/* ==== FEEDBACK TAB ==== */}
              {activeTab === "feedback" && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
