import { useState, useEffect } from "react";
import axios from "axios";
import {  Eye, Send, CheckCircle, XCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

export default function PreviewResults() {
  const { driveId } = useParams();
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stageId");
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (stageId) fetchPreview();
  }, [driveId, stageId]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/aptitude-results/${driveId}/preview?stageId=${stageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(response.data.results);
      setStatistics(response.data.statistics);
    } catch (err) {
      setError("Failed to load results preview");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Are you sure you want to publish these results? Students will be notified.")) {
      return;
    }

    try {
      setPublishing(true);
      const token = sessionStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/aptitude-results/${driveId}/publish`,
        { stageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Results published successfully! Qualified students have been auto-progressed.");
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <button className="btn btn-light rounded-pill px-4 mb-3" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="fw-bold text-dark">Preview & Publish Results</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Statistics Cards */}
      {statistics && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary bg-opacity-10">
              <div className="small text-secondary">Total Students</div>
              <div className="h3 fw-bold text-primary mb-0">{statistics.totalStudents}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-success bg-opacity-10">
              <div className="small text-secondary">Qualified</div>
              <div className="h3 fw-bold text-success mb-0">{statistics.qualified}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-danger bg-opacity-10">
              <div className="small text-secondary">Not Qualified</div>
              <div className="h3 fw-bold text-danger mb-0">{statistics.notQualified}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-info bg-opacity-10">
              <div className="small text-secondary">Average Marks</div>
              <div className="h3 fw-bold text-info mb-0">{statistics.averageMarks}</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Results Preview</h5>
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handlePublish}
              disabled={publishing || results.length === 0}
            >
              <Send size={18} /> {publishing ? "Publishing..." : "Publish Results"}
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="fw-semibold">{result.studentId}</td>
                    <td>{result.studentName}</td>
                    <td><span className="badge bg-light text-dark">{result.branch}</span></td>
                    <td>{result.marksObtained}/{result.totalMarks}</td>
                    <td className="fw-bold">{result.percentage}%</td>
                    <td>
                      {result.status === "Qualified" ? (
                        <span className="badge bg-success d-flex align-items-center gap-1 w-fit">
                          <CheckCircle size={14} /> Qualified
                        </span>
                      ) : (
                        <span className="badge bg-danger d-flex align-items-center gap-1 w-fit">
                          <XCircle size={14} /> Not Qualified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
