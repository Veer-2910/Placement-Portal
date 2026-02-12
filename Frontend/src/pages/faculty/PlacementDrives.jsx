import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Briefcase,
  Users,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Building2,
  Filter,
  Eye,
  ArrowLeft,
  DollarSign,
  Award,
  Circle,
  MoreVertical,
  ChevronRight,
  UserCheck,
  UserX,
  XCircle,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle2,
  FileText,
  Download,
  Mail,
  ListOrdered,
  AlertCircle,
} from "lucide-react";

export default function FacultyPlacementDrives({ user }) {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("list"); // list, applications, detail, review
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 4,
    comments: "",
    improvementAreas: "",
    recommendedAction: "Improve Project",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/drives/faculty",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDrives(response.data);
    } catch (err) {
      setError("Failed to load drives");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (driveId) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/drives/${driveId}/applications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplicants(response.data);
    } catch (err) {
      setError("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDrives();
  }, [user]);

  // Faculty can no longer create, edit, or delete drives - these functions are removed

  const updateStatus = async (appId, newStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/drives/applications/${appId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchApplicants(selectedDrive._id);
      if (selectedApplication && selectedApplication._id === appId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (err) {
      setError("Failed to update status");
    }
  };

  // Faculty can no longer toggle drive status - removed

  const handleExportCSV = async (driveId, companyName) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/drives/${driveId}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `applicants_${companyName.replace(/\s+/g, "_")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  const copyEmails = () => {
    const emails = applicants
      .map((app) => app.student?.universityEmail)
      .filter((e) => e)
      .join(", ");
    navigator.clipboard.writeText(emails);
    setSuccess("Student emails copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (view === "applications") {
    return (
      <div className="dash-container bg-transparent p-0 border-0">
        <div
          className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden d-flex flex-wrap align-items-center justify-content-between gap-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)",
          }}
        >
          <div className="position-relative z-1 d-flex align-items-center gap-4 text-dark">
            <button
              className="btn btn-white shadow-sm rounded-circle p-2 text-primary"
              onClick={() => setView("list")}
            >
              <ArrowLeft size={20} />
            </button>
            <div
              className="bg-primary text-white rounded-4 p-3 d-flex align-items-center justify-content-center shadow-lg gradient-bg"
              style={{ width: "64px", height: "64px" }}
            >
              <Building2 size={32} />
            </div>
            <div>
              <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-1">
                MANAGE APPLICANTS
              </p>
              <h1 className="dash-title h2 fw-bold mb-0 text-dark">
                {selectedDrive.companyName}
              </h1>
              <p className="text-secondary small mb-0 fw-medium">
                {selectedDrive.title} ·{" "}
                <span className="text-dark bg-white px-2 py-0 rounded border border-secondary border-opacity-25">
                  {applicants.length} candidates
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div></div>
          <button
            className="btn btn-outline-success rounded-3 px-4 fw-bold d-flex align-items-center gap-2"
            onClick={() =>
              handleExportCSV(selectedDrive._id, selectedDrive.companyName)
            }
            disabled={applicants.length === 0 || loading}
          >
            <Download size={18} /> Export to CSV
          </button>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 border-0">Student</th>
                    <th className="py-3 border-0">Branch & CGPA</th>
                    <th className="py-3 border-0">Applied On</th>
                    <th className="py-3 border-0">Status</th>
                    <th className="px-4 py-3 border-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        No applicants found for this drive.
                      </td>
                    </tr>
                  ) : (
                    applicants.map((app) => (
                      <tr key={app._id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div
                              className="bg-blue-100 text-blue rounded-circle p-2 me-3 fw-bold"
                              style={{
                                width: "40px",
                                height: "40px",
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              {app.student?.fullName?.charAt(0)}
                            </div>
                            <div>
                              <p className="mb-0 fw-bold">
                                {app.student?.fullName}
                              </p>
                              <p className="mb-0 text-secondary small">
                                {app.student?.studentId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-dark fw-medium">
                            {app.student?.branch}
                          </span>
                          <div className="d-flex align-items-center gap-1 text-secondary small">
                            <Award size={12} /> {app.student?.cgpa} CGPA
                          </div>
                        </td>
                        <td className="py-3 text-secondary small">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`badge rounded-pill fw-medium ${
                              app.status === "Selected"
                                ? "bg-success-subtle text-success"
                                : app.status === "Rejected"
                                ? "bg-danger-subtle text-danger"
                                : app.status === "Shortlisted"
                                ? "bg-info-subtle text-info"
                                : "bg-warning-subtle text-warning"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-3 px-3 fw-bold"
                              onClick={() => {
                                setSelectedApplication(app);
                                setView("review");
                              }}
                            >
                              Review
                            </button>
                            <a
                              href={`http://localhost:5000${app.student?.resume}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`btn btn-sm btn-light border rounded-3 ${
                                !app.student?.resume ? "disabled" : ""
                              }`}
                              title="View Resume"
                            >
                              <FileText size={16} className="text-primary" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "review" && selectedApplication) {
    return (
      <div className="dash-container bg-transparent p-0 border-0">
        <div className="mb-4">
          <button
            className="btn btn-light rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setView("applications")}
          >
            <ArrowLeft size={18} /> Back to Applicants
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="card-header bg-white border-bottom p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <FileText size={20} className="text-blue-500" />
                    Application Review
                  </h5>
                  <span
                    className={`badge rounded-pill px-3 py-2 ${
                      selectedApplication.status === "Selected"
                        ? "bg-success-subtle text-success"
                        : selectedApplication.status === "Rejected"
                        ? "bg-danger-subtle text-danger"
                        : "bg-warning-subtle text-warning"
                    }`}
                  >
                    {selectedApplication.status}
                  </span>
                </div>
              </div>
              <div className="card-body p-4 p-lg-5">
                <div className="alert alert-info mb-4 d-flex align-items-start gap-2">
                  <AlertCircle size={18} className="mt-1 flex-shrink-0" />
                  <div>
                    <strong>Monitoring Mode:</strong> You can review
                    applications and provide feedback, but status decisions
                    (Shortlist/Reject/Select) are restricted. Your role is to
                    provide meaningful academic feedback to help students
                    improve.
                  </div>
                </div>

                <div className="d-flex align-items-center gap-4 mb-5">
                  <div
                    className="bg-blue-100 text-blue rounded-4 p-4 d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                      width: "80px",
                      height: "80px",
                      fontSize: "2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedApplication.student?.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="fw-bold text-dark mb-1">
                      {selectedApplication.student?.fullName}
                    </h2>
                    <div className="d-flex align-items-center gap-3 text-secondary">
                      <span className="d-flex align-items-center gap-1">
                        <Info size={16} />{" "}
                        {selectedApplication.student?.studentId}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <MapPin size={16} />{" "}
                        {selectedApplication.student?.branch}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h6 className="text-primary fw-bold text-uppercase small tracking-wider mb-3">
                    Application Snapshot
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary mb-1">
                          CGPA (at application)
                        </p>
                        <div className="fw-bold text-dark">
                          {selectedApplication.cgpaAtTime ||
                            selectedApplication.student?.cgpa}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary mb-1">
                          Active Backlogs
                        </p>
                        <div className="fw-bold text-dark">
                          {selectedApplication.backlogsCount ?? "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary mb-1">Relocation</p>
                        <div className="fw-bold text-dark">
                          {selectedApplication.willingToRelocate
                            ? "Preferred"
                            : "Not Preferred"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary mb-1">
                          Contact Phone
                        </p>
                        <div className="fw-bold text-dark">
                          {selectedApplication.phoneNumber ||
                            selectedApplication.student?.phone ||
                            "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <p className="small text-secondary mb-1">
                          Submitted Skills
                        </p>
                        <div className="fw-bold text-dark">
                          {selectedApplication.skills?.join(", ") || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h6 className="text-primary fw-bold text-uppercase small tracking-wider mb-3">
                    Student Cover Note
                  </h6>
                  <div
                    className="bg-slate-50 rounded-4 p-4 border text-secondary leading-relaxed fs-6"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {selectedApplication.notes || "No cover note provided."}
                  </div>
                </div>

                <div className="mb-5">
                  <h6 className="text-primary fw-bold text-uppercase small tracking-wider mb-3">
                    Application Criteria & Qualifications
                  </h6>
                  <div className="row g-3">
                    {selectedApplication.coverLetter && (
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <p className="small text-secondary fw-bold text-uppercase mb-2">
                            Cover Letter / Statement
                          </p>
                          <div
                            className="text-dark small"
                            style={{ whiteSpace: "pre-line" }}
                          >
                            {selectedApplication.coverLetter}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedApplication.linkedinProfile && (
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <p className="small text-secondary fw-bold text-uppercase mb-2">
                            LinkedIn Profile
                          </p>
                          <a
                            href={selectedApplication.linkedinProfile}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-decoration-none fw-medium small"
                          >
                            {selectedApplication.linkedinProfile}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedApplication.githubProfile && (
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <p className="small text-secondary fw-bold text-uppercase mb-2">
                            GitHub Profile
                          </p>
                          <a
                            href={selectedApplication.githubProfile}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-decoration-none fw-medium small"
                          >
                            {selectedApplication.githubProfile}
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedApplication.certifications &&
                      selectedApplication.certifications.length > 0 && (
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border">
                            <p className="small text-secondary fw-bold text-uppercase mb-2">
                              Certifications
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                              {selectedApplication.certifications.map(
                                (cert, i) => (
                                  <span
                                    key={i}
                                    className="badge bg-white border text-dark small"
                                  >
                                    {cert}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    {selectedApplication.skills &&
                      selectedApplication.skills.length > 0 && (
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border">
                            <p className="small text-secondary fw-bold text-uppercase mb-2">
                              Technical Skills
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                              {selectedApplication.skills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="badge bg-primary text-white small"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-md-6">
                    <div className="p-4 bg-white rounded-4 border shadow-sm">
                      <p className="small text-secondary fw-bold text-uppercase mb-2">
                        Academic Performance
                      </p>
                      <div className="h4 fw-bold text-dark mb-0">
                        {selectedApplication.student?.cgpa} CGPA
                      </div>
                      <p className="small text-muted mb-0">
                        Current Branch: {selectedApplication.student?.branch}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-4 bg-white rounded-4 border shadow-sm h-100 d-flex flex-column justify-content-center">
                      <p className="small text-secondary fw-bold text-uppercase mb-2">
                        Resume Access
                      </p>
                      <a
                        href={`http://localhost:5000${selectedApplication.student?.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-blue-500 rounded-3 w-100 d-flex align-items-center justify-content-center gap-2"
                      >
                        <ExternalLink size={18} /> Open Resume
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-3">Application Info</h5>
                <div className="d-flex flex-column gap-2 text-secondary small">
                  <div className="d-flex justify-content-between">
                    <span className="fw-medium">Applied On:</span>
                    <span>
                      {new Date(
                        selectedApplication.appliedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="fw-medium">Status:</span>
                    <span className="badge bg-primary-subtle text-primary">
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="fw-medium">CGPA:</span>
                    <span>{selectedApplication.student?.cgpa}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="fw-medium">Branch:</span>
                    <span>{selectedApplication.student?.branch}</span>
                  </div>
                </div>
              </div>
              <div className="card border-0 shadow-sm rounded-4 mt-3">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3">Faculty Review</h6>
                  <div className="mb-2">
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
                  <div className="mb-2">
                    <label className="small fw-medium">Comments</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={reviewForm.comments}
                      onChange={(e) =>
                        setReviewForm((f) => ({
                          ...f,
                          comments: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="small fw-medium">
                      Improvement Areas (comma separated)
                    </label>
                    <input
                      className="form-control"
                      value={reviewForm.improvementAreas}
                      onChange={(e) =>
                        setReviewForm((f) => ({
                          ...f,
                          improvementAreas: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-3">
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
                      <option>Excellent Work</option>
                      <option>Needs More Practice</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() =>
                        setReviewForm({
                          rating: 4,
                          comments: "",
                          improvementAreas: "",
                          recommendedAction: "Improve Project",
                          setStatus: false,
                        })
                      }
                    >
                      Reset
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={async () => {
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
                          };
                          await axios.put(
                            `http://localhost:5000/api/drives/applications/${selectedApplication._id}/review`,
                            body,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          // refresh applicants and selectedApplication
                          await fetchApplicants(selectedDrive._id);
                          const refreshed =
                            applicants.find(
                              (a) => a._id === selectedApplication._id
                            ) || selectedApplication;
                          setSelectedApplication((prev) => ({
                            ...prev,
                            facultyReview: body,
                          }));
                          setSuccess("Review saved successfully!");
                          setTimeout(() => setSuccess(""), 3000);
                        } catch (err) {
                          setError("Failed to save review");
                        }
                      }}
                    >
                      Save Review
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 bg-slate-900 text-white">
              <div className="card-body p-4 text-center">
                <Building2 size={48} className="text-blue-400 mb-3 mx-auto" />
                <h5 className="fw-bold mb-1">{selectedDrive.companyName}</h5>
                <p className="small text-slate-400 mb-0">
                  {selectedDrive.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedDrive) {
    return (
      <div className="dash-container bg-transparent p-0 border-0">
        <div className="mb-4">
          <button
            className="btn btn-light rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setView("list")}
          >
            <ArrowLeft size={18} /> Back to Drives
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div
                    className="bg-slate-900 text-white rounded-4 p-4 d-flex align-items-center justify-content-center shadow-lg"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <Building2 size={40} />
                  </div>
                  <div>
                    <h2 className="fw-bold text-dark mb-1">
                      {selectedDrive.companyName}
                    </h2>
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold">
                      <Briefcase size={18} /> {selectedDrive.title}
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-1">
                        Package (CTC)
                      </p>
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <DollarSign size={18} className="text-emerald-500" />{" "}
                        {selectedDrive.ctc || "N/A"}
                      </h5>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-1">
                        Location
                      </p>
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <MapPin size={18} className="text-blue-500" />{" "}
                        {selectedDrive.location}
                      </h5>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-1">
                        Status
                      </p>
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <Circle
                          size={12}
                          fill={selectedDrive.active ? "#10b981" : "#ef4444"}
                          stroke="none"
                        />
                        {selectedDrive.active ? "Active" : "Closed"}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h5 className="fw-bold text-dark mb-3">About the Company</h5>
                  <p className="text-secondary leading-relaxed fs-6">
                    {selectedDrive.aboutCompany ||
                      "No company description provided."}
                  </p>
                </div>

                <div className="mb-5">
                  <h5 className="fw-bold text-dark mb-3">Selection Process</h5>
                  <div className="position-relative ps-4 border-start border-2 border-slate-200 ms-2">
                    {selectedDrive.process &&
                    selectedDrive.process.length > 0 ? (
                      selectedDrive.process.map((step, i) => (
                        <div key={i} className="mb-4 position-relative">
                          <div
                            className="position-absolute translate-middle-x"
                            style={{ left: "-1.45rem", top: "0.25rem" }}
                          >
                            <div
                              className="bg-blue-500 text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                              style={{
                                width: "24px",
                                height: "24px",
                                fontSize: "12px",
                              }}
                            >
                              {i + 1}
                            </div>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">
                            {step.step}
                          </h6>
                          <p className="text-secondary small mb-0">
                            {step.details}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary italic">
                        No specific rounds mentioned.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <h5 className="fw-bold text-dark mb-3">
                    Job Responsibilities
                  </h5>
                  <div
                    className="bg-slate-50 rounded-4 p-4 border text-secondary leading-relaxed fs-6"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {selectedDrive.description}
                  </div>
                </div>

                <div>
                  <h5 className="fw-bold text-dark mb-3">Requirements</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedDrive.requirements?.map((req, i) => (
                      <span
                        key={i}
                        className="badge bg-white shadow-sm border text-dark px-3 py-2 rounded-3 fw-medium"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-4">
                  Configuration Details
                </h5>
                <div className="d-flex flex-column gap-3">
                  <div className="p-3 bg-slate-50 rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Eligibility
                    </p>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex align-items-center gap-2 text-dark small">
                        <UserCheck size={16} className="text-blue-500" /> Min{" "}
                        {selectedDrive.eligibility?.cgpa} CGPA
                      </div>
                      <div className="d-flex align-items-center gap-2 text-dark small">
                        <Award size={16} className="text-blue-500" /> Backlogs:{" "}
                        {selectedDrive.eligibility?.backlogsAllowed
                          ? "Allowed"
                          : "Not Allowed"}
                      </div>
                      <div className="d-flex align-items-center gap-2 text-dark small">
                        <Users size={16} className="text-blue-500" /> Gender:{" "}
                        {selectedDrive.eligibility?.gender}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Contact Information
                    </p>
                    <div className="d-flex align-items-center gap-2 text-dark small">
                      <Mail size={16} className="text-blue-500" />{" "}
                      {selectedDrive.contactEmail || "N/A"}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Dates
                    </p>
                    <div className="small text-dark mb-1 d-flex align-items-center gap-2">
                      <Calendar size={14} /> Start:{" "}
                      {selectedDrive.startDate
                        ? new Date(selectedDrive.startDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="small text-dark d-flex align-items-center gap-2">
                      <Clock size={14} /> End:{" "}
                      {selectedDrive.endDate
                        ? new Date(selectedDrive.endDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-top">
                  <button
                    className="btn btn-blue-500 w-100 py-3 rounded-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
                    onClick={() => handleEdit(selectedDrive)}
                  >
                    <Edit2 size={20} /> Edit Drive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedDrive) {
    return (
      <div className="dash-container bg-transparent p-0 border-0">
        <div className="mb-4">
          <button
            className="btn btn-light rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setView("list")}
          >
            <ArrowLeft size={18} /> Back to Drives
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div
                    className="bg-slate-900 text-white rounded-4 p-4 d-flex align-items-center justify-content-center shadow-lg"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <Building2 size={40} />
                  </div>
                  <div>
                    <h2 className="fw-bold text-dark mb-1">
                      {selectedDrive.companyName}
                    </h2>
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold">
                      <Briefcase size={18} /> {selectedDrive.title}
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-5">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-1">
                        Package (CTC)
                      </p>
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <DollarSign size={18} className="text-emerald-500" />{" "}
                        {selectedDrive.ctc || "N/A"}
                      </h5>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-1">
                        Location
                      </p>
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <MapPin size={18} className="text-blue-500" />{" "}
                        {selectedDrive.location}
                      </h5>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-4 border">
                      <p className="small text-secondary fw-bold text-uppercase mb-1">
                        Status
                      </p>
                      <h5 className="mb-0 fw-bold d-flex align-items-center gap-2 text-dark">
                        <Circle
                          size={12}
                          fill={selectedDrive.active ? "#10b981" : "#ef4444"}
                          stroke="none"
                        />
                        {selectedDrive.active ? "Active" : "Closed"}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <h5 className="fw-bold text-dark mb-3">About the Company</h5>
                  <p className="text-secondary leading-relaxed fs-6">
                    {selectedDrive.aboutCompany ||
                      "No company description provided."}
                  </p>
                </div>

                <div className="mb-5">
                  <h5 className="fw-bold text-dark mb-3">
                    Job Responsibilities
                  </h5>
                  <div
                    className="bg-slate-50 rounded-4 p-4 border text-secondary leading-relaxed fs-6"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {selectedDrive.description}
                  </div>
                </div>

                <div>
                  <h5 className="fw-bold text-dark mb-3">Requirements</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedDrive.requirements?.map((req, i) => (
                      <span
                        key={i}
                        className="badge bg-white shadow-sm border text-dark px-3 py-2 rounded-3 fw-medium"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-4">
                  Configuration Details
                </h5>
                <div className="d-flex flex-column gap-3">
                  <div className="p-3 bg-slate-50 rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Eligibility
                    </p>
                    <div className="d-flex align-items-center gap-2 text-dark">
                      <UserCheck size={16} /> Min{" "}
                      {selectedDrive.eligibility?.cgpa} CGPA
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-3 border">
                    <p className="small text-secondary fw-bold text-uppercase mb-2">
                      Dates
                    </p>
                    <div className="small text-dark mb-1 d-flex align-items-center gap-2">
                      <Calendar size={14} /> Start:{" "}
                      {selectedDrive.startDate
                        ? new Date(selectedDrive.startDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="small text-dark d-flex align-items-center gap-2">
                      <Clock size={14} /> End:{" "}
                      {selectedDrive.endDate
                        ? new Date(selectedDrive.endDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-top">
                  <div className="alert alert-info mb-0">
                    <Info size={18} className="me-2" />
                    <strong>Read-Only Access:</strong> Faculty can view and export data but cannot modify drives.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div
        className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)",
        }}
      >
        <div className="position-relative z-1 text-dark">
          <div>
            <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2">
              RECRUITMENT HUB - READ-ONLY ACCESS
            </p>
            <h1 className="dash-title display-6 fw-bold mb-2 text-dark">
              Placement Drives
            </h1>
            <p
              className="text-secondary fs-5 mb-0"
              style={{ maxWidth: "700px" }}
            >
              Monitor all placement drives and export applicant data. Employers create drives through the employer portal.
            </p>
          </div>
        </div>
        <div className="hero-pattern position-absolute top-0 end-0 p-5 opacity-10">
          <Briefcase size={200} className="text-slate-400" />
        </div>
      </div>

      {/* Faculty cannot create or edit drives - form removed */}
      {false ? (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-5">
          <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
            <h4 className="fw-bold mb-0">
              {view === "edit"
                ? "Update Placement Drive"
                : "Configure New Recruitment Drive"}
            </h4>
            <button
              className="btn btn-light rounded-circle"
              onClick={() => setView("list")}
            >
              <XCircle size={20} />
            </button>
          </div>
          <div className="card-body p-4 p-lg-5">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-12">
                  <h6 className="text-primary fw-bold text-uppercase small tracking-wider mb-3">
                    Professional Details
                  </h6>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">
                    Drive ID
                  </label>
                  <input
                    name="driveId"
                    value={formData.driveId}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    placeholder="DRV-2024-X"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-secondary">
                    Company Name
                  </label>
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    placeholder="e.g. Google India"
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-bold text-secondary">
                    Opportunity Title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    placeholder="e.g. Software Development Engineer"
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">
                    Market Value (CTC)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <DollarSign size={16} />
                    </span>
                    <input
                      name="ctc"
                      value={formData.ctc}
                      onChange={handleInputChange}
                      className="form-control form-control-lg bg-light border-0 fs-6"
                      placeholder="e.g. 12.5 LPA"
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">
                    Drive Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-select form-select-lg bg-light border-0 fs-6"
                  >
                    <option value="On-Campus">On-Campus</option>
                    <option value="Pool-Campus">Pool-Campus</option>
                    <option value="Off-Campus">Off-Campus</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Location
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <MapPin size={16} />
                    </span>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-control form-control-lg bg-light border-0 fs-6"
                      placeholder="e.g. Bangalore / Remote"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Specific Job Role
                  </label>
                  <input
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    placeholder="e.g. Associate React Developer"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Point of Contact Email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="form-control form-control-lg bg-light border-0 fs-6"
                      placeholder="hr@company.com"
                    />
                  </div>
                </div>

                <div className="col-12 mt-5">
                  <h6 className="text-primary fw-bold text-uppercase small tracking-wider mb-3">
                    Eligibility & Requirements
                  </h6>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">
                    Min CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="eligibility.cgpa"
                    value={formData.eligibility.cgpa}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                  />
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-bold text-secondary mb-0">
                      Target Branches
                    </label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-bold"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          eligibility: {
                            ...formData.eligibility,
                            branches: "CSE, IT, ECE, ME, CE",
                          },
                        })
                      }
                    >
                      Select All
                    </button>
                  </div>
                  <input
                    name="eligibility.branches"
                    value={formData.eligibility.branches}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    placeholder="e.g. CSE, IT"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-secondary">
                    Gender Preference
                  </label>
                  <select
                    name="eligibility.gender"
                    value={formData.eligibility.gender}
                    onChange={handleInputChange}
                    className="form-select form-select-lg bg-light border-0 fs-6"
                  >
                    <option value="All">All</option>
                    <option value="Male">Male only</option>
                    <option value="Female">Female only</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-center pt-4">
                  <div className="form-check form-switch pt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="eligibility.backlogsAllowed"
                      checked={formData.eligibility.backlogsAllowed}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label small fw-bold text-secondary">
                      Backlogs Allowed
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">
                    Key Requirements / Skills
                  </label>
                  <input
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    placeholder="React.js, Node.js, Python, Strong DSA..."
                  />
                </div>

                <div className="col-12 mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-primary fw-bold text-uppercase small tracking-wider mb-0">
                      Selection Process Rounds
                    </h6>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary fw-bold"
                      onClick={addProcessStep}
                    >
                      + Add Round
                    </button>
                  </div>
                  <div className="row g-3">
                    {formData.process.map((p, index) => (
                      <div
                        key={index}
                        className="col-12 bg-light p-3 rounded-3 position-relative"
                      >
                        <div className="row g-2">
                          <div className="col-md-4">
                            <input
                              placeholder="Round Title (e.g. Technical Interview)"
                              className="form-control border-0 bg-white"
                              name={`process.${index}.step`}
                              value={p.step}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-7">
                            <input
                              placeholder="Round details/expectation"
                              className="form-control border-0 bg-white"
                              name={`process.${index}.details`}
                              value={p.details}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="col-md-1 d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0"
                              onClick={() => removeProcessStep(index)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-12 mt-5">
                  <h6 className="text-primary fw-bold text-uppercase small tracking-wider mb-3">
                    Schedule & Content
                  </h6>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Registration Start
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="form-control form-control-lg bg-light border-0 fs-6"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">
                    Detailed Opportunity Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0 fs-6"
                    rows="4"
                    placeholder="Responsibilities, Career path, etc."
                    required
                  ></textarea>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">
                    About the Company
                  </label>
                  <textarea
                    name="aboutCompany"
                    value={formData.aboutCompany}
                    onChange={handleInputChange}
                    className="form-control bg-light border-0 fs-6"
                    rows="3"
                    placeholder="Company mission, culture, etc."
                  ></textarea>
                </div>
              </div>

              <div className="mt-5 pt-4 border-top d-flex justify-content-end gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-5 py-2 fw-bold"
                  onClick={() => setView("list")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-blue-500 px-5 py-2 fw-bold shadow-sm"
                >
                  {view === "edit" ? "Update Drive" : "Publish Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-5">
            {error && (
              <div className="col-12">
                <div className="alert alert-danger">{error}</div>
              </div>
            )}
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : drives.length === 0 ? (
              <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm border border-light-subtle">
                <div className="bg-slate-50 rounded-circle d-inline-flex p-4 mb-3">
                  <Building2 size={64} className="text-slate-300" />
                </div>
                <h3 className="fw-bold text-dark">No Approved Drives</h3>
                <p
                  className="text-secondary mx-auto"
                  style={{ maxWidth: "400px" }}
                >
                  No placement drives have been approved yet. Employers can create drives through the employer portal.
                </p>
              </div>
            ) : (
              drives.map((drive) => (
                <div key={drive._id} className="col-xl-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden drive-card">
                    <div className="card-body p-4 p-lg-5">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div className="d-flex gap-4">
                          <div
                            className="bg-slate-900 text-white rounded-4 p-3 d-flex align-items-center justify-content-center shadow-lg"
                            style={{ width: "64px", height: "64px" }}
                          >
                            <Building2 size={32} />
                          </div>
                          <div>
                            <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                              {drive.companyName}
                              {!drive.active && (
                                <span className="badge bg-danger-subtle text-danger fs-xs rounded-pill">
                                  CLOSED
                                </span>
                              )}
                            </h4>
                            <h6 className="text-primary fw-bold mb-0">
                              {drive.title}
                            </h6>
                          </div>
                        </div>
                        <div>
                          <span className={`badge ${drive.active ? 'bg-success' : 'bg-secondary'} rounded-pill`}>
                            {drive.active ? 'Active' : 'Closed'}
                          </span>
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-6">
                          <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                            <DollarSign size={14} />{" "}
                            <span className="fw-bold text-dark">
                              {drive.ctc || "N/A"}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2 text-secondary small">
                            <MapPin size={14} /> {drive.location}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                            <Calendar size={14} /> Ends:{" "}
                            <span className="fw-bold text-dark">
                              {new Date(drive.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="badge bg-blue-subtle text-blue rounded-pill fw-medium">
                            {drive.type}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-4 p-4 border mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2 text-dark fw-bold h5 mb-0">
                            <Users size={24} className="text-blue-500" />
                            Track Applicants
                          </div>
                          <button
                            className="btn btn-blue-500 rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                            onClick={() => {
                              setSelectedDrive(drive);
                              fetchApplicants(drive._id);
                              setView("applications");
                            }}
                          >
                            View Applications <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-auto">
                        <button
                          className="btn btn-light border rounded-3 px-3 d-flex align-items-center gap-1"
                          onClick={() => {
                            setSelectedDrive(drive);
                            setView("detail");
                          }}
                        >
                          <Eye size={18} /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <style>{`
        .btn-blue-500 { background-color: #3b82f6; color: white; border: none; }
        .btn-blue-500:hover { background-color: #2563eb; color: white; transform: translateY(-1px); }
        .text-blue-400 { color: #60a5fa; }
        .text-slate-400 { color: #94a3b8; }
        .text-blue-500 { color: #3b82f6; }
        .bg-blue-subtle { background-color: #eff6ff; }
        .text-blue { color: #1e40af; }
        .bg-slate-900 { background-color: #0f172a; }
        .bg-slate-800 { background-color: #1e293b; }
         .bg-slate-50 { background-color: #f8fafc; }
        .bg-emerald-500 { background-color: #10b981; }
        .btn-emerald-500:hover { background-color: #059669; }
        .fs-xs { font-size: 0.7rem; }
        .drive-card { transition: all 0.3s ease; border: 1px solid #f1f5f9 !important; }

        .drive-card:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important; }
      `}</style>
    </div>
  );
}
