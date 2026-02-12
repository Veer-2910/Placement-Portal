import { useState, useEffect } from "react";
import axios from "axios";
import { Award, TrendingUp, Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react";

export default function MyDriveResults() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/drives", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter only applied drives with stage-based workflow
      const appliedDrives = response.data.filter(d => d.hasApplied && d.stagesEnabled);
      setApplications(appliedDrives);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultForDrive = async (driveId, stageId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/aptitude-results/${driveId}/my-result?stageId=${stageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      return null; // Result not published yet
    }
  };

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark">My Drive Results</h2>
        <p className="text-secondary">View your aptitude test results and stage progress</p>
      </div>

      {applications.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <Award size={64} className="text-secondary mx-auto mb-3" />
          <h5 className="text-secondary">No stage-based drives yet</h5>
          <p className="text-muted">Results will appear here once you apply to drives with recruitment stages</p>
        </div>
      ) : (
        <div className="row g-4">
          {applications.map((app) => (
            <ApplicationCard key={app._id} application={app} fetchResult={fetchResultForDrive} />
          ))}
        </div>
      )}
    </div>
  );
}

// Subcomponent for individual application card
function ApplicationCard({ application, fetchResult }) {
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadResultAndProgress();
  }, [application._id]);

  const loadResultAndProgress = async () => {
    try {
      const token = sessionStorage.getItem("token");
      
      // Fetch stage progress
      const progressRes = await axios.get(
        `http://localhost:5000/api/stages/${application._id}/students/${application.myStudentId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(progressRes.data);

      // If there's a current stage, try to fetch result
      if (progressRes.data?.currentStage?._id) {
        const resultData = await fetchResult(application._id, progressRes.data.currentStage._id);
        setResult(resultData);
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  };

  return (
    <div className="col-md-6">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-2">{application.companyName}</h5>
          <p className="text-secondary mb-3">{application.title}</p>

          {/* Current Stage */}
          {progress?.currentStage && (
            <div className="mb-3 p-3 bg-primary bg-opacity-10 rounded-3">
              <div className="small text-secondary mb-1">Current Stage</div>
              <div className="fw-bold text-primary">{progress.currentStage.stageName}</div>
              {progress.currentStage.scheduledDate && (
                <div className="small text-muted mt-1 d-flex align-items-center gap-1">
                  <Calendar size={14} /> {new Date(progress.currentStage.scheduledDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Result Display */}
          {result?.result && (
            <div className={`p-3 rounded-3 mb-3 ${result.result.status === "Qualified" ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Latest Result</span>
                {result.result.status === "Qualified" ? (
                  <CheckCircle2 size={20} className="text-success" />
                ) : (
                  <XCircle size={20} className="text-danger" />
                )}
              </div>
              <div className="row g-2 small">
                <div className="col-6">
                  <div className="text-secondary">Marks</div>
                  <div className="fw-bold">{result.result.marksObtained}/{result.result.totalMarks}</div>
                </div>
                <div className="col-6">
                  <div className="text-secondary">Percentage</div>
                  <div className="fw-bold">{result.result.percentage}%</div>
                </div>
              </div>
              <div className="mt-2">
                <div className={`badge ${result.result.status === "Qualified" ? "bg-success" : "bg-danger"}`}>
                  {result.message}
                </div>
              </div>
            </div>
          )}

          {/* Next Stage Info */}
          {result?.nextStage && (
            <div className="alert alert-info mb-0">
              <div className="small fw-bold mb-1">Next Round:</div>
              <div>{result.nextStage.stageName}</div>
              {result.nextStage.scheduledDate && (
                <div className="small mt-1">
                  <Calendar size={12} /> {new Date(result.nextStage.scheduledDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Overall Status Badge */}
          <div className="mt-3">
            <span className={`badge ${progress?.overallStatus === "Selected" ? "bg-success" : progress?.overallStatus === "Eliminated" ? "bg-danger" : "bg-primary"}`}>
              {progress?.overallStatus || "Applied"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
