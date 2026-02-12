import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export default function UploadAptitudeResults() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchDriveAndStages();
  }, [driveId]);

  const fetchDriveAndStages = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      
      // Fetch drive details
      const driveRes = await axios.get(`http://localhost:5000/api/employer/jobs/${driveId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrive(driveRes.data.job);

      // Fetch stages
      if (driveRes.data.job?.stagesEnabled) {
        const stagesRes = await axios.get(`http://localhost:5000/api/stages/${driveId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStages(stagesRes.data.stages || []);
        if (stagesRes.data.stages && stagesRes.data.stages.length > 0) {
          setSelectedStage(stagesRes.data.stages[0]._id);
        }
      }
    } catch (err) {
      setError("Failed to load drive details");
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (["csv", "xlsx", "xls"].includes(ext)) {
        setUploadFile(file);
        setError("");
      } else {
        setError("Invalid file format. Only CSV and Excel files are supported.");
        setUploadFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedStage) {
      setError("Please select a stage and upload a file");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("stageId", selectedStage);

      const token = sessionStorage.getItem("employerToken");
      const response = await axios.post(
        `http://localhost:5000/api/aptitude-results/${driveId}/upload-csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSuccess(`Successfully processed ${response.data.processedCount} out of ${response.data.totalCount} students`);
      setUploadResult(response.data);
      setUploadFile(null);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload results");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Student ID,Marks Obtained\n202101001,75\n202101002,82\n202101003,68";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aptitude_results_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!drive) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <button
          className="btn btn-light rounded-pill px-4 mb-3 d-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="fw-bold text-dark">Upload Aptitude Test Results</h2>
        <p className="text-secondary">{drive.companyName} - {drive.title}</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <CheckCircle size={20} /> {success}
        </div>
      )}

      <div className="row g-4">
        {/* Upload Card */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Upload Results</h5>

              {/* Stage Selection */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Select Stage</label>
                {stages.length === 0 ? (
                  <div className="alert alert-warning">
                    No stages found for this drive. Make sure you created a stage-based drive with recruitment stages.
                  </div>
                ) : (
                  <select
                    className="form-select"
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                  >
                    {stages.map((stage) => (
                      <option key={stage._id} value={stage._id}>
                        {stage.stageName} ({stage.stageType})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Upload CSV/Excel File</label>
                <div className="border-2 border-dashed rounded-4 p-4 text-center bg-light">
                  <Upload size={48} className="text-primary mb-3 mx-auto" />
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="form-control"
                  />
                  {uploadFile && (
                    <div className="mt-3 d-flex align-items-center justify-content-center gap-2 text-success">
                      <FileText size={18} />
                      <span>{uploadFile.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="btn btn-primary w-100 py-2 fw-bold"
                onClick={handleUpload}
                disabled={!uploadFile || !selectedStage || uploading}
              >
                {uploading ? "Uploading..." : "Upload Results"}
              </button>
            </div>
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div className="card border-0 shadow-sm rounded-4 mt-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Upload Summary</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="p-3 bg-primary bg-opacity-10 rounded-3">
                      <div className="small text-secondary">Total Rows</div>
                      <div className="h4 fw-bold text-primary mb-0">{uploadResult.totalCount}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-success bg-opacity-10 rounded-3">
                      <div className="small text-secondary">Processed</div>
                      <div className="h4 fw-bold text-success mb-0">{uploadResult.processedCount}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-danger bg-opacity-10 rounded-3">
                      <div className="small text-secondary">Errors</div>
                      <div className="h4 fw-bold text-danger mb-0">{uploadResult.errors?.length || 0}</div>
                    </div>
                  </div>
                </div>

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-bold text-danger">Errors:</h6>
                    <ul className="small text-danger mb-0">
                      {uploadResult.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate(`/employer/preview-results/${driveId}?stageId=${selectedStage}`)}
                  >
                    Preview & Publish Results →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Instructions</h5>
              <ol className="small mb-4">
                <li className="mb-2">Download the CSV template below</li>
                <li className="mb-2">Fill in Student ID and Marks Obtained columns</li>
                <li className="mb-2">Only students who applied to this drive can be evaluated</li>
                <li className="mb-2">Upload the completed file</li>
                <li className="mb-2">Preview results before publishing</li>
              </ol>

              <button
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={downloadTemplate}
              >
                <Download size={18} /> Download Template
              </button>
            </div>
          </div>

          {selectedStage && stages.length > 0 && (
            <div className="card border-0 shadow-sm rounded-4 mt-3">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Stage Information</h6>
                {stages.find((s) => s._id === selectedStage) && (
                  <div>
                    <div className="mb-2">
                      <span className="small text-secondary">Stage:</span>
                      <div className="fw-semibold">{stages.find((s) => s._id === selectedStage).stageName}</div>
                    </div>
                    <div className="mb-2">
                      <span className="small text-secondary">Cutoff:</span>
                      <div className="fw-semibold">
                        {stages.find((s) => s._id === selectedStage).cutoffCriteria?.value || "N/A"}
                        {stages.find((s) => s._id === selectedStage).cutoffCriteria?.type === "percentage" ? "%" : " marks"}
                      </div>
                    </div>
                    <div>
                      <span className="small text-secondary">Total Marks:</span>
                      <div className="fw-semibold">
                        {stages.find((s) => s._id === selectedStage).cutoffCriteria?.totalMarks || 100}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
