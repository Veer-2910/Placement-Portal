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
      <div className="mb-5 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold text-dark mb-1">Post New Job</h2>
          <p className="text-secondary mb-0">Create a new placement drive and define recruitment workflow</p>
        </div>
        <button onClick={() => navigate("/employer/jobs")} className="btn btn-outline-secondary px-4 py-2 border-2 fw-medium">
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 shadow-sm border-0 border-start border-danger border-4">
          <AlertCircle size={20} /> <span className="fw-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Workflow Selection */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4 bg-light border-bottom">
            <div className="d-flex justify-content-between align-items-center">
               <div>
                  <h5 className="fw-bold mb-1 text-primary">Recruitment Workflow</h5>
                  <p className="text-secondary mb-0 small">Select the type of recruitment process</p>
               </div>
               <div className="form-check form-switch d-flex align-items-center gap-3">
                  <label className="form-check-label fw-semibold order-1" htmlFor="useStages">
                    Enable Stage-Based Recruitment
                  </label>
                  <input
                    className="form-check-input order-2"
                    type="checkbox"
                    id="useStages"
                    role="switch"
                    checked={useStages}
                    onChange={(e) => setUseStages(e.target.checked)}
                    style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                  />
               </div>
            </div>
          </div>
          {useStages && (
             <div className="px-4 py-2 bg-primary-subtle border-top border-primary-subtle text-primary small">
                <span className="fw-bold">Active:</span> This workflow allows you to define multiple rounds, upload results for each stage, and automatically shortlist students.
             </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white p-4 border-bottom">
            <h5 className="fw-bold mb-0 text-dark">Basic Information</h5>
          </div>
          <div className="card-body p-4">
            
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Job ID <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="driveId"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.driveId}
                  onChange={handleChange}
                  required
                  placeholder="e.g., JOB2024001"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Company Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Company name"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Job Title <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="title"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Job Role <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="jobRole"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.jobRole}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Full Stack Developer"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">CTC <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="ctc"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.ctc}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 6-8 LPA"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Location <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="location"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Bangalore, India"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Job Type <span className="text-danger">*</span></label>
                <select name="jobType" className="form-select form-select-lg bg-light border-0" value={formData.jobType} onChange={handleChange}>
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Work Mode <span className="text-danger">*</span></label>
                <select name="workMode" className="form-select form-select-lg bg-light border-0" value={formData.workMode} onChange={handleChange}>
                  <option value="Onsite">Onsite</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="recruitment@company.com"
                />
              </div>

              <div className="col-12"><hr className="text-secondary opacity-25" /></div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Application Start Date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Application End Date <span className="text-danger">*</span></label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control form-control-lg bg-light border-0"
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
          <div className="card-header bg-white p-4 border-bottom">
            <h5 className="fw-bold mb-0 text-dark">Detailed Description</h5>
          </div>
          <div className="card-body p-4">
            
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small text-uppercase">Job Description <span className="text-danger">*</span></label>
              <textarea
                name="description"
                className="form-control bg-light border-0"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Detailed job description, responsibilities, and day-to-day tasks."
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small text-uppercase">About Company</label>
              <textarea
                name="aboutCompany"
                className="form-control bg-light border-0"
                value={formData.aboutCompany}
                onChange={handleChange}
                rows="4"
                placeholder="Brief introduction about your company culture and mission."
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small text-uppercase">Requirements (one per line)</label>
              <textarea
                name="requirements"
                className="form-control bg-light border-0"
                value={formData.requirements}
                onChange={handleChange}
                rows="5"
                placeholder="• Bachelor's degree in Computer Science&#10;• 2+ years of experience&#10;• Strong problem-solving skills"
              />
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Required Skills (comma-separated) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="requiredSkills"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  required
                  placeholder="JavaScript, React, Node.js"
                />
                <div className="form-text">These skills will be used for automated student matching.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Preferred Skills (comma-separated)</label>
                <input
                  type="text"
                  name="preferredSkills"
                  className="form-control form-control-lg bg-light border-0"
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
            <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
               <h5 className="fw-bold mb-0 text-dark">Recruitment Stages</h5>
               <button type="button" onClick={addStage} className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-3">
                 <Plus size={18} /> Add Stage
               </button>
            </div>
            <div className="card-body p-4 bg-light">
              <div className="d-flex flex-column gap-3">
                 {stages.map((stage, index) => (
                   <div key={index} className="card border-0 shadow-sm rounded-3 overflow-hidden">
                     <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                           <span className="badge bg-primary rounded-circle p-2" style={{width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{index + 1}</span>
                           <h6 className="fw-bold mb-0 text-dark">Stage {index + 1}</h6>
                        </div>
                        {stages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStage(index)}
                            className="btn btn-sm btn-outline-danger border-0 d-flex align-items-center gap-1"
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        )}
                     </div>
                     <div className="card-body p-4">
                       <div className="row g-3">
                         <div className="col-md-6">
                           <label className="form-label small fw-bold text-uppercase text-secondary">Stage Name <span className="text-danger">*</span></label>
                           <input
                             type="text"
                             className="form-control bg-light border-0"
                             value={stage.stageName}
                             onChange={(e) => handleStageChange(index, "stageName", e.target.value)}
                             required
                             placeholder="e.g., Aptitude Test"
                           />
                         </div>
   
                         <div className="col-md-6">
                           <label className="form-label small fw-bold text-uppercase text-secondary">Stage Type <span className="text-danger">*</span></label>
                           <select
                             className="form-select bg-light border-0"
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
                           <label className="form-label small fw-bold text-uppercase text-secondary">Description</label>
                           <textarea
                             className="form-control bg-light border-0"
                             value={stage.description}
                             onChange={(e) => handleStageChange(index, "description", e.target.value)}
                             rows="2"
                             placeholder="Brief description of this stage"
                           />
                         </div>
   
                         <div className="col-md-4">
                           <label className="form-label small fw-bold text-uppercase text-secondary">Cutoff Type</label>
                           <select
                             className="form-select bg-light border-0"
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
                               <label className="form-label small fw-bold text-uppercase text-secondary">Cutoff Value</label>
                               <input
                                 type="number"
                                 className="form-control bg-light border-0"
                                 value={stage.cutoffCriteria.value}
                                 onChange={(e) => handleStageChange(index, "cutoffCriteria.value", parseFloat(e.target.value))}
                                 placeholder={stage.cutoffCriteria.type === "percentage" ? "60" : "100"}
                               />
                             </div>
   
                             <div className="col-md-4">
                               <label className="form-label small fw-bold text-uppercase text-secondary">Total Marks</label>
                               <input
                                 type="number"
                                 className="form-control bg-light border-0"
                                 value={stage.cutoffCriteria.totalMarks}
                                 onChange={(e) => handleStageChange(index, "cutoffCriteria.totalMarks", parseFloat(e.target.value))}
                                 placeholder="100"
                               />
                             </div>
                           </>
                         )}
   
                         <div className="col-md-4">
                           <label className="form-label small fw-bold text-uppercase text-secondary">Scheduled Date</label>
                           <input
                             type="date"
                             className="form-control bg-light border-0"
                             value={stage.scheduledDate}
                             onChange={(e) => handleStageChange(index, "scheduledDate", e.target.value)}
                           />
                         </div>
   
                         <div className="col-md-4">
                           <label className="form-label small fw-bold text-uppercase text-secondary">Location</label>
                           <input
                             type="text"
                             className="form-control bg-light border-0"
                             value={stage.location}
                             onChange={(e) => handleStageChange(index, "location", e.target.value)}
                             placeholder="Venue or link"
                           />
                         </div>
   
                         <div className="col-md-4">
                           <label className="form-label small fw-bold text-uppercase text-secondary">Mode</label>
                           <select
                             className="form-select bg-light border-0"
                             value={stage.mode}
                             onChange={(e) => handleStageChange(index, "mode", e.target.value)}
                           >
                             <option value="Offline">Offline</option>
                             <option value="Online">Online</option>
                             <option value="Hybrid">Hybrid</option>
                           </select>
                         </div>
   
                         <div className="col-12">
                           <label className="form-label small fw-bold text-uppercase text-secondary">Instructions for Students</label>
                           <textarea
                             className="form-control bg-light border-0"
                             value={stage.instructions}
                             onChange={(e) => handleStageChange(index, "instructions", e.target.value)}
                             rows="2"
                             placeholder="Any specific instructions for this stage"
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* Eligibility Criteria */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-header bg-white p-4 border-bottom">
             <h5 className="fw-bold mb-0 text-dark">Eligibility Criteria</h5>
          </div>
          <div className="card-body p-4">
            
            <div className="row g-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Minimum CGPA</label>
                <div className="input-group">
                   <input
                     type="number"
                     step="0.01"
                     name="minCgpa"
                     className="form-control form-control-lg bg-light border-0"
                     value={formData.minCgpa}
                     onChange={handleChange}
                     placeholder="e.g., 7.0"
                   />
                   <span className="input-group-text bg-light border-0 text-secondary">/ 10</span>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Gender Preference</label>
                <select name="gender" className="form-select form-select-lg bg-light border-0" value={formData.gender} onChange={handleChange}>
                  <option value="All">All Applications</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                </select>
              </div>

              <div className="col-md-4 d-flex align-items-center">
                <div className="form-check form-switch ps-0 d-flex gap-3 align-items-center mt-3">
                  <label className="form-check-label fw-semibold order-1" htmlFor="backlogsAllowed">
                    Allow Backlogs
                  </label>
                  <input
                    type="checkbox"
                    className="form-check-input ms-0 order-2"
                    id="backlogsAllowed"
                    name="backlogsAllowed"
                    role="switch"
                    checked={formData.backlogsAllowed}
                    onChange={handleChange}
                    style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-secondary small text-uppercase">Eligible Branches (comma-separated)</label>
                <input
                  type="text"
                  name="branches"
                  className="form-control form-control-lg bg-light border-0"
                  value={formData.branches}
                  onChange={handleChange}
                  placeholder="Computer Science, IT, Electronics"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="d-flex gap-3 justify-content-end mb-5">
          <button type="button" onClick={() => navigate("/employer")} className="btn btn-lg btn-outline-secondary px-5 rounded-pill">
            Cancel
          </button>
          <button type="submit" className="btn btn-lg btn-primary px-5 rounded-pill fw-bold shadow-sm" disabled={loading}>
            {loading ? "Posting..." : "Create Job Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
