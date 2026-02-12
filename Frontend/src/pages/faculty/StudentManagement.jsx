import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, 
  Search, 
  User, 
  Award, 
  Briefcase, 
  ArrowLeft,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  BookOpen,
  MapPin,
  Mail,
  Phone,
  LayoutDashboard,
  PieChart,
  UserPlus,
  ArrowUpRight,
  Download,
  RefreshCcw,
  X,
  Smartphone,
  Check,
  Building2,
  Calendar,
  Layers,
  FileText
} from "lucide-react";



export default function StudentManagement({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [view, setView] = useState("list"); // list, detail
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    branch: "",
    status: "",
    minCgpa: ""
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [studentForm, setStudentForm] = useState({
    studentId: "",
    fullName: "",
    universityEmail: "",
    branch: "",
    cgpa: "",
    institute: "",
    status: "Active"
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/students/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchStudents = async () => {

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentHistory = async (studentId) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/students/${studentId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedStudent(response.data.student);
      setStudentHistory(response.data.applications);
      setView("detail");
    } catch (err) {
      setError("Failed to load student history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchStats();
    }
  }, [user]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const token = sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/students", studentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      fetchStudents();
      fetchStats();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create student");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.patch(`http://localhost:5000/api/students/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
      fetchStats();
      if (selectedStudent && selectedStudent._id === id) {
        setSelectedStudent(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  };

  const toggleSelectStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (!newStatus || selectedStudents.length === 0) return;
    try {
      setIsProcessingBulk(true);
      const token = sessionStorage.getItem("token");
      await Promise.all(selectedStudents.map(id => 
        axios.patch(`http://localhost:5000/api/students/${id}/status`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      fetchStudents();
      fetchStats();
      setSelectedStudents([]);
    } catch (err) {
      console.error("Bulk update failed", err);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const resetForm = () => {
    setStudentForm({
      studentId: "",
      fullName: "",
      universityEmail: "",
      branch: "",
      cgpa: "",
      institute: "",
      status: "Active"
    });
  };

  const exportToCSV = () => {
    const headers = ["Student ID", "Full Name", "Email", "Branch", "CGPA", "Institute", "Status"];
    const rows = filteredStudents.map(s => [
      s.studentId,
      s.fullName,
      s.universityEmail,
      s.branch,
      s.cgpa,
      s.institute || "N/A",
      s.status || "Active"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_directory.csv";
    a.click();
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBranch = !filters.branch || s.branch === filters.branch;
    const matchesStatus = !filters.status || s.status === filters.status;
    const matchesCgpa = !filters.minCgpa || (s.cgpa >= parseFloat(filters.minCgpa));

    return matchesSearch && matchesBranch && matchesStatus && matchesCgpa;
  });


  if (view === "detail" && selectedStudent) {
    return (
      <div className="dash-container p-4">
        <div className="mb-4">
          <button className="btn btn-light rounded-pill px-4 shadow-sm d-flex align-items-center gap-2" onClick={() => setView("list")}>
            <ArrowLeft size={18} /> Back to Student List
          </button>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="p-4 text-center bg-transparent border-bottom">
                <div className="bg-primary text-white rounded-circle p-4 mx-auto mb-3 shadow-lg" style={{width: '100px', height: '100px', display: 'grid', placeItems: 'center'}}>
                  <h1 className="mb-0 display-4 fw-bold text-white">{selectedStudent.fullName.charAt(0)}</h1>
                </div>
                <h4 className="fw-bold mb-1 text-dark">{selectedStudent.fullName}</h4>
                <p className="text-primary small mb-0">{selectedStudent.studentId}</p>
              </div>
              <div className="card-body p-4">
                <div className="mb-4 pb-4 border-bottom">
                  <h6 className="text-secondary fw-bold text-uppercase small mb-3">Academic Snapshot</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Institute</span>
                    <span className="fw-bold">{selectedStudent.institute || 'N/A'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">Branch</span>
                    <span className="fw-bold">{selectedStudent.branch}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary">CGPA</span>
                    <span className="fw-bold text-primary">{selectedStudent.cgpa}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Batch</span>
                    <span className="fw-bold">{selectedStudent.academicYear || selectedStudent.yearOfEnrollment || ''}</span>
                  </div>
                </div>

                <div className="mb-4 pb-4 border-bottom">
                  <h6 className="text-secondary fw-bold text-uppercase small mb-3">Contact Info</h6>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <Mail size={16} className="text-blue-500" />
                    <span className="small">{selectedStudent.universityEmail}</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <Phone size={16} className="text-blue-500" />
                    <span className="small">{selectedStudent.phone || 'Not provided'}</span>
                  </div>
                </div>

                <a 
                  href={`http://localhost:5000${selectedStudent.resume}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 rounded-3"
                >
                  <FileText size={18} /> View Resume
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white p-4 border-bottom">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Briefcase size={20} className="text-primary" /> Placement Application Journey
                </h5>
              </div>
              <div className="card-body p-4">
                {studentHistory.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="bg-slate-50 rounded-circle p-4 d-inline-block mb-3">
                      <Clock size={48} className="text-slate-300" />
                    </div>
                    <p className="text-muted">No placement activities recorded for this student yet.</p>
                  </div>
                ) : (
                  <div className="timeline">
                    {studentHistory.map((app, idx) => (
                      <div key={app._id} className="timeline-item pb-4 mb-4 border-start ps-4 position-relative">
                        <div className={`timeline-dot position-absolute start-0 top-0 rounded-circle ${
                          app.status === 'Selected' ? 'bg-success' : 
                          app.status === 'Rejected' ? 'bg-danger' : 
                          app.status === 'Shortlisted' ? 'bg-info' : 'bg-warning'
                        }`} style={{ width: '12px', height: '12px', marginLeft: '-6.5px' }}></div>
                        
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-bold text-dark mb-1">{app.drive?.companyName}</h6>
                            <p className="text-primary small mb-1">{app.drive?.title}</p>
                            <span className="text-secondary small">{new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`badge rounded-pill px-3 py-2 fw-bold ${
                            app.status === 'Selected' ? 'bg-success-subtle text-success' : 
                            app.status === 'Rejected' ? 'bg-danger-subtle text-danger' : 
                            app.status === 'Shortlisted' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        {app.notes && (
                          <div className="mt-2 p-2 bg-light rounded small text-secondary">
                            <strong>Note:</strong> {app.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .bg-slate-900 { background-color: #0f172a; }
          .text-blue-300 { color: #93c5fd; }
          .timeline-item:last-child { border-left: none !important; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dash-container p-0 border-0 bg-transparent">
      <div className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
           style={{ 
             background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)", 
             backdropFilter: "blur(20px)",
             boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)"
           }}>
        <div className="position-relative z-1 d-flex justify-content-between align-items-center text-dark">
          <div>
            <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2">MANAGEMENT HUB</p>
            <h1 className="dash-title display-6 fw-bold mb-2 text-dark">Student Directory</h1>
            <p className="text-secondary fs-5 mb-0" style={{maxWidth: '600px'}}>Comprehensive data management and performance analytics.</p>
          </div>

        </div>
        <div className="hero-pattern position-absolute top-0 end-0 p-5 opacity-10">
           <Users size={200} className="text-slate-400" />
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="row g-4 mb-4">
           <div className="col-md-4">
              <div className="card shadow-sm h-100 p-3">
                 <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle text-primary rounded-3 p-3">
                       <Users size={24} />
                    </div>
                    <div>
                       <p className="small text-secondary fw-bold text-uppercase mb-0">Total Students</p>
                       <h3 className="fw-bold text-dark mb-0">{stats.total}</h3>
                    </div>
                 </div>
              </div>
           </div>
           <div className="col-md-4">
              <div className="card shadow-sm h-100 p-3">
                 <div className="d-flex align-items-center gap-3">
                    <div className="bg-amber-50 text-amber-600 rounded-3 p-3">
                       <Briefcase size={24} />
                    </div>
                    <div>
                       <p className="small text-secondary fw-bold text-uppercase mb-0">Placed/Interning</p>
                       <h3 className="fw-bold text-dark mb-0">{(stats.statusWise.Placed || 0) + (stats.statusWise.Interning || 0)}</h3>
                    </div>
                 </div>
              </div>
           </div>
           <div className="col-md-4">
              <div className="card shadow-sm h-100 p-3">
                 <div className="d-flex align-items-center gap-3">
                    <div className="bg-purple-50 text-purple-600 rounded-3 p-3">
                       <Layers size={24} />
                    </div>
                    <div>
                       <p className="small text-secondary fw-bold text-uppercase mb-0">Active Seeking</p>
                       <h3 className="fw-bold text-dark mb-0">{stats.statusWise["Seeking Opportunities"] || 0}</h3>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white p-4 border-bottom">
           <div className="d-flex flex-column gap-4">
              <div className="d-flex flex-column flex-md-row gap-4 align-items-center justify-content-between">
                 <div className="input-group" style={{maxWidth: '400px'}}>
                   <span className="input-group-text bg-light border-0"><Search size={18} className="text-secondary" /></span>
                   <input
                     type="text"
                     className="form-control bg-light border-0 py-2"
                     placeholder="Search by name, ID..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
                  <div className="d-flex gap-2">
                     <button className="btn btn-primary text-white shadow-lg rounded-pill px-4 fw-bold d-flex align-items-center gap-2 border-0 gradient-btn hover-scale" onClick={exportToCSV}>
                        <Download size={18} /> Export Directory
                     </button>
                 </div>
              </div>

              {/* Advanced Filters */}
              <div className="row g-3">
                 <div className="col-md-4">
                    <div className="input-group input-group-sm">
                       <span className="input-group-text bg-white border-end-0 text-secondary small fw-bold">BRANCH</span>
                       <select className="form-select bg-white border-start-0 fs-7" value={filters.branch} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
                          <option value="">All Branches</option>
                          {stats && Object.keys(stats.branchWise).map(b => <option key={b} value={b}>{b}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="col-md-4">
                    <div className="input-group input-group-sm">
                       <span className="input-group-text bg-white border-end-0 text-secondary small fw-bold">STATUS</span>
                       <select className="form-select bg-white border-start-0 fs-7" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                          <option value="">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Interning">Interning</option>
                          <option value="Placed">Placed</option>
                          <option value="Graduated">Graduated</option>
                          <option value="Seeking Opportunities">Seeking</option>
                       </select>
                    </div>
                 </div>
                 
                 <div className="col-md-4 text-end">
                    <button className="btn btn-link btn-sm text-secondary text-decoration-none fw-bold" onClick={() => setFilters({branch: "", status: "", minCgpa: ""})}>
                       Clear All Filters
                    </button>
                 </div>
              </div>
           </div>
        </div>

        
         {/* Bulk Actions Bar */}
         {selectedStudents.length > 0 && (
            <div className="bg-primary p-3 d-flex align-items-center justify-content-between text-white shadow-lg animate-fade-in" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <div className="fw-bold d-flex align-items-center gap-3">
                    <CheckCircle size={20} /> {selectedStudents.length} Students Selected
                    <button className="btn btn-sm btn-outline-light border-0" onClick={() => setSelectedStudents([])}>Deselect All</button>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span className="small opacity-75">Update Status:</span>
                    <select 
                      className="form-select form-select-sm bg-white border-0" 
                      style={{ width: '150px' }}
                      onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                      disabled={isProcessingBulk}
                      value=""
                    >
                        <option value="" disabled>Change to...</option>
                        <option value="Active">Active</option>
                        <option value="Interning">Interning</option>
                        <option value="Placed">Placed</option>
                        <option value="Seeking Opportunities">Seeking</option>
                    </select>
                </div>
            </div>
         )}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-secondary small fw-bold text-uppercase">
                <tr>
                  <th className="px-4 py-3 border-0" style={{width: '40px'}}>
                     <input type="checkbox" className="form-check-input" checked={selectedStudents.length > 0 && selectedStudents.length === filteredStudents.length} onChange={toggleSelectAll} />
                  </th>
                  <th className="py-3 border-0">Student Info</th>
                  <th className="py-3 border-0">Academic Snapshot</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="px-4 py-3 border-0 text-end">Action</th>

                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">No students matching your search.</td></tr>
                ) : filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td className="px-4 py-3">
                       <input type="checkbox" className="form-check-input" checked={selectedStudents.includes(student._id)} onChange={() => toggleSelectStudent(student._id)} />
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-blue-100 text-blue rounded-3 p-2 me-3 fw-bold" style={{width: '40px', height: '40px', display: 'grid', placeItems: 'center'}}>
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="mb-0 fw-bold">{student.fullName}</p>
                          <p className="mb-0 text-secondary small">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                       <span className="text-dark fw-bold d-block">{student.branch}</span>
                       <span className="text-secondary small">Admission Year: {student.yearOfEnrollment || "2021"}</span>
                    </td>
                    <td className="py-3">
                       <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${student.cgpa >= 8.5 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'} rounded-pill px-3 py-2 fw-bold`}>
                             {student.cgpa} CGPA
                          </span>
                       </div>
                    </td>
                    <td className="py-3">
                       <div className="dropdown">
                          <button className={`btn btn-sm rounded-pill px-3 fw-bold dropdown-toggle border-0 ${
                             student.status === 'Placed' ? 'bg-success text-white' :
                             student.status === 'Interning' ? 'bg-info text-white' :
                             student.status === 'Seeking Opportunities' ? 'bg-warning text-dark' : 'bg-light text-dark'
                          }`} data-bs-toggle="dropdown">
                             {student.status || 'Active'}
                          </button>
                          <ul className="dropdown-menu shadow border-0">
                             <li><button className="dropdown-item small" onClick={() => handleStatusUpdate(student._id, 'Active')}>Active</button></li>
                             <li><button className="dropdown-item small" onClick={() => handleStatusUpdate(student._id, 'Interning')}>Interning</button></li>
                             <li><button className="dropdown-item small" onClick={() => handleStatusUpdate(student._id, 'Placed')}>Placed</button></li>
                             <li><button className="dropdown-item small" onClick={() => handleStatusUpdate(student._id, 'Graduated')}>Graduated</button></li>
                             <li><button className="dropdown-item small" onClick={() => handleStatusUpdate(student._id, 'Seeking Opportunities')}>Seeking</button></li>
                          </ul>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                       <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-primary rounded-pill px-3 py-1 btn-sm fw-bold d-flex align-items-center gap-2" onClick={() => fetchStudentHistory(student._id)}>
                             Track <ChevronRight size={16} />
                          </button>
                       </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3" 
             style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(12px)' }}>
          <div className="card border-white shadow-2xl rounded-4 overflow-hidden w-100 mx-3 animate-slide-up" 
               style={{ maxWidth: '700px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.5)' }}>
            <div className="p-4 d-flex justify-content-between align-items-center border-bottom bg-light">
              <h5 className="mb-0 fw-bold text-dark">Enroll New Student</h5>
              <button className="btn btn-link text-secondary p-0" onClick={() => { setShowAddModal(false); resetForm(); }}>
                 <X size={24} />
              </button>
            </div>
            <div className="card-body p-4 p-lg-5">
               <form onSubmit={handleCreateStudent}>
                  <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase">Enrollment / Student ID</label>
                        <input className="form-control bg-light border-0" value={studentForm.studentId} onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})} required />
                     </div>
                     <div className="col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase">Full Name</label>
                        <input className="form-control bg-light border-0" value={studentForm.fullName} onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})} required />
                     </div>
                     <div className="col-12">
                        <label className="form-label small fw-bold text-secondary text-uppercase">University Email</label>
                        <input type="email" className="form-control bg-light border-0" value={studentForm.universityEmail} onChange={(e) => setStudentForm({...studentForm, universityEmail: e.target.value})} required />
                     </div>
                     <div className="col-md-6">
                        <label className="form-label small fw-bold text-secondary text-uppercase">Branch</label>
                        <select className="form-select bg-light border-0" value={studentForm.branch} onChange={(e) => setStudentForm({...studentForm, branch: e.target.value})} required>
                           <option value="">Select Branch</option>
                           <option value="CSE">CSE (Computer Science)</option>
                           <option value="IT">IT (Information Technology)</option>
                           <option value="ECE">ECE (Electronics & Comm.)</option>
                           <option value="ME">ME (Mechanical)</option>
                           <option value="CE">CE (Civil)</option>
                        </select>
                     </div>
                     <div className="col-md-3">
                        <label className="form-label small fw-bold text-secondary text-uppercase">Current CGPA</label>
                        <input type="number" step="0.01" className="form-control bg-light border-0" value={studentForm.cgpa} onChange={(e) => setStudentForm({...studentForm, cgpa: e.target.value})} required />
                     </div>
                     <div className="col-md-3">
                        <label className="form-label small fw-bold text-secondary text-uppercase">Status</label>
                        <select className="form-select bg-light border-0" value={studentForm.status} onChange={(e) => setStudentForm({...studentForm, status: e.target.value})}>
                           <option value="Active">Active</option>
                           <option value="Interning">Interning</option>
                           <option value="Placed">Placed</option>
                           <option value="Graduated">Graduated</option>
                           <option value="Seeking Opportunities">Seeking</option>
                        </select>
                     </div>
                     <div className="col-12 text-end mt-4">
                        <button type="button" className="btn btn-light px-4 py-2 rounded-3 fw-bold me-2" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                        <button type="submit" className="btn btn-blue-500 px-5 py-2 rounded-3 fw-bold shadow-lg" disabled={formLoading}>
                           {formLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Check size={18} className="me-2" />}
                           Create Record
                        </button>
                      </div>
                  </div>
               </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .timeline-item:last-child { border-left: none !important; }
        .modal-overlay { transition: all 0.3s ease; backdrop-filter: blur(8px); }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .fs-7 { font-size: 0.85rem; }
      `}</style>
    </div>
  );
}

