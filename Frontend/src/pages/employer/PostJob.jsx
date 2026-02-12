import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const [rounds, setRounds] = useState([
    { step: "", date: "", details: "" }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleRoundChange = (index, field, value) => {
    const updatedRounds = [...rounds];
    updatedRounds[index][field] = value;
    setRounds(updatedRounds);
  };

  const addRound = () => {
    setRounds([...rounds, { step: "", date: "", details: "" }]);
  };

  const removeRound = (index) => {
    const updatedRounds = rounds.filter((_, i) => i !== index);
    setRounds(updatedRounds);
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
        process: rounds.map(r => ({
          step: r.step,
          date: r.date,
          details: r.details
        })),
        eligibility: {
          cgpa: parseFloat(formData.minCgpa) || 0,
          branches: formData.branches.split(",").map(b => b.trim()).filter(b => b),
          backlogsAllowed: formData.backlogsAllowed,
          gender: formData.gender
        }
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
    <div className="page-container">
      <div className="page-header">
        <h1>Post New Job</h1>
        <button onClick={() => navigate("/employer/dashboard")} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="job-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Job ID *</label>
              <input
                type="text"
                name="driveId"
                value={formData.driveId}
                onChange={handleChange}
                required
                placeholder="e.g., JOB2024001"
              />
            </div>

            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div className="form-group">
              <label>Job Role *</label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                required
                placeholder="e.g., Full Stack Developer"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CTC *</label>
              <input
                type="text"
                name="ctc"
                value={formData.ctc}
                onChange={handleChange}
                required
                placeholder="e.g., 6-8 LPA"
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Bangalore, India"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Job Type *</label>
              <select name="jobType" value={formData.jobType} onChange={handleChange}>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div className="form-group">
              <label>Work Mode *</label>
              <select name="workMode" value={formData.workMode} onChange={handleChange}>
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Application Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Application End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="recruitment@company.com"
            />
          </div>
        </section>

        {/* Job Description */}
        <section className="form-section">
          <h2>Job Description</h2>
          
          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Detailed job description, responsibilities, etc."
            />
          </div>

          <div className="form-group">
            <label>About Company</label>
            <textarea
              name="aboutCompany"
              value={formData.aboutCompany}
              onChange={handleChange}
              rows="4"
              placeholder="Brief about your company"
            />
          </div>

          <div className="form-group">
            <label>Requirements (one per line)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="5"
              placeholder="Bachelor's degree in Computer Science&#10;2+ years of experience&#10;Strong problem-solving skills"
            />
          </div>
        </section>

        {/* Skills */}
        <section className="form-section">
          <h2>Skills Required</h2>
          
          <div className="form-group">
            <label>Required Skills (comma-separated) *</label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              required
              placeholder="JavaScript, React, Node.js"
            />
          </div>

          <div className="form-group">
            <label>Preferred Skills (comma-separated)</label>
            <input
              type="text"
              name="preferredSkills"
              value={formData.preferredSkills}
              onChange={handleChange}
              placeholder="TypeScript, AWS, Docker"
            />
          </div>
        </section>

        {/* Interview Process */}
        <section className="form-section">
          <div className="section-header">
             <h2>Interview Process</h2>
             <button type="button" onClick={addRound} className="btn-add-round">
               + Add Round
             </button>
          </div>
          
          {rounds.map((round, index) => (
            <div key={index} className="round-card">
              <div className="round-header">
                <h4>Round {index + 1}</h4>
                {rounds.length > 1 && (
                  <button type="button" onClick={() => removeRound(index)} className="btn-remove">
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Round Name *</label>
                  <input
                    type="text"
                    value={round.step}
                    onChange={(e) => handleRoundChange(index, "step", e.target.value)}
                    placeholder="e.g., Aptitude Test"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={round.date}
                    onChange={(e) => handleRoundChange(index, "date", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description / Venue</label>
                <textarea
                  value={round.details}
                  onChange={(e) => handleRoundChange(index, "details", e.target.value)}
                  placeholder="e.g., Online test via HackerRank"
                  rows="2"
                />
              </div>
            </div>
          ))}
        </section>

        {/* Eligibility Criteria */}
        <section className="form-section">
          <h2>Eligibility Criteria</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Minimum CGPA</label>
              <input
                type="number"
                step="0.01"
                name="minCgpa"
                value={formData.minCgpa}
                onChange={handleChange}
                placeholder="e.g., 7.0"
              />
            </div>

            <div className="form-group">
              <label>Gender Preference</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="All">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Eligible Branches (comma-separated)</label>
            <input
              type="text"
              name="branches"
              value={formData.branches}
              onChange={handleChange}
              placeholder="Computer Science, IT, Electronics"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="backlogsAllowed"
                checked={formData.backlogsAllowed}
                onChange={handleChange}
              />
              <span>Allow students with backlogs</span>
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/employer/dashboard")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .page-container {
          max-width: 1000px;
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

        .job-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .form-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #eee;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section h2 {
          color: #0ea5e9;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0ea5e9;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: white;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
        }

        .btn-primary:hover:not(:disabled),
        .btn-secondary:hover {
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .section-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 1.5rem;
        }

        .section-header h2 {
           margin: 0;
        }

        .btn-add-round {
           background: #e0f2fe;
           color: #0ea5e9;
           border: none;
           padding: 0.5rem 1rem;
           border-radius: 6px;
           font-weight: 600;
           cursor: pointer;
           transition: background 0.2s;
        }

        .btn-add-round:hover {
           background: #bae6fd;
        }

        .round-card {
           background: #f8fafc;
           border: 1px solid #e2e8f0;
           border-radius: 8px;
           padding: 1.5rem;
           margin-bottom: 1rem;
        }

        .round-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 1rem;
        }

        .round-header h4 {
           margin: 0;
           color: #475569;
           font-size: 1rem;
        }

        .btn-remove {
           color: #ef4444;
           background: none;
           border: none;
           font-size: 0.9rem;
           cursor: pointer;
           font-weight: 500;
        }

        .btn-remove:hover {
           text-decoration: underline;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PostJob;
