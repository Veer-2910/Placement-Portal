import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RotateCcw,
  User,
  SlidersHorizontal,
  ChevronRight,
  FileText
} from "lucide-react";
import axios from "axios";
import "../../App.css";

const BrowseStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    branch: "",
    minCgpa: "",
    maxCgpa: "",
    skills: "",
    status: "",
    applicationStatus: "" // NEW: filter by application status
  });
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await axios.get(
        `http://localhost:5000/api/employer/students?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    setLoading(true);
    fetchStudents();
  };

  const handleReset = () => {
    setFilters({
      branch: "",
      minCgpa: "",
      maxCgpa: "",
      skills: "",
      status: "",
      applicationStatus: ""
    });
    setLoading(true);
    setTimeout(() => fetchStudents(), 100);
  };

  const handleExport = async (status = "") => {
    try {
      const token = sessionStorage.getItem("employerToken");
      const params = status ? `?status=${status}` : "";
      
      const response = await axios.get(
        `http://localhost:5000/api/employer/students/export${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = status 
        ? `applicants_${status.toLowerCase()}_${Date.now()}.csv` 
        : `applicants_all_${Date.now()}.csv`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert(error.response?.data?.message || "Failed to export data");
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = sessionStorage.getItem("employerToken");
      let endpoint = "";

      if (newStatus === "Shortlisted") endpoint = "shortlist";
      else if (newStatus === "Selected") endpoint = "select";
      else if (newStatus === "Rejected") endpoint = "reject";
      else return; // Ignore Pending or invalid

      await axios.post(
        `http://localhost:5000/api/employer/jobs/applications/${applicationId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic update
      setStudents(prev => prev.map(student => {
        if (student.applicationInfo?.applicationId === applicationId) {
          return { 
            ...student, 
            applicationInfo: { 
              ...student.applicationInfo, 
              status: newStatus 
            } 
          };
        }
        return student;
      }));
      
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Browse Students</h1>
          <p className="subtitle">Students who have applied to your job postings</p>
        </div>
        <div className="export-buttons">
          <button onClick={() => handleExport()} className="btn-primary">
            📥 Export All
          </button>
          <div className="dropdown">
            <button 
              className="btn-secondary dropdown-toggle"
              onClick={() => setShowExportMenu(!showExportMenu)}
              onBlur={() => setTimeout(() => setShowExportMenu(false), 200)}
            >
              Export by Status ▼
            </button>
            <div className={`dropdown-menu ${showExportMenu ? 'show' : ''}`}>
              <button onMouseDown={() => handleExport("Selected")}>✅ Selected</button>
              <button onMouseDown={() => handleExport("Rejected")}>❌ Rejected</button>
              <button onMouseDown={() => handleExport("Shortlisted")}>⭐ Shortlisted</button>
              <button onMouseDown={() => handleExport("Pending")}>⏳ Pending</button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <h3>Filter Students</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Branch</label>
            <input
              type="text"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
              placeholder="e.g., Computer Science"
            />
          </div>

          <div className="form-group">
            <label>Min CGPA</label>
            <input
              type="number"
              step="0.01"
              name="minCgpa"
              value={filters.minCgpa}
              onChange={handleFilterChange}
              placeholder="e.g., 7.0"
            />
          </div>

          <div className="form-group">
            <label>Max CGPA</label>
            <input
              type="number"
              step="0.01"
              name="maxCgpa"
              value={filters.maxCgpa}
              onChange={handleFilterChange}
              placeholder="e.g., 10.0"
            />
          </div>



          <div className="form-group">
            <label>Application Status</label>
            <select name="applicationStatus" value={filters.applicationStatus} onChange={handleFilterChange}>
              <option value="">All Applicants</option>
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
          <button onClick={handleReset} className="btn-secondary">
            Reset
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-notice">
        <span className="icon">🔒</span>
        <p>
          <strong>Privacy Notice:</strong> You are viewing students who have applied to your job postings. 
          Filter by application status and export data using the buttons above.
        </p>
      </div>

      {/* Students Table */}
      <div className="table-responsive rounded-4 shadow-sm bg-white border">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="py-3 ps-4 border-0 text-secondary small fw-bold text-uppercase">Candidate</th>
              <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Academic Info</th>
              <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">CGPA</th>
              <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Status</th>
              <th className="py-3 border-0 text-secondary small fw-bold text-uppercase">Application</th>
              <th className="py-3 pe-4 border-0 text-secondary small fw-bold text-uppercase text-end">Actions</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {students.length === 0 ? (
              <tr>
                 <td colSpan="6" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center">
                       <span className="display-6 text-muted mb-3 opacity-50">👥</span>
                       <h5 className="text-secondary fw-bold">No applicants found</h5>
                       <p className="text-muted small">Try adjusting your filters or search criteria.</p>
                    </div>
                 </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  {/* Candidate */}
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center">
                      <div className="avatar me-3 flex-shrink-0">
                         {student.profilePicture ? (
                            <img 
                              src={`http://localhost:5000${student.profilePicture}`} 
                              alt={student.fullName} 
                              className="rounded-circle object-fit-cover shadow-sm"
                              style={{width: '40px', height: '40px'}}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                         ) : null}
                         <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold border" 
                              style={{width: '40px', height: '40px', display: student.profilePicture ? 'none' : 'flex'}}>
                            {student.fullName?.charAt(0) || "S"}
                         </div>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{student.fullName}</h6>
                        <small className="text-muted">{student.enrollmentNumber || student.studentId || "No ID"}</small>
                      </div>
                    </div>
                  </td>

                  {/* Academic Info */}
                  <td className="py-3">
                    <div className="d-flex flex-column">
                       <span className="fw-medium text-dark">{student.branch}</span>
                       <small className="text-muted mb-0">
                          {student.yearOfEnrollment 
                             ? `${student.yearOfEnrollment} Batch` 
                             : (student.academicYear || student.semester || "N/A")}
                       </small>
                    </div>
                  </td>

                  {/* CGPA */}
                  <td className="py-3">
                    <span className={`badge rounded-pill fw-medium ${student.cgpa >= 8 ? 'bg-success-subtle text-success' : 'bg-light text-dark border'}`}>
                       {student.cgpa ? Number(student.cgpa).toFixed(2) : "N/A"}
                    </span>
                  </td>

                  {/* Student Status */}
                  <td className="py-3">
                     <span className={`badge rounded-1 px-2 py-1 fw-normal ${
                        student.status === 'Placed' ? 'bg-success text-white' : 
                        student.status === 'Interning' ? 'bg-info text-white' : 
                        'bg-light text-secondary border'
                     }`}>
                        {student.status || "Active"}
                     </span>
                  </td>

                  {/* Application Status */}
                  <td className="py-3">
                    {student.applicationInfo ? (
                        <select
                          className={`form-select form-select-sm border-0 fw-bold text-uppercase small w-auto ${
                            student.applicationInfo.status === 'Selected' ? 'text-success bg-success-subtle' :
                            student.applicationInfo.status === 'Rejected' ? 'text-danger bg-danger-subtle' :
                            student.applicationInfo.status === 'Shortlisted' ? 'text-primary bg-primary-subtle' :
                            'text-warning-emphasis bg-warning-subtle'
                          }`}
                          style={{boxShadow: 'none', cursor: 'pointer', paddingRight: '2rem'}}
                          value={student.applicationInfo.status}
                          onChange={(e) => handleStatusChange(student.applicationInfo.applicationId, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                    ) : (
                       <span className="text-muted small fst-italic">Not Applied</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="pe-4 py-3 text-end">
                     <div className="d-flex justify-content-end gap-2">
                        {student.resume && (
                           <a 
                             href={`http://localhost:5000${student.resume}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="btn btn-sm btn-light border text-secondary"
                             title="View Resume"
                           >
                             <FileText size={16} />
                           </a>
                        )}
                        <button
                          onClick={() => navigate(`/employer/students/${student._id}`)}
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        >
                          View Profile <ChevronRight size={14} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1200px;
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
          font-size: 2rem;
          color: #1f2937;
          margin: 0;
          font-weight: 700;
        }

        .subtitle {
          color: #6b7280;
          margin: 0.5rem 0 0 0;
        }
        
        .export-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .dropdown {
          position: relative;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          width: 200px;
          display: none;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-menu.show {
          display: flex;
        }

        .dropdown-menu button {
          background: none;
          border: none;
          padding: 10px 15px;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-menu button:hover {
          background: #f5f7fa;
          color: #0ea5e9;
        }

        .filters-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .filters-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #374151;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #4b5563;
        }

        .form-group input,
        .form-group select {
          padding: 0.6rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .filter-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          border-top: 1px solid #f3f4f6;
          padding-top: 1rem;
        }

        .privacy-notice {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .privacy-notice .icon {
          font-size: 1.2rem;
        }

        .privacy-notice p {
          margin: 0;
          color: #1e3a8a;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .loading-container {
          min-height: 50vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0ea5e9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseStudents;
