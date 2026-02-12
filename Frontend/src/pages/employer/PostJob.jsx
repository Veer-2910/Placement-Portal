import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import "../../App.css";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useStages, setUseStages] = useState(true); // Default to v2 workflow
  
  const [formData, setFormData] = useState({
    driveId: "",
    companyName: "",
    title: "",
    jobRole: "",
    ctc: "",
    startDate: "",
    endDate: "",
    location: "",
    jobType: "Full-time",
    workMode: "Onsite",
    description: "",
    aboutCompany: "",
    contactEmail: "",
    requirements: "",
    requiredSkills: "",
    preferredSkills: "",
    minCgpa: "",
    branches: "",
    backlogsAllowed: false,
    gender: "All"
  });

  const [stages, setStages] = useState([
    {
      stageName: "Aptitude Test",
      stageType: "Aptitude Test",
      description: "",
      cutoffCriteria: { type: "percentage", value: 60, totalMarks: 100 },
      scheduledDate: "",
      location: "",
      mode: "Offline",
      instructions: ""
    }
  ]);

  const stageTypes = [
    "Aptitude Test",
    "Technical Interview",
    "HR Interview",
    "Group Discussion",
    "Coding Round",
    "Managerial Round",
    "Final Selection",
    "Other"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleStageChange = (index, field, value) => {
    const updatedStages = [...stages];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updatedStages[index][parent][child] = value;
    } else {
      updatedStages[index][field] = value;
    }
    setStages(updatedStages);
  };

  const addStage = () => {
    setStages([
      ...stages,
      {
        stageName: "",
        stageType: "Technical Interview",
        description: "",
        cutoffCriteria: { type: "none", value: 0, totalMarks: 100 },
        scheduledDate: "",
        location: "",
        mode: "Offline",
        instructions: ""
      }
    ]);
  };

  const removeStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = sessionStorage.getItem("employerToken");
      const employer = JSON.parse(sessionStorage.getItem("employer"));

      if (!token) {
        navigate("/employer/login");
        return;
      }

      // Prepare payload
      const payload = {
        driveId: formData.driveId,
        companyName: formData.companyName || employer.companyName,
        title: formData.title,
        jobRole: formData.jobRole,
        ctc: formData.ctc,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        jobType: formData.jobType,
        workMode: formData.workMode,
        description: formData.description,
        aboutCompany: formData.aboutCompany,
        contactEmail: formData.contactEmail,
        requirements: formData.requirements.split("\n").filter(r => r.trim()),
        requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()).filter(s => s),
        preferredSkills: formData.preferredSkills.split(",").map(s => s.trim()).filter(s => s),
        eligibility: {
          cgpa: parseFloat(formData.minCgpa) || 0,
          branches: formData.branches.split(",").map(b => b.trim()).filter(b => b),
          backlogsAllowed: formData.backlogsAllowed,
          gender: formData.gender
        },
        stagesEnabled: useStages,
        stages: useStages ? stages : undefined
      };

      const response = await axios.post(
        "http://localhost:5000/api/employer/jobs",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(response.data.message);
        navigate("/employer/jobs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold text-dark mb-1">Post New Job</h2>
          <p className="text-secondary mb-0">Create a new placement drive</p>
        </div>
        <button onClick={() => navigate("/employer")} className="btn btn-outline-secondary">
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Workflow Selection */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Recruitment Workflow</h5>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="useStages"
                checked={useStages}
                onChange={(e) => setUseStages(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="useStages">
                <span className="fw-semibold">Enable Stage-Based Recruitment</span>
                <div className="small text-secondary mt-1">
                  {useStages
                    ? "Stage-based workflow with automated result management and progression"
                    : "Simple status-based workflow (legacy)"}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">Basic Information</h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Job ID *</label>
                <input
                  type="text"
                  name="driveId"
                  className="form-control"
                  value={formData.driveId}
                  onChange={handleChange}
                  required
                  placeholder="e.g., JOB2024001"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Company name"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Job Role *</label>
                <input
                  type="text"
                  name="jobRole"
                  className="form-control"
                  value={formData.jobRole}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Full Stack Developer"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">CTC *</label>
                <input
                  type="text"
                  name="ctc"
                  className="form-control"
                  value={formData.ctc}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 6-8 LPA"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Location *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Bangalore, India"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Job Type *</label>
                <select name="jobType" className="form-select" value={formData.jobType} onChange={handleChange}>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Work Mode *</label>
                <select name="workMode" className="form-select" value={formData.workMode} onChange={handleChange}>
                  <option value="Onsite">Onsite</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  className="form-control"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="recruitment@company.com"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Application Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Application End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">Job Description</h5>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Job Description *</label>
              <textarea
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Detailed job description, responsibilities, etc."
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">About Company</label>
              <textarea
                name="aboutCompany"
                className="form-control"
                value={formData.aboutCompany}
                onChange={handleChange}
                rows="4"
                placeholder="Brief about your company"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Requirements (one per line)</label>
              <textarea
                name="requirements"
                className="form-control"
                value={formData.requirements}
                onChange={handleChange}
                rows="5"
                placeholder="Bachelor's degree in Computer Science&#10;2+ years of experience&#10;Strong problem-solving skills"
              />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Required Skills (comma-separated) *</label>
                <input
                  type="text"
                  name="requiredSkills"
                  className="form-control"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  required
                  placeholder="JavaScript, React, Node.js"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Preferred Skills (comma-separated)</label>
                <input
                  type="text"
                  name="preferredSkills"
                  className="form-control"
                  value={formData.preferredSkills}
                  onChange={handleChange}
                  placeholder="TypeScript, AWS, Docker"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Stages (if enabled) */}
        {useStages && (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Recruitment Stages</h5>
                  <p className="text-secondary small mb-0">Define the recruitment process stages</p>
                </div>
                <button type="button" onClick={addStage} className="btn btn-primary d-flex align-items-center gap-2">
                  <Plus size={18} /> Add Stage
                </button>
              </div>

              {stages.map((stage, index) => (
                <div key={index} className="border rounded-3 p-3 mb-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Stage {index + 1}</h6>
                    {stages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Stage Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={stage.stageName}
                        onChange={(e) => handleStageChange(index, "stageName", e.target.value)}
                        required
                        placeholder="e.g., Aptitude Test"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Stage Type *</label>
                      <select
                        className="form-select form-select-sm"
                        value={stage.stageType}
                        onChange={(e) => handleStageChange(index, "stageType", e.target.value)}
                        required
                      >
                        {stageTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        value={stage.description}
                        onChange={(e) => handleStageChange(index, "description", e.target.value)}
                        rows="2"
                        placeholder="Brief description of this stage"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Cutoff Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={stage.cutoffCriteria.type}
                        onChange={(e) => handleStageChange(index, "cutoffCriteria.type", e.target.value)}
                      >
                        <option value="none">No Cutoff</option>
                        <option value="percentage">Percentage</option>
                        <option value="marks">Marks</option>
                      </select>
                    </div>

                    {stage.cutoffCriteria.type !== "none" && (
                      <>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Cutoff Value</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={stage.cutoffCriteria.value}
                            onChange={(e) => handleStageChange(index, "cutoffCriteria.value", parseFloat(e.target.value))}
                            placeholder={stage.cutoffCriteria.type === "percentage" ? "60" : "100"}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Total Marks</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={stage.cutoffCriteria.totalMarks}
                            onChange={(e) => handleStageChange(index, "cutoffCriteria.totalMarks", parseFloat(e.target.value))}
                            placeholder="100"
                          />
                        </div>
                      </>
                    )}

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Scheduled Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={stage.scheduledDate}
                        onChange={(e) => handleStageChange(index, "scheduledDate", e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Location</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={stage.location}
                        onChange={(e) => handleStageChange(index, "location", e.target.value)}
                        placeholder="Venue or link"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Mode</label>
                      <select
                        className="form-select form-select-sm"
                        value={stage.mode}
                        onChange={(e) => handleStageChange(index, "mode", e.target.value)}
                      >
                        <option value="Offline">Offline</option>
                        <option value="Online">Online</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Instructions for Students</label>
                      <textarea
                        className="form-control form-control-sm"
                        value={stage.instructions}
                        onChange={(e) => handleStageChange(index, "instructions", e.target.value)}
                        rows="2"
                        placeholder="Any specific instructions for this stage"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Criteria */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4">Eligibility Criteria</h5>
            
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Minimum CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  name="minCgpa"
                  className="form-control"
                  value={formData.minCgpa}
                  onChange={handleChange}
                  placeholder="e.g., 7.0"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Gender Preference</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="col-md-4">
                <div className="form-check mt-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="backlogsAllowed"
                    name="backlogsAllowed"
                    checked={formData.backlogsAllowed}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="backlogsAllowed">
                    Allow students with backlogs
                  </label>
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Eligible Branches (comma-separated)</label>
                <input
                  type="text"
                  name="branches"
                  className="form-control"
                  value={formData.branches}
                  onChange={handleChange}
                  placeholder="Computer Science, IT, Electronics"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="d-flex gap-3 justify-content-end">
          <button type="button" onClick={() => navigate("/employer")} className="btn btn-outline-secondary px-4">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-4" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
