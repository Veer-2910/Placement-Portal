import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

const SubmitFeedback = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(null);
  const [formData, setFormData] = useState({
    technicalSkills: 3,
    communication: 3,
    professionalism: 3,
    problemSolving: 3,
    teamwork: 3,
    overallJobReadiness: 3,
    detailedComments: "",
    strengths: "",
    areasForImprovement: "",
    industryExpectations: "",
    marketReadiness: "Needs Improvement",
    recommendation: "Consider"
  });

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }

      // Note: You may need to create a specific endpoint to get application details
      // For now, we'll just set a placeholder
      setApplication({
        student: {
          fullName: "Student Name",
          universityEmail: "student@university.edu"
        }
      });
    } catch (error) {
      console.error("Error fetching application:", error);
    }
  };

  const handleRatingChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: parseInt(value)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("employerToken");

      const payload = {
        ratings: {
          technicalSkills: formData.technicalSkills,
          communication: formData.communication,
          professionalism: formData.professionalism,
          problemSolving: formData.problemSolving,
          teamwork: formData.teamwork,
          overallJobReadiness: formData.overallJobReadiness
        },
        detailedComments: formData.detailedComments,
        strengths: formData.strengths.split("\n").filter(s => s.trim()),
        areasForImprovement: formData.areasForImprovement.split("\n").filter(a => a.trim()),
        industryExpectations: formData.industryExpectations,
        marketReadiness: formData.marketReadiness,
        recommendation: formData.recommendation
      };

      const response = await axios.post(
        `http://localhost:5000/api/employer/students/applications/${applicationId}/feedback`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Feedback submitted successfully!");
        navigate(-1); // Go back to previous page
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const RatingStars = ({ value, onChange, label }) => {
    return (
      <div className="rating-group">
        <label>{label}</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${value >= star ? "filled" : ""}`}
              onClick={() => onChange(star)}
            >
              ★
            </span>
          ))}
          <span className="rating-value">({value}/5)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Submit Feedback</h1>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        {/* Rating Section */}
        <section className="form-section">
          <h2>Performance Ratings</h2>
          <p className="section-description">Rate the candidate on a scale of 1-5 stars</p>

          <div className="ratings-grid">
            <RatingStars
              label="Technical Skills"
              value={formData.technicalSkills}
              onChange={(val) => handleRatingChange("technicalSkills", val)}
            />
            <RatingStars
              label="Communication"
              value={formData.communication}
              onChange={(val) => handleRatingChange("communication", val)}
            />
            <RatingStars
              label="Professionalism"
              value={formData.professionalism}
              onChange={(val) => handleRatingChange("professionalism", val)}
            />
            <RatingStars
              label="Problem Solving"
              value={formData.problemSolving}
              onChange={(val) => handleRatingChange("problemSolving", val)}
            />
            <RatingStars
              label="Teamwork"
              value={formData.teamwork}
              onChange={(val) => handleRatingChange("teamwork", val)}
            />
            <RatingStars
              label="Overall Job Readiness"
              value={formData.overallJobReadiness}
              onChange={(val) => handleRatingChange("overallJobReadiness", val)}
            />
          </div>
        </section>

        {/* Detailed Feedback */}
        <section className="form-section">
          <h2>Detailed Feedback</h2>

          <div className="form-group">
            <label>Overall Comments *</label>
            <textarea
              name="detailedComments"
              value={formData.detailedComments}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Provide detailed feedback about the candidate's performance, interview, or assessment..."
            />
          </div>

          <div className="form-group">
            <label>Strengths (one per line)</label>
            <textarea
              name="strengths"
              value={formData.strengths}
              onChange={handleChange}
              rows="4"
              placeholder="Strong problem-solving abilities&#10;Excellent communication skills&#10;Quick learner"
            />
          </div>

          <div className="form-group">
            <label>Areas for Improvement (one per line)</label>
            <textarea
              name="areasForImprovement"
              value={formData.areasForImprovement}
              onChange={handleChange}
              rows="4"
              placeholder="Needs more experience with cloud technologies&#10;Could improve time management&#10;Should work on presentation skills"
            />
          </div>
        </section>

        {/* Industry Insights */}
        <section className="form-section">
          <h2>Industry Insights</h2>

          <div className="form-group">
            <label>Industry Expectations & Skill Requirements</label>
            <textarea
              name="industryExpectations"
              value={formData.industryExpectations}
              onChange={handleChange}
              rows="4"
              placeholder="Share insights about current industry expectations, required skills, and what companies are looking for..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Market Readiness *</label>
              <select
                name="marketReadiness"
                value={formData.marketReadiness}
                onChange={handleChange}
                required
              >
                <option value="Ready">Ready for Industry</option>
                <option value="Needs Improvement">Needs Improvement</option>
                <option value="Not Ready">Not Ready</option>
              </select>
            </div>

            <div className="form-group">
              <label>Final Recommendation *</label>
              <select
                name="recommendation"
                value={formData.recommendation}
                onChange={handleChange}
                required
              >
                <option value="Strongly Recommend">Strongly Recommend</option>
                <option value="Recommend">Recommend</option>
                <option value="Consider">Consider</option>
                <option value="Not Recommended">Not Recommended</option>
              </select>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .page-container {
          max-width: 900px;
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

        .feedback-form {
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
          margin-bottom: 0.5rem;
          font-size: 1.3rem;
        }

        .section-description {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .ratings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .rating-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rating-group label {
          color: #333;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .stars {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .star {
          font-size: 2rem;
          cursor: pointer;
          color: #ddd;
          transition: color 0.2s;
          user-select: none;
        }

        .star.filled {
          color: #fbbf24;
        }

        .star:hover {
          color: #fbbf24;
        }

        .rating-value {
          margin-left: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
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

        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.3s;
        }

        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0ea5e9;
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

        @media (max-width: 768px) {
          .ratings-grid {
            grid-template-columns: 1fr;
          }

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

export default SubmitFeedback;
