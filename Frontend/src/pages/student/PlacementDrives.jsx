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
      notes: "",
      cgpaAtTime: prev.cgpaAtTime, 
      phoneNumber: prev.phoneNumber,
      resume: prev.resume,
      skills: prev.skills,
      linkedinProfile: prev.linkedinProfile,
      githubProfile: prev.githubProfile
    }));
    setShowApplicationForm(false);
    setShowApplyModal(true);
  };

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div
        className="dash-hero mb-5 p-4 p-lg-5 rounded-4 border-white position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)",
        }}
      >
        <div className="position-relative z-1">
          <p className="text-primary fw-bold tracking-wide small mb-2 text-uppercase">
            Career Gateway
          </p>
          <h1 className="display-6 fw-bold text-dark mb-3">
            Placement Drives
          </h1>
          <p
            className="text-secondary fs-5 mb-0"
            style={{ maxWidth: "650px" }}
          >
            Unlock opportunities with industry leaders. Track, apply, and manage
            your placement journey.
          </p>
        </div>
        <div className="position-absolute end-0 top-0 opacity-25 p-5 d-none d-lg-block">
          <Building2 size={240} className="text-secondary opacity-10" />
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
              <Skeleton height="350px" borderRadius="16px" />
            </div>
          ))}
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-5 card rounded-4 border-0 shadow-sm p-5">
          <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 border border-light-subtle">
            <Calendar size={48} className="text-secondary" />
          </div>
          <h4 className="fw-bold text-dark mb-2">No Active Drives</h4>
          <p className="text-secondary mb-0">
            Stay tuned! New recruitment events will appear here soon.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {drives.map((drive) => (
            <div key={drive._id} className="col-xl-4 col-md-6">
              <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all hover-lift ${drive.applied ? 'border-success-subtle' : ''}`}>
                {drive.applied && (
                  <div className="position-absolute top-0 end-0 m-3 z-3">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-2 shadow-sm">
                      <CheckCircle2 size={14} />
                      <span className="fw-bold small">Applied</span>
                    </span>
                  </div>
                )}

                <div className="p-4 position-relative overflow-hidden" 
                     style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                  <div className="d-flex align-items-start gap-3 mb-3">
                     <div className="bg-white p-2 rounded-3 shadow-sm text-primary d-flex align-items-center justify-content-center border border-light-subtle" style={{width: 48, height: 48}}>
                       <Building2 size={24} />
                     </div>
                     <div>
                        <h5 className="fw-bold text-dark mb-1">{drive.companyName}</h5>
                        <p className="text-secondary small mb-0 fw-medium">{drive.title}</p>
                     </div>
                  </div>
                  <div className="d-flex gap-2">
                     <span className="badge bg-white text-secondary border border-light-subtle rounded-pill px-3 py-1 fw-medium shadow-sm">
                       {drive.type}
                     </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="d-flex flex-column gap-3 mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light p-2 rounded-circle text-secondary">
                        <MapPin size={16} />
                      </div>
                      <span className="text-dark fw-medium small">{drive.location}</span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light p-2 rounded-circle text-secondary">
                        <DollarSign size={16} />
                      </div>
                      <span className="text-dark fw-bold small">{drive.ctc || "Competitive"}</span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-light p-2 rounded-circle text-secondary">
                        <Award size={16} />
                      </div>
                      <span className="text-dark fw-medium small">Min CGPA: {drive.eligibility?.cgpa || 0}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-top border-light d-flex justify-content-between align-items-center mt-auto">
                      <div className="d-flex align-items-center gap-2 text-secondary small fw-medium">
                        <Clock size={14} />
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
                            : "btn-primary"
                        } btn-sm rounded-pill px-4 fw-bold shadow-sm`}
                        onClick={() => openDriveDetails(drive)}
                      >
                        {drive.applied ? "View Status" : "View Details"}
                      </button>
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
          {/* Ocean Blue Header */}
          <div className="position-relative p-4 border-bottom border-blue-100" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" }}>
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white border border-blue-100 p-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center text-primary" style={{width: 48, height: 48}}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1 text-dark">
                    {selectedDrive?.companyName}
                  </h4>
                  <div className="d-flex align-items-center gap-2 text-primary-emphasis small fw-medium">
                    <span>{selectedDrive?.title}</span>
                    <span className="opacity-50">•</span>
                    <span>{selectedDrive?.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn btn-icon btn-white bg-white rounded-circle border border-blue-100 text-primary hover-bg-blue-50 fs-5 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "32px", height: "32px" }}
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>

          <Modal.Body className="p-0" style={{ backgroundColor: "#f8fcff" }}>
            {selectedDrive && (
              <div className="row g-0 h-100">
                {/* Sidebar Info - Sticky on Desktop */}
                <div className="col-lg-3 border-end border-blue-50 bg-white h-100 overflow-y-auto custom-scrollbar">
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
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="col-lg-9 h-100 overflow-y-auto custom-scrollbar" style={{ backgroundColor: "#f8fcff" }}>
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
                              className="badge bg-white text-primary border border-blue-100 px-3 py-2 rounded-pill fw-medium shadow-sm"
                            >
                              {req}
                            </span>
                          ))}
                        </div>

                        {/* About/Description */}
                        <div className="bg-white rounded-4 p-4 shadow-sm border border-blue-100">
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
                                        <div className="h-100 border-start border-2 border-blue-200 my-1"></div>
                                      )}
                                    </div>
                                    <div className="bg-white border border-blue-100 p-3 rounded-4 w-100 shadow-sm mb-2">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="fw-bold text-dark mb-0">
                                          {step.step}
                                        </h6>
                                        {step.date && (
                                          <span className="small text-primary-emphasis bg-blue-50 px-2 py-1 rounded">
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

                        {/* Sticky Bottom Action */}
                        <div className="sticky-bottom pb-2 pt-4 border-top border-blue-100 mt-2" style={{ backgroundColor: "#f8fcff" }}>
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
                        <div className="d-flex align-items-center gap-3 mb-4 sticky-top py-3 z-3 border-bottom border-blue-100" style={{ backgroundColor: "#f8fcff" }}>
                          <button
                            onClick={() => setShowApplicationForm(false)}
                            className="btn btn-white border border-blue-100 shadow-sm rounded-circle p-2 text-primary"
                          >
                            <ArrowLeft size={18} />
                          </button>
                          <div>
                            <h5 className="fw-bold text-dark mb-0">
                              Application Form
                            </h5>
                          </div>
                        </div>

                        <form onSubmit={handleApply}>
                          {selectedDrive?.criteria?.cgpa && parseFloat(applicationForm.cgpaAtTime) < parseFloat(selectedDrive.criteria.cgpa) && (
                            <div className="alert alert-danger d-flex align-items-start gap-3 mb-4" role="alert">
                              <AlertCircle size={24} className="flex-shrink-0 mt-1" />
                              <div>
                                <h6 className="alert-heading fw-bold mb-1">CGPA Requirement Not Met</h6>
                                <p className="mb-0">Your CGPA ({applicationForm.cgpaAtTime}) is below the minimum requirement ({selectedDrive.criteria.cgpa}). You are not eligible to apply for this drive.</p>
                              </div>
                            </div>
                          )}

                          <div className="bg-white p-4 rounded-4 shadow-sm border border-blue-100">
                            <div className="row g-4">
                              <div className="col-md-6">
                                <div className="form-group-modern">
                                  <label className="form-label-modern text-primary">
                                    Your CGPA{" "}
                                    <span className="text-muted small">(From Profile)</span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={applicationForm.cgpaAtTime}
                                    className="form-control-modern bg-blue-50 border-blue-100"
                                    readOnly
                                    disabled
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group-modern">
                                  <label className="form-label-modern text-primary">
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
                                    className="form-control-modern border-blue-100 focus-blue"
                                    required
                                    min="0"
                                  />
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="form-group-modern">
                                  <label className="form-label-modern text-primary">
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
                                    className="form-control-modern border-blue-100 focus-blue"
                                  ></textarea>
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
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="d-grid mt-4">
                            <button
                              type="submit"
                              className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm py-3 gradient-btn"
                              disabled={applying || (selectedDrive?.criteria?.cgpa && parseFloat(applicationForm.cgpaAtTime) < parseFloat(selectedDrive.criteria.cgpa))}
                            >
                              {applying ? "Submitting Application..." : "Confirm & Submit Application"}
                            </button>
                            <div className="text-center mt-3">
                              <button
                                type="button"
                                className="btn btn-link text-secondary text-decoration-none small"
                                onClick={() => setShowApplicationForm(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </div>
      </Modal>
      
      <style jsx>{`
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important; }
        .bg-blue-50 { background-color: #eff6ff; }
        .border-blue-100 { border-color: #dbeafe !important; }
        .border-blue-200 { border-color: #bfdbfe !important; }
        .hover-bg-blue-50:hover { background-color: #eff6ff !important; }
        .focus-blue:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );
}
