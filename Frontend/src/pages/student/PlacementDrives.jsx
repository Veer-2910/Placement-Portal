import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import {
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
  Award,
  Clock,
  Briefcase,
  DollarSign,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  Navigation,
  Check,
  Smartphone,
  ChevronDown,
  Globe,
  XCircle,
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

export default function StudentPlacementDrives({ user }) {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("list"); // list, detail
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    cgpaAtTime: "",
    backlogsCount: 0,
    skills: "",
    phoneNumber: "",
    willingToRelocate: true,
    notes: "",
    resume: "",
    // Enhanced fields - valuable only
    coverLetter: "",
    linkedinProfile: "",
    githubProfile: "",
    certifications: "",
  });

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/drives", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrives(response.data);
    } catch (err) {
      setError("Failed to load recruitment drives");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/auth/student/profile/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const profile = response.data;
      setApplicationForm((prev) => ({
        ...prev,
        cgpaAtTime: profile.cgpa || "",
        phoneNumber: profile.phone || profile.mobile || "",
        skills: profile.skills?.join(", ") || "",
        resume: profile.resume || "",
        linkedinProfile: profile.socialLinks?.linkedin || "",
        githubProfile: profile.socialLinks?.github || "",
      }));
    } catch (err) {
      console.error("Failed to fetch profile for pre-filling", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDrives();
      fetchStudentProfile();
    }
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();

    try {
      setApplying(true);
      const token = sessionStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/drives/apply",
        {
          driveId: selectedDrive._id,
          ...applicationForm,
          skills: applicationForm.skills
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== ""),
          certifications: applicationForm.certifications
            ? applicationForm.certifications
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c !== "")
            : [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Your application has been submitted successfully!");
      setShowApplyModal(false);
      setTimeout(() => setSuccess(""), 5000);
      setView("list");
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
      setTimeout(() => setError(""), 5000);
    } finally {
      setApplying(false);
    }
  };

  const openDriveDetails = (drive) => {
    setSelectedDrive(drive);
    setApplicationForm((prev) => ({
      ...prev,
      notes: "", // Reset notes when opening a new drive
    }));
    setShowApplicationForm(false); // Default to details view
    setShowApplyModal(true);
  };

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div
        className="dash-hero mb-5 p-4 p-lg-5 rounded-5 border-white position-relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)",
        }}
      >
        <div className="position-relative z-1">
          <p className="text-primary fw-bold tracking-widest small mb-2 text-uppercase">
            Career Gateway
          </p>
          <h1 className="display-5 fw-black text-slate-900 mb-3">
            Placement Drives
          </h1>
          <p
            className="text-secondary fs-5 mb-0 leading-relaxed"
            style={{ maxWidth: "650px" }}
          >
            Unlock opportunities with industry leaders. Track, apply, and manage
            your placement journey from a single professional dashboard.
          </p>
        </div>
        <div className="position-absolute end-0 top-0 opacity-10 p-5 mt-4 d-none d-lg-block">
          <Building2 size={240} className="text-slate-400" />
        </div>
      </div>

      {success && (
        <div className="alert alert-success border-0 shadow-sm rounded-4 mb-4 p-3 d-flex align-items-center gap-3 animate-slide-in-right">
          <CheckCircle2 size={20} /> {success}
        </div>
      )}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 p-3 d-flex align-items-center gap-3 animate-slide-in-right">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-xl-4 col-md-6">
              <Skeleton height="400px" borderRadius="20px" />
            </div>
          ))}
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-5 card rounded-5 p-5">
          <div className="bg-slate-50 rounded-circle d-inline-flex p-5 mb-4 border border-slate-100">
            <Calendar size={64} className="text-slate-300" />
          </div>
          <h3 className="fw-bold text-dark mb-2">No Active Drives</h3>
          <p className="text-secondary fs-6 mb-0">
            Stay tuned! New recruitment events will appear here soon.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {drives.map((drive) => (
            <div key={drive._id} className="col-xl-4 col-md-6">
              <div className="drive-card-premium position-relative">
                {/* Status Badge - Top Right */}
                {drive.applied && (
                  <div className="position-absolute top-0 end-0 m-3 z-3">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-2 shadow-sm">
                      <CheckCircle2 size={14} />
                      <span className="fw-bold small">Applied</span>
                    </span>
                  </div>
                )}

                {/* Card Header with Gradient */}
                <div className="card-header-gradient p-4 position-relative overflow-hidden">
                  <div
                    className="position-absolute top-0 end-0 text-white"
                    style={{ opacity: 0.08, transform: "translate(20%, -20%)" }}
                  >
                    <Building2 size={160} />
                  </div>
                  <div className="position-relative z-2">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="company-icon-wrapper">
                        <Building2 size={24} />
                      </div>
                      <span
                        className="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold small"
                        style={{
                          fontSize: "0.8rem",
                          boxShadow: "0 2px 8px rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {drive.type}
                      </span>
                    </div>
                    <h3
                      className="h5 fw-bold text-white mb-1"
                      style={{ fontSize: "1.25rem", letterSpacing: "-0.015em" }}
                    >
                      {drive.companyName}
                    </h3>
                    <p
                      className="text-white text-opacity-85 mb-0 fw-500"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {drive.title}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body-premium p-4">
                  {/* Key Info Grid */}
                  <div className="info-grid mb-4">
                    <div className="info-item">
                      <div className="info-icon bg-blue-50 text-primary">
                        <MapPin size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Location</span>
                        <span className="info-value">{drive.location}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon bg-emerald-50 text-success">
                        <DollarSign size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Package</span>
                        <span className="info-value">
                          {drive.ctc || "Competitive"}
                        </span>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon bg-amber-50 text-warning">
                        <Award size={18} />
                      </div>
                      <div className="info-content">
                        <span className="info-label">Min CGPA</span>
                        <span className="info-value">
                          {drive.eligibility?.cgpa || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="card-footer-premium">
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <div className="d-flex align-items-center gap-2 text-secondary small fw-500">
                        <Clock size={16} className="text-muted" />
                        <span>
                          Ends{" "}
                          {drive.endDate
                            ? new Date(drive.endDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : "Soon"}
                        </span>
                      </div>
                      <button
                        className={`btn ${
                          drive.applied
                            ? "btn-outline-success"
                            : "btn-primary-premium"
                        } btn-sm rounded-pill px-3 fw-600 d-flex align-items-center gap-1`}
                        onClick={() => openDriveDetails(drive)}
                        style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
                      >
                        {drive.applied ? (
                          <>
                            <CheckCircle2 size={15} />
                            View Status
                          </>
                        ) : (
                          <>
                            View Details
                            <FileText size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showApplyModal && selectedDrive}
        onHide={() => setShowApplyModal(false)}
        size="xl"
        centered
        scrollable
        contentClassName="border-0 bg-transparent"
        dialogClassName="modal-premium"
      >
        <div
          className="modal-content border-0 shadow-lg rounded-4 overflow-hidden"
          style={{ background: "#fff", maxHeight: "90vh" }}
        >
          {/* Compact Header */}
          <div
            className="position-relative p-4 text-white overflow-hidden flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #0052cc 0%, #0080ff 50%, #00bfff 100%)",
            }}
          >
            <div className="position-relative z-1 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white bg-opacity-25 p-2 rounded-3 backdrop-blur shadow-sm">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-white">
                    {selectedDrive?.companyName}
                  </h4>
                  <div className="d-flex align-items-center gap-2 opacity-90 small">
                    <span>{selectedDrive?.title}</span>
                    <span className="text-white text-opacity-50">•</span>
                    <span>{selectedDrive?.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn btn-icon btn-light rounded-circle border-0 text-white bg-white/10 hover-bg-white/20 d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px" }}
              >
                <XCircle size={18} />
              </button>
            </div>
          </div>

          <Modal.Body className="p-0 bg-slate-50">
            {selectedDrive && (
              <div className="row g-0 h-100">
                {/* Sidebar Info - Sticky on Desktop */}
                <div className="col-lg-3 border-end border-light bg-white h-100 overflow-y-auto custom-scrollbar">
                  <div className="p-4 d-flex flex-column gap-4">
                    <div>
                      <label className="small text-secondary fw-bold text-uppercase mb-2">
                        Job Details
                      </label>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-blue-50 text-primary p-2 rounded-3">
                            <DollarSign size={18} />
                          </div>
                          <div>
                            <div className="small text-secondary">Package</div>
                            <div className="fw-bold text-dark">
                              {selectedDrive.ctc}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-blue-50 text-primary p-2 rounded-3">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <div className="small text-secondary">Location</div>
                            <div className="fw-bold text-dark">
                              {selectedDrive.location}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-blue-50 text-primary p-2 rounded-3">
                            <Clock size={18} />
                          </div>
                          <div>
                            <div className="small text-secondary">Type</div>
                            <div className="fw-bold text-dark">
                              {selectedDrive.type}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-light opacity-50 my-0" />

                    <div>
                      <label className="small text-secondary fw-bold text-uppercase mb-2">
                        Eligibility
                      </label>
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                        <li className="d-flex justify-content-between">
                          <span className="text-secondary">Min CGPA</span>
                          <span className="fw-bold text-dark">
                            {selectedDrive.eligibility?.cgpa}
                          </span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span className="text-secondary">Backlogs</span>
                          <span
                            className={
                              selectedDrive.eligibility?.backlogsAllowed
                                ? "text-success fw-bold"
                                : "text-danger fw-bold"
                            }
                          >
                            {selectedDrive.eligibility?.backlogsAllowed
                              ? "Allowed"
                              : "No"}
                          </span>
                        </li>
                        <li className="d-flex justify-content-between">
                          <span className="text-secondary">Branches</span>
                          <span
                            className="fw-bold text-dark text-end"
                            style={{ maxWidth: "120px" }}
                          >
                            {Array.isArray(selectedDrive.eligibility?.branches)
                              ? selectedDrive.eligibility?.branches.join(", ")
                              : "All"}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="p-3 bg-blue-50 rounded-3 border border-blue-100">
                        <h6 className="fw-bold text-blue-700 mb-2 small">
                          Need Help?
                        </h6>
                        <p className="small text-blue-600 mb-0 leading-tight">
                          Contact placement cell or faculty coordinator for
                          queries.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="col-lg-9 bg-slate-50 h-100 overflow-y-auto custom-scrollbar">
                  <div
                    className="p-4 p-lg-5"
                    style={{ maxWidth: "800px", margin: "0 auto" }}
                  >
                    {/* Mode 1: View Details */}
                    {!selectedDrive.applied && !showApplicationForm && (
                      <div className="d-flex flex-column gap-4 animate-slide-in-right">
                        {/* Requirements Chips */}
                        <div className="d-flex flex-wrap gap-2">
                          {selectedDrive.requirements?.map((req, i) => (
                            <span
                              key={i}
                              className="badge bg-white text-secondary border border-light px-3 py-2 rounded-pill fw-medium shadow-sm"
                            >
                              {req}
                            </span>
                          ))}
                        </div>

                        {/* About/Description */}
                        <div className="bg-white rounded-4 p-4 shadow-sm border border-light">
                          {selectedDrive.description ||
                          selectedDrive.aboutCompany ? (
                            <>
                              {selectedDrive.aboutCompany && (
                                <div className="mb-4">
                                  <h5 className="fw-bold text-dark mb-3">
                                    About Company
                                  </h5>
                                  <p className="text-secondary leading-relaxed">
                                    {selectedDrive.aboutCompany}
                                  </p>
                                </div>
                              )}
                              {selectedDrive.description && (
                                <div>
                                  <h5 className="fw-bold text-dark mb-3">
                                    Job Description
                                  </h5>
                                  <p
                                    className="text-secondary leading-relaxed"
                                    style={{ whiteSpace: "pre-line" }}
                                  >
                                    {selectedDrive.description}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-muted text-center py-4">
                              No detailed description available.
                            </p>
                          )}
                        </div>

                        {/* Process Section */}
                        {selectedDrive.process &&
                          selectedDrive.process.length > 0 && (
                            <div>
                              <h5 className="fw-bold text-dark mb-3">
                                Hiring Process
                              </h5>
                              <div className="d-flex flex-column gap-3">
                                {selectedDrive.process.map((step, idx) => (
                                  <div key={idx} className="d-flex gap-3">
                                    <div className="d-flex flex-column align-items-center">
                                      <div
                                        className="bg-white border border-primary text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                          zIndex: 2,
                                        }}
                                      >
                                        {idx + 1}
                                      </div>
                                      {idx !==
                                        selectedDrive.process.length - 1 && (
                                        <div className="h-100 border-start border-2 border-light my-1"></div>
                                      )}
                                    </div>
                                    <div className="bg-white border border-light p-3 rounded-4 w-100 shadow-sm mb-2">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="fw-bold text-dark mb-0">
                                          {step.step}
                                        </h6>
                                        {step.date && (
                                          <span className="small text-muted bg-light px-2 py-1 rounded">
                                            {new Date(
                                              step.date
                                            ).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                      {step.details && (
                                        <p className="text-secondary small mb-0">
                                          {step.details}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Sticky Bottom Action for Mobile/Desktop */}
                        <div className="sticky-bottom pb-2 pt-4 bg-slate-50 border-top border-light mt-2">
                          <button
                            onClick={() => setShowApplicationForm(true)}
                            className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 gradient-btn"
                          >
                            Apply for this Role <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Application Form */}
                    {showApplicationForm && !selectedDrive.applied && (
                      <div className="animate-slide-in-right">
                        <div className="d-flex align-items-center gap-3 mb-4 sticky-top bg-slate-50 py-3 z-3 border-bottom border-light">
                          <button
                            onClick={() => setShowApplicationForm(false)}
                            className="btn btn-white border border-light shadow-sm rounded-circle p-2"
                          >
                            <ArrowLeft size={18} />
                          </button>
                          <div>
                            <h5 className="fw-bold text-dark mb-0">
                              Application Form
                            </h5>
                            <p className="text-secondary small mb-0">
                              Step 2 of 2
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleApply}>
                          {/* CGPA Eligibility Warning */}
                          {selectedDrive?.criteria?.cgpa && parseFloat(applicationForm.cgpaAtTime) < parseFloat(selectedDrive.criteria.cgpa) && (
                            <div className="alert alert-danger d-flex align-items-start gap-3 mb-4" role="alert">
                              <AlertCircle size={24} className="flex-shrink-0 mt-1" />
                              <div>
                                <h6 className="alert-heading fw-bold mb-1">CGPA Requirement Not Met</h6>
                                <p className="mb-0">Your CGPA ({applicationForm.cgpaAtTime}) is below the minimum requirement ({selectedDrive.criteria.cgpa}). You are not eligible to apply for this drive.</p>
                              </div>
                            </div>
                          )}

                          <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                            <div className="row g-4">
                              <div className="col-md-6">
                                <div className="form-group-modern">
                                  <label className="form-label-modern">
                                    Your CGPA{" "}
                                    <span className="text-muted small">(From Profile)</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={applicationForm.cgpaAtTime}
                                    className="form-control-modern bg-light"
                                    readOnly
                                    disabled
                                    min="0"
                                    max="10"
                                  />
                                  {selectedDrive?.criteria?.cgpa && (
                                    <small className={`mt-1 d-block ${
                                      parseFloat(applicationForm.cgpaAtTime) >= parseFloat(selectedDrive.criteria.cgpa)
                                        ? 'text-success'
                                        : 'text-danger'
                                    }`}>
                                      {parseFloat(applicationForm.cgpaAtTime) >= parseFloat(selectedDrive.criteria.cgpa)
                                        ? `✓ Eligible (Required: ${selectedDrive.criteria.cgpa})`
                                        : `✗ Not Eligible (Required: ${selectedDrive.criteria.cgpa})`
                                      }
                                    </small>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group-modern">
                                  <label className="form-label-modern">
                                    Active Backlogs{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={applicationForm.backlogsCount}
                                    onChange={(e) =>
                                      setApplicationForm({
                                        ...applicationForm,
                                        backlogsCount: e.target.value,
                                      })
                                    }
                                    className="form-control-modern"
                                    required
                                    min="0"
                                  />
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="form-group-modern">
                                  <label className="form-label-modern">
                                    Cover Note{" "}
                                    <span className="text-muted fw-normal small">
                                      (Optional)
                                    </span>
                                  </label>
                                  <textarea
                                    rows="4"
                                    value={applicationForm.coverLetter}
                                    onChange={(e) =>
                                      setApplicationForm({
                                        ...applicationForm,
                                        coverLetter: e.target.value,
                                      })
                                    }
                                    placeholder="Tell us why you're a great fit..."
                                    className="form-control-modern"
                                  ></textarea>
                                </div>
                              </div>

                              <div className="col-12">
                                <label className="form-label-modern mb-3">
                                  Enhanced Profile Options
                                </label>
                                <div className="d-flex flex-column gap-3">
                                  <div className="form-group-modern">
                                    <input
                                      type="url"
                                      value={applicationForm.linkedinProfile}
                                      onChange={(e) =>
                                        setApplicationForm({
                                          ...applicationForm,
                                          linkedinProfile: e.target.value,
                                        })
                                      }
                                      className="form-control-modern"
                                      placeholder="LinkedIn Profile URL"
                                    />
                                  </div>
                                  <div className="form-group-modern">
                                    <input
                                      type="url"
                                      value={applicationForm.githubProfile}
                                      onChange={(e) =>
                                        setApplicationForm({
                                          ...applicationForm,
                                          githubProfile: e.target.value,
                                        })
                                      }
                                      className="form-control-modern"
                                      placeholder="GitHub Profile URL"
                                    />
                                  </div>
                                  <div className="form-group-modern">
                                    <input
                                      type="text"
                                      value={applicationForm.certifications}
                                      onChange={(e) =>
                                        setApplicationForm({
                                          ...applicationForm,
                                          certifications: e.target.value,
                                        })
                                      }
                                      className="form-control-modern"
                                      placeholder="Certifications (Comma separated)"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="col-12 mt-2">
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-3 d-flex flex-column gap-3">
                                  <div className="d-flex gap-3 align-items-center">
                                    <div className="form-check form-switch flex-shrink-0">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="relocateCheck"
                                        checked={
                                          applicationForm.willingToRelocate
                                        }
                                        onChange={(e) =>
                                          setApplicationForm({
                                            ...applicationForm,
                                            willingToRelocate: e.target.checked,
                                          })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="form-check-label fw-bold small text-dark"
                                        htmlFor="relocateCheck"
                                      >
                                        Willing to Relocate
                                      </label>
                                      <p className="mb-0 small text-secondary">
                                        I am open to relocating to{" "}
                                        {selectedDrive.location} if selected.
                                      </p>
                                    </div>
                                  </div>

                                  <hr className="border-blue-200 my-1 opacity-50" />

                                  <div className="d-flex gap-3 align-items-start">
                                    <div className="form-check flex-shrink-0 mt-1">
                                      <input
                                        className="form-check-input border-blue-300"
                                        type="checkbox"
                                        id="termsCheck"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="form-check-label fw-bold small text-dark cursor-pointer required-asterisk"
                                        htmlFor="termsCheck"
                                      >
                                        I agree to the Terms & Conditions{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <p className="mb-0 small text-secondary">
                                        I declare that all information provided
                                        above is true and correct. I understand
                                        that any false information may lead to
                                        disqualification from the placement
                                        drive.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-light">
                            <button
                              type="button"
                              onClick={() => setShowApplicationForm(false)}
                              className="btn btn-light fw-bold px-4 rounded-pill"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={applying || (selectedDrive?.criteria?.cgpa && parseFloat(applicationForm.cgpaAtTime) < parseFloat(selectedDrive.criteria.cgpa))}
                              className="btn btn-primary px-5 py-2 fw-bold shadow-lg rounded-pill d-flex align-items-center gap-2 gradient-btn order-2"
                              title={selectedDrive?.criteria?.cgpa && parseFloat(applicationForm.cgpaAtTime) < parseFloat(selectedDrive.criteria.cgpa) ? 'You do not meet the CGPA requirement' : ''}
                            >
                              {applying ? (
                                <>
                                  <span className="spinner-border spinner-border-sm"></span>{" "}
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Navigation size={18} /> Submit Application
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Mode 3: Already Applied */}
                    {selectedDrive.applied && (
                      <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5">
                        <div className="bg-emerald-100 text-emerald-600 rounded-circle p-4 mb-4 shadow-sm">
                          <CheckCircle2 size={48} />
                        </div>
                        <h3 className="fw-bold text-dark mb-2">
                          Application Submitted!
                        </h3>
                        <p className="text-secondary mb-4">
                          You have already successfully applied for this drive.
                        </p>
                        <button
                          onClick={() => setShowApplyModal(false)}
                          className="btn btn-outline-secondary rounded-pill px-4"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </div>
      </Modal>

      <style>{`
        /* === Color Variables === */
        :root {
          --brand-primary: #2563eb;
          --brand-secondary: #0ea5e9;
          --slate-900: #0f172a;
          --slate-50: #f8fafc;
          --emerald-50: #ecfdf5;
          --blue-50: #eff6ff;
          --amber-50: #fffbeb;
        }
        
        /* === Premium Drive Cards === */
        .drive-card-premium {
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 82, 204, 0.05);
          display: flex;
          flex-direction: column;
        }
        
        .drive-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 82, 204, 0.15);
          border-color: rgba(0, 82, 204, 0.1);
        }
        
        .card-header-gradient {
          background: linear-gradient(135deg, #0052cc 0%, #0080ff 50%, #00bfff 100%);
          position: relative;
          padding: 2rem 1.5rem;
          min-height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        .company-icon-wrapper {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }
        
        .card-body-premium {
          padding: 1.75rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
        
        /* === Info Grid === */
        .info-grid {
          display: grid;
          gap: 0.875rem;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }
        
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.125rem;
          background: #ffffff;
          border-radius: 14px;
          transition: all 0.3s ease;
          border: 1.5px solid #e8ecf1;
        }
        
        .info-item:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .info-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-weight: 600;
        }
        
        .info-content {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
          flex-grow: 1;
        }
        
        .info-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .info-value {
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
          word-break: break-word;
        }
        
        .card-footer-premium {
          border-color: #e8ecf1 !important;
          padding-top: 1.25rem;
          border-top: 1.5px solid #e8ecf1;
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        
        /* === Buttons === */
        .btn-primary-premium {
          background: linear-gradient(135deg, #0052cc, #0080ff);
          color: white;
          border: none;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 82, 204, 0.25);
          font-weight: 600;
          padding: 0.5rem 1rem;
        }
        
        .btn-primary-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 82, 204, 0.35);
          color: white;
          background: linear-gradient(135deg, #004299, #0073e6);
        }
        
        .btn-primary-premium:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(0, 82, 204, 0.2);
        }
        
        /* === Modal Styles === */
        .modal-premium .modal-content {
          border-radius: 24px !important;
          overflow: hidden;
        }
        
        .modal-icon-premium {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #0052cc, #0080ff);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .company-header-card {
           border-radius: 16px;
           padding: 1.5rem;
        }
        
        .company-logo-modal {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        /* === Sections === */
        .opportunity-section,
        .application-form-section {
          border-radius: 16px;
          padding: 1.5rem;
        }
        
        .section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .opportunity-content {
          color: #64748b;
        }
        
        .requirements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-top: 1rem;
        }
        
        .requirement-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #1e40af;
        }
        
        /* === Modern Form Inputs === */
        .form-group-modern {
          margin-bottom: 0;
        }
        
        .form-label-modern {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.5rem;
        }
        
        .form-control-modern {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #0f172a;
          background-color: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .form-control-modern:focus {
          outline: none;
          background-color: white;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
        
        .form-control-modern::placeholder {
          color: #94a3b8;
        }
        
        textarea.form-control-modern {
          resize: vertical;
          min-height: 120px;
        }
        
        /* === Success State === */
        .application-submitted-state {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 16px;
          padding: 2rem;
        }
        
        .success-icon-wrapper {
          width: 96px;
          height: 96px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
        }
        
        /* === Submit Button === */
        .btn-submit-premium {
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          color: white;
          border: none;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
          transition: all 0.3s ease;
        }
        
        .btn-submit-premium:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
          color: white;
        }
        
        .btn-submit-premium:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* === Utility Classes === */
        .fw-black { font-weight: 900; }
        .leading-relaxed { line-height: 1.625; }
        .tracking-widest { letter-spacing: 0.2em; }
        .tracking-wide { letter-spacing: 0.05em; }
        .text-slate-900 { color: #0f172a; }
        .bg-slate-50 { background-color: #f8fafc; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-emerald-50 { background-color: #ecfdf5; }
        .bg-amber-50 { background-color: #fffbeb; }
        .text-emerald-500 { color: #10b981; }
        .text-amber-500 { color: #f59e0b; }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .backdrop-blur { backdrop-filter: blur(10px); }
        
        /* === Scrollbar === */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* === Animations === */
        .animate-slide-in-right { animation: slideInRight 0.5s ease-out; }
        
        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        /* === Responsive === */
        @media (max-width: 768px) {
          .drive-card-premium:hover {
            transform: translateY(-4px);
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .requirements-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
