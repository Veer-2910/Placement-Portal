import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  Building2,
  User,
  Timer,
  Edit3,
  Check,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function InterviewScheduling() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    applicationId: "",
    round: 1,
    type: "Technical",
    scheduledDate: "",
    duration: 60,
    mode: "Online",
    location: "",
    interviewers: "",
  });

  // Update form state
  const [updateForm, setUpdateForm] = useState({
    status: "",
    feedback: "",
    result: "Pending",
  });

  // Applicants for scheduling
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }
      const response = await axios.get(
        `${BACKEND_URL}/api/employer/students/interviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setInterviews(response.data.interviews);
      }
    } catch (err) {
      console.error("Fetch interviews error:", err);
      setError("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      setLoadingApplicants(true);
      const token = sessionStorage.getItem("employerToken");
      const response = await axios.get(
        `${BACKEND_URL}/api/employer/students?applicationStatus=Shortlisted`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setApplicants(response.data.students);
      }
    } catch (err) {
      console.error("Fetch applicants error:", err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      const body = {
        ...scheduleForm,
        interviewers: scheduleForm.interviewers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const { applicationId, ...payload } = body;

      await axios.post(
        `${BACKEND_URL}/api/employer/students/applications/${applicationId}/schedule-interview`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowScheduleModal(false);
      setScheduleForm({
        applicationId: "",
        round: 1,
        type: "Technical",
        scheduledDate: "",
        duration: 60,
        mode: "Online",
        location: "",
        interviewers: "",
      });
      fetchInterviews();
    } catch (err) {
      console.error("Schedule interview error:", err);
      alert(err.response?.data?.message || "Failed to schedule interview");
    }
  };

  const handleUpdateInterview = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      await axios.put(
        `${BACKEND_URL}/api/employer/students/applications/${selectedInterview.applicationId}/interviews/${selectedInterview.interviewId}`,
        updateForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowUpdateModal(false);
      setSelectedInterview(null);
      fetchInterviews();
    } catch (err) {
      console.error("Update interview error:", err);
      alert(err.response?.data?.message || "Failed to update interview");
    }
  };

  const openScheduleModal = () => {
    fetchApplicants();
    setShowScheduleModal(true);
  };

  const openUpdateModal = (interview) => {
    setSelectedInterview(interview);
    setUpdateForm({
      status: interview.status || "Scheduled",
      feedback: interview.feedback || "",
      result: interview.result || "Pending",
    });
    setShowUpdateModal(true);
  };

  // Filtered interviews
  const filteredInterviews = interviews.filter((inv) => {
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      inv.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.drive?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: interviews.length,
    scheduled: interviews.filter((i) => i.status === "Scheduled").length,
    completed: interviews.filter((i) => i.status === "Completed").length,
    upcoming: interviews.filter(
      (i) => i.status === "Scheduled" && new Date(i.scheduledDate) > new Date()
    ).length,
  };

  const statusColors = {
    Scheduled: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    Completed: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    Cancelled: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    Rescheduled: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  };

  const resultColors = {
    Passed: { bg: "#ecfdf5", color: "#059669" },
    Failed: { bg: "#fef2f2", color: "#dc2626" },
    Pending: { bg: "#fff7ed", color: "#ea580c" },
  };

  const isUpcoming = (date) => {
    return date && new Date(date) > new Date();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ color: "#64748b" }}>Loading interviews...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", margin: 0 }}>
            Interview Scheduling
          </h1>
          <p style={{ color: "#6b7280", margin: "0.5rem 0 0" }}>
            Manage and track all interview schedules across your job postings
          </p>
        </div>
        <button
          onClick={openScheduleModal}
          style={{
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            color: "white", border: "none", borderRadius: "10px",
            padding: "12px 24px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: "0.95rem", boxShadow: "0 4px 14px rgba(14, 165, 233, 0.3)",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.transform = "translateY(-1px)")}
          onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
        >
          <Plus size={18} /> Schedule Interview
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Interviews", value: stats.total, icon: <Calendar size={20} />, gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
          { label: "Upcoming", value: stats.upcoming, icon: <Clock size={20} />, gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)" },
          { label: "Scheduled", value: stats.scheduled, icon: <AlertCircle size={20} />, gradient: "linear-gradient(135deg, #f59e0b, #f97316)" },
          { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={20} />, gradient: "linear-gradient(135deg, #10b981, #059669)" },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "white", borderRadius: "14px", padding: "20px",
            border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>{stat.label}</p>
                <h2 style={{ margin: "4px 0 0", fontWeight: 800, fontSize: "1.8rem", color: "#1e293b" }}>{stat.value}</h2>
              </div>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: stat.gradient, display: "flex",
                alignItems: "center", justifyContent: "center", color: "white",
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls Row */}
      <div style={{
        display: "flex", gap: "1rem", marginBottom: "1.5rem",
        flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{
          flex: 1, minWidth: "200px", position: "relative",
        }}>
          <Search size={16} style={{
            position: "absolute", left: "12px", top: "50%",
            transform: "translateY(-50%)", color: "#94a3b8",
          }} />
          <input
            type="text"
            placeholder="Search by student name, job title, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px 10px 36px",
              border: "1px solid #e2e8f0", borderRadius: "10px",
              fontSize: "0.9rem", outline: "none",
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px 16px", border: "1px solid #e2e8f0",
            borderRadius: "10px", fontSize: "0.9rem", outline: "none",
            color: "#374151", background: "white", cursor: "pointer",
          }}
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rescheduled">Rescheduled</option>
        </select>
        <button
          onClick={fetchInterviews}
          style={{
            padding: "10px 16px", border: "1px solid #e2e8f0",
            borderRadius: "10px", background: "white", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            color: "#64748b", fontSize: "0.9rem",
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Interview List */}
      {filteredInterviews.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem", background: "white",
          borderRadius: "14px", border: "1px solid #e2e8f0",
        }}>
          <Calendar size={48} style={{ color: "#cbd5e1", marginBottom: "16px" }} />
          <h4 style={{ color: "#374151", fontWeight: 700 }}>No Interviews Found</h4>
          <p style={{ color: "#64748b", maxWidth: "400px", margin: "8px auto 24px" }}>
            {interviews.length === 0
              ? "You haven't scheduled any interviews yet. Click the button above to schedule your first interview."
              : "No interviews match your current filters."}
          </p>
          {interviews.length === 0 && (
            <button
              onClick={openScheduleModal}
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                color: "white", border: "none", borderRadius: "10px",
                padding: "12px 24px", fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "8px",
              }}
            >
              <Plus size={18} /> Schedule Interview
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredInterviews.map((inv, index) => {
            const sc = statusColors[inv.status] || statusColors.Scheduled;
            const upcoming = isUpcoming(inv.scheduledDate);
            return (
              <div
                key={index}
                style={{
                  background: "white", borderRadius: "14px",
                  border: `1px solid ${upcoming ? "#bfdbfe" : "#e2e8f0"}`,
                  padding: "20px 24px",
                  boxShadow: upcoming ? "0 4px 14px rgba(14, 165, 233, 0.08)" : "0 2px 4px rgba(0,0,0,0.03)",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  {/* Left: Student & Drive Info */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: "250px" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 700, fontSize: "1rem", flexShrink: 0,
                    }}>
                      R{inv.round || "?"}
                    </div>
                    <div>
                      <h6 style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "1rem" }}>
                        {inv.student?.fullName || "Unknown Student"}
                      </h6>
                      <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        {inv.drive?.title || "Drive"} • Round {inv.round || "?"}: {inv.type || "Interview"}
                      </p>
                      {inv.student?.branch && (
                        <span style={{
                          background: "#f1f5f9", color: "#475569",
                          borderRadius: "4px", padding: "2px 8px",
                          fontSize: "0.75rem", fontWeight: 500, marginTop: "4px", display: "inline-block",
                        }}>
                          {inv.student.branch}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{
                      background: sc.bg, color: sc.color,
                      border: `1px solid ${sc.border}`,
                      borderRadius: "8px", padding: "6px 14px",
                      fontSize: "0.8rem", fontWeight: 600,
                    }}>
                      {inv.status || "Scheduled"}
                    </span>
                    {inv.result && inv.result !== "Pending" && (
                      <span style={{
                        background: resultColors[inv.result]?.bg || "#f1f5f9",
                        color: resultColors[inv.result]?.color || "#64748b",
                        borderRadius: "8px", padding: "6px 14px",
                        fontSize: "0.8rem", fontWeight: 600,
                      }}>
                        {inv.result}
                      </span>
                    )}
                    <button
                      onClick={() => openUpdateModal(inv)}
                      style={{
                        background: "#f0f9ff", color: "#0ea5e9",
                        border: "1px solid #bae6fd", borderRadius: "8px",
                        padding: "6px 14px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "4px",
                        fontSize: "0.8rem", fontWeight: 600,
                      }}
                    >
                      <Edit3 size={14} /> Update
                    </button>
                  </div>
                </div>

                {/* Details Row */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: "16px",
                  marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f1f5f9",
                }}>
                  {inv.scheduledDate && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                      <Calendar size={14} style={{ color: "#0ea5e9" }} />
                      {new Date(inv.scheduledDate).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                      {" at "}
                      {new Date(inv.scheduledDate).toLocaleTimeString("en-US", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                      {upcoming && (
                        <span style={{
                          background: "#dbeafe", color: "#2563eb",
                          borderRadius: "4px", padding: "1px 6px",
                          fontSize: "0.7rem", fontWeight: 600, marginLeft: "4px",
                        }}>
                          UPCOMING
                        </span>
                      )}
                    </div>
                  )}
                  {inv.duration && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                      <Timer size={14} style={{ color: "#0ea5e9" }} />
                      {inv.duration} mins
                    </div>
                  )}
                  {inv.mode && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                      <Video size={14} style={{ color: "#0ea5e9" }} />
                      {inv.mode}
                    </div>
                  )}
                  {inv.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                      <MapPin size={14} style={{ color: "#0ea5e9" }} />
                      {inv.location.startsWith("http") ? (
                        <a href={inv.location} target="_blank" rel="noreferrer" style={{ color: "#0ea5e9", textDecoration: "none" }}>
                          Join Link ↗
                        </a>
                      ) : (
                        inv.location
                      )}
                    </div>
                  )}
                  {inv.interviewers && inv.interviewers.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#475569" }}>
                      <Users size={14} style={{ color: "#0ea5e9" }} />
                      {inv.interviewers.join(", ")}
                    </div>
                  )}
                </div>

                {inv.feedback && (
                  <div style={{
                    marginTop: "12px", padding: "10px 14px",
                    background: "#f0f9ff", borderRadius: "8px",
                    border: "1px solid #bae6fd", fontSize: "0.85rem", color: "#0c4a6e",
                  }}>
                    <strong>Feedback:</strong> {inv.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== SCHEDULE INTERVIEW MODAL ===== */}
      {showScheduleModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1050,
          }}
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            style={{
              background: "white", borderRadius: "16px", width: "95%",
              maxWidth: "600px", maxHeight: "90vh", overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #e2e8f0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h5 style={{ margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={20} style={{ color: "#0ea5e9" }} /> Schedule New Interview
              </h5>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Select Applicant */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Select Applicant *
                </label>
                {loadingApplicants ? (
                  <p style={{ color: "#94a3b8" }}>Loading applicants...</p>
                ) : (
                  <select
                    value={scheduleForm.applicationId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, applicationId: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                      borderRadius: "8px", fontSize: "0.9rem",
                    }}
                  >
                    <option value="">Choose an applicant...</option>
                    {applicants.map((a) => (
                      <option key={a._id} value={a.applicationInfo?.applicationId || a._id}>
                        {a.fullName} — {a.branch || "N/A"} (CGPA: {a.cgpa || "N/A"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Round Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={scheduleForm.round}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, round: parseInt(e.target.value) })}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                      borderRadius: "8px", fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Interview Type *
                  </label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                      borderRadius: "8px", fontSize: "0.9rem",
                    }}
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Group Discussion">Group Discussion</option>
                    <option value="Case Study">Case Study</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                      borderRadius: "8px", fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                      borderRadius: "8px", fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Mode *
                  </label>
                  <select
                    value={scheduleForm.mode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                      borderRadius: "8px", fontSize: "0.9rem",
                    }}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Location / Meeting Link
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    placeholder={scheduleForm.mode === "Online" ? "Meeting link" : "Room/Building"}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                      borderRadius: "8px", fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Interviewers (comma-separated)
                </label>
                <input
                  type="text"
                  value={scheduleForm.interviewers}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, interviewers: e.target.value })}
                  placeholder="e.g., John Doe, Jane Smith"
                  style={{
                    width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: "8px", fontSize: "0.9rem",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    padding: "10px 20px", border: "1px solid #e2e8f0",
                    borderRadius: "8px", background: "white", cursor: "pointer",
                    fontWeight: 600, color: "#64748b",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  disabled={!scheduleForm.applicationId || !scheduleForm.scheduledDate}
                  style={{
                    padding: "10px 24px", border: "none", borderRadius: "8px",
                    background: !scheduleForm.applicationId || !scheduleForm.scheduledDate
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                    color: "white", cursor: !scheduleForm.applicationId || !scheduleForm.scheduledDate ? "not-allowed" : "pointer",
                    fontWeight: 600, display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <Check size={16} /> Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== UPDATE INTERVIEW MODAL ===== */}
      {showUpdateModal && selectedInterview && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 1050,
          }}
          onClick={() => setShowUpdateModal(false)}
        >
          <div
            style={{
              background: "white", borderRadius: "16px", width: "95%",
              maxWidth: "500px", maxHeight: "90vh", overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #e2e8f0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h5 style={{ margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit3 size={20} style={{ color: "#0ea5e9" }} /> Update Interview
              </h5>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Context */}
              <div style={{
                background: "#f8fafc", borderRadius: "10px", padding: "14px",
                marginBottom: "20px", border: "1px solid #e2e8f0",
              }}>
                <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>
                  {selectedInterview.student?.fullName}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Round {selectedInterview.round}: {selectedInterview.type} • {selectedInterview.drive?.title}
                </p>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: "8px", fontSize: "0.9rem",
                  }}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Result
                </label>
                <select
                  value={updateForm.result}
                  onChange={(e) => setUpdateForm({ ...updateForm, result: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: "8px", fontSize: "0.9rem",
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Feedback
                </label>
                <textarea
                  value={updateForm.feedback}
                  onChange={(e) => setUpdateForm({ ...updateForm, feedback: e.target.value })}
                  placeholder="Interview feedback, observations, and assessment..."
                  rows={4}
                  style={{
                    width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: "8px", fontSize: "0.9rem", resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  style={{
                    padding: "10px 20px", border: "1px solid #e2e8f0",
                    borderRadius: "8px", background: "white", cursor: "pointer",
                    fontWeight: 600, color: "#64748b",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateInterview}
                  style={{
                    padding: "10px 24px", border: "none", borderRadius: "8px",
                    background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                    color: "white", cursor: "pointer", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
