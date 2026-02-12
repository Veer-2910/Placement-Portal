import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  ChevronLeft,
  GraduationCap,
  Calendar,
  Github,
  Globe,
  Target,
  DollarSign
} from "lucide-react";

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false); // State to track image load error

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    // ... (fetch logic remains same) ...
    try {
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/employer/students/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudent(response.data.student);
      } else {
        setError("Student not found.");
      }
    } catch (err) {
      console.error("Error fetching student details:", err);
      setError("Failed to load student details.");
    } finally {
      setLoading(false);
    }
  };

  // ... (loading and error states remain same) ...

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
     return (
       <div className="container py-5 text-center">
         <div className="alert alert-danger shadow-sm border-0 d-inline-block px-5">
            <h4 className="mb-2">⚠️ Error</h4>
            <p className="mb-0">{error}</p>
         </div>
         <div className="mt-4">
             <button onClick={() => navigate("/employer/students")} className="btn btn-primary rounded-pill px-4">
                 <ChevronLeft size={18} className="me-2" /> Back to Browse
             </button>
         </div>
       </div>
     );
   }

  if (!student) return null;

  return (
    <div className="page-container py-4 bg-light" style={{minHeight: '100vh'}}>
      <div className="container">
        {/* Navigation */}
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-link text-decoration-none text-secondary d-flex align-items-center p-0 fw-medium hover-translate"
          >
            <ChevronLeft size={20} className="me-1" /> Back to Applicants
          </button>
        </div>

        <div className="row g-4">
          {/* Left Column: Profile Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden sticky-top" style={{top: '2rem'}}>
              <div className="bg-gradient-primary p-5 text-center position-relative" style={{background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'}}>
                <div className="avatar-wrapper mb-3 mx-auto position-relative">
                   <div className="rounded-circle bg-white p-1 shadow-lg d-inline-block">
                     {student.profilePicture && !imgError ? (
                        <img 
                          src={`http://localhost:5000${student.profilePicture}`} 
                          alt={student.fullName} 
                          className="rounded-circle object-fit-cover" 
                          style={{width: '130px', height: '130px'}}
                          onError={() => setImgError(true)}
                        />
                     ) : (
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center text-primary fw-bold display-4" style={{width: '130px', height: '130px'}}>
                            {student.fullName?.charAt(0) || "S"}
                        </div>
                     )}
                   </div>
                </div>
                <h4 className="text-white fw-bold mb-1">{student.fullName}</h4>
                <div className="d-inline-block px-3 py-1 rounded-pill bg-white bg-opacity-10 mt-2 backdrop-blur-sm">
                    <p className="text-white-50 mb-0 small">{student.branch || "Student"}</p>
                </div>
              </div>
              
              <div className="card-body p-4 bg-white">
                 <div className="d-flex flex-column gap-3">
                    <h6 className="fw-bold text-secondary text-uppercase small mb-3 text-center border-bottom pb-2">Social Profiles</h6>
                    
                    <div className="d-flex justify-content-center gap-3">
                        {student.socialLinks?.github && (
                            <a href={student.socialLinks.github} target="_blank" rel="noreferrer" className="btn btn-light rounded-circle p-3 text-dark border hover-scale" title="GitHub">
                                <Github size={20} />
                            </a>
                        )}
                        {student.socialLinks?.portfolio && (
                            <a href={student.socialLinks.portfolio} target="_blank" rel="noreferrer" className="btn btn-light rounded-circle p-3 text-info border hover-scale" title="Portfolio">
                                <Globe size={20} />
                            </a>
                        )}
                        {student.socialLinks?.linkedin && (
                            <a href={student.socialLinks.linkedin} target="_blank" rel="noreferrer" className="btn btn-light rounded-circle p-3 text-primary border hover-scale" title="LinkedIn">
                                <ExternalLink size={20} />
                            </a>
                        )}
                        {(!student.socialLinks?.github && !student.socialLinks?.portfolio && !student.socialLinks?.linkedin) && (
                            <p className="text-muted small mb-0 fst-italic">No social links added.</p>
                        )}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="col-lg-8">
             <div className="d-flex flex-column gap-4">
                
                {/* About / Bio */}
                 <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 p-4 pb-0">
                         <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                             <User className="text-primary" size={20} /> About Me
                        </h5>
                    </div>
                    <div className="card-body p-4">
                       <p className="text-secondary lh-lg mb-0 text-start">
                           {student.bio || "No bio added yet."}
                       </p>
                    </div>
                </div>

                {/* Resume Card */}
                <div className="card border-0 shadow-sm rounded-4">
                   <div className="card-header bg-white border-0 p-4 pb-0">
                      <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                          <FileText size={18} className="text-danger" /> Resume & CV
                      </h5>
                   </div>
                   <div className="card-body p-4">
                      {student.resume ? (
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 border">
                            <div className="bg-white p-2 rounded shadow-sm">
                                <FileText size={24} className="text-danger" />
                            </div>
                            <div>
                                <span className="d-block fw-bold small text-dark">{student.fullName}_Resume.pdf</span>
                                <span className="text-success small d-flex align-items-center gap-1">
                                    Verified & Uploaded
                                </span>
                            </div>
                            <a 
                                href={`http://localhost:5000${student.resume}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ms-auto btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1"
                            >
                                <ExternalLink size={14} /> View
                            </a>
                        </div>
                      ) : (
                        <p className="text-muted small mb-0">No resume uploaded.</p>
                      )}
                   </div>
                </div>

                {/* Personal Information */}
                <div className="card border-0 shadow-sm rounded-4">
                   <div className="card-header bg-white border-0 p-4 pb-0">
                      <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                          <User size={18} className="text-primary" /> Personal Information
                      </h5>
                   </div>
                   <div className="card-body p-4 pt-0">
                      <div className="py-2 border-bottom d-flex justify-content-between">
                          <span className="text-secondary small">Full Name</span>
                          <span className="fw-medium text-dark">{student.fullName}</span>
                      </div>
                      <div className="py-2 border-bottom d-flex justify-content-between">
                          <span className="text-secondary small">Current Location</span>
                          <span className="fw-medium text-dark">{student.location || "N/A"}</span>
                      </div>
                      <div className="py-2 border-bottom d-flex justify-content-between">
                          <span className="text-secondary small">Personal Email</span>
                          <span className="fw-medium text-dark">{student.personalEmail || "N/A"}</span>
                      </div>
                      <div className="py-2 border-bottom d-flex justify-content-between">
                          <span className="text-secondary small">Contact Phone</span>
                          <span className="fw-medium text-dark">{student.phone || "N/A"}</span>
                      </div>
                      <div className="py-2 d-flex justify-content-between">
                          <span className="text-secondary small">Gender Identity</span>
                          <span className="fw-medium text-dark">{student.gender || "N/A"}</span>
                      </div>
                   </div>
                </div>

                {/* Categorized Skills & Interests */}
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                             <div className="card-header bg-white border-0 p-4 pb-0">
                                <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                                     Skills
                                </h5>
                             </div>
                             <div className="card-body p-4">
                                <div className="d-flex flex-wrap gap-2">
                                     {student.skills && student.skills.length > 0 ? (
                                        student.skills.map((skill, index) => (
                                            <span key={index} className="badge bg-blue-50 text-blue-600 border border-blue-100 px-3 py-2 rounded-pill fw-medium">
                                                {skill}
                                            </span>
                                        ))
                                     ) : <span className="text-muted small">None listed</span>}
                                </div>
                             </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                             <div className="card-header bg-white border-0 p-4 pb-0">
                                <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                                     Interests
                                </h5>
                             </div>
                             <div className="card-body p-4">
                                <div className="d-flex flex-wrap gap-2">
                                     {student.interestAreas && student.interestAreas.length > 0 ? (
                                        student.interestAreas.map((area, index) => (
                                            <span key={index} className="badge bg-green-50 text-green-600 border border-green-100 px-3 py-2 rounded-pill fw-medium">
                                                {area}
                                            </span>
                                        ))
                                     ) : <span className="text-muted small">None listed</span>}
                                </div>
                             </div>
                        </div>
                    </div>
                     <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4">
                             <div className="card-header bg-white border-0 p-4 pb-0">
                                <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                                     Projects & Achievements
                                </h5>
                             </div>
                             <div className="card-body p-4">
                                <div className="d-flex flex-wrap gap-2">
                                     {student.projects && student.projects.length > 0 ? (
                                        student.projects.map((project, index) => (
                                            <span key={index} className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill fw-medium">
                                                {project}
                                            </span>
                                        ))
                                     ) : <span className="text-muted small">None listed</span>}
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Job & Match Preferences */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 p-4 pb-0">
                         <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                             <Briefcase className="text-primary" size={20} /> Job & Match Preferences
                        </h5>
                    </div>
                    <div className="card-body p-4">
                       <div className="row g-4">
                           <div className="col-md-12">
                               <p className="small text-secondary fw-bold text-uppercase mb-2">Preferred Job Roles</p>
                               <div className="d-flex flex-wrap gap-2">
                                   {student.preferences?.roles && student.preferences.roles.length > 0 ? (
                                       student.preferences.roles.map((role, i) => (
                                           <span key={i} className="badge bg-blue-50 text-blue-600 border border-blue-100 px-3 py-2 rounded-pill">
                                               {role}
                                           </span>
                                       ))
                                   ) : <span className="text-muted small">Not specified</span>}
                               </div>
                           </div>
                           <div className="col-md-6">
                               <p className="small text-secondary fw-bold text-uppercase mb-2">Preferred Locations</p>
                               <div className="d-flex flex-wrap gap-2">
                                   {student.preferences?.locations && student.preferences.locations.length > 0 ? (
                                       student.preferences.locations.map((loc, i) => (
                                            <span key={i} className="badge bg-light text-secondary border px-2 py-1 rounded d-flex align-items-center gap-1">
                                                <MapPin size={10} /> {loc}
                                            </span>
                                       ))
                                   ) : <span className="text-muted small">Any Location</span>}
                               </div>
                           </div>
                           <div className="col-md-6">
                               <p className="small text-secondary fw-bold text-uppercase mb-2">Minimum CTC (LPA)</p>
                               <div className="d-flex align-items-center gap-2">
                                   <span className="fw-bold text-dark">{student.preferences?.minSalary ? `₹ ${student.preferences.minSalary} LPA` : "Not specified"}</span>
                               </div>
                           </div>
                       </div>
                    </div>
                </div>

                {/* Academic Records */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-0 p-4 pb-0">
                        <h5 className="fw-bold d-flex align-items-center mb-0 gap-2">
                            <GraduationCap className="text-success" size={20} /> Academic Records
                        </h5>
                    </div>
                    <div className="card-body p-4 pt-0">
                        <div className="py-3 border-bottom d-flex justify-content-between">
                             <span className="text-secondary small">Registered Institute</span>
                             <span className="fw-medium text-dark">{student.institute || "N/A"}</span>
                        </div>
                        <div className="py-3 border-bottom d-flex justify-content-between">
                             <span className="text-secondary small">Branch / Department</span>
                             <span className="fw-medium text-dark">{student.branch || "N/A"}</span>
                        </div>
                        <div className="py-3 border-bottom d-flex justify-content-between">
                             <span className="text-secondary small">Current Semester</span>
                             <span className="fw-medium text-dark">{student.semester || "N/A"}</span>
                        </div>
                        <div className="py-3 border-bottom d-flex justify-content-between">
                             <span className="text-secondary small">Overall CGPA</span>
                             <span className="fw-bold text-primary">{student.cgpa?.toFixed(2) || "N/A"}</span>
                        </div>
                        <div className="py-3 border-bottom d-flex justify-content-between">
                             <span className="text-secondary small">Enrollment / Roll Number</span>
                             <span className="fw-medium text-dark">{student.studentId || student.enrollment || "N/A"}</span>
                        </div>
                        <div className="py-3 d-flex justify-content-between">
                             <span className="text-secondary small">University Email</span>
                             <span className="fw-medium text-dark">{student.universityEmail || student.email || "N/A"}</span>
                        </div>
                    </div>
                </div>

             </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
         .bg-blue-50 { background-color: #eff6ff; }
         .text-blue-600 { color: #2563eb; }
         .border-blue-100 { border-color: #dbeafe; }
         
         .bg-green-50 { background-color: #f0fdf4; }
         .text-green-600 { color: #16a34a; }
         .border-green-100 { border-color: #dcfce7; }

         .hover-translate { transition: transform 0.2s; }
         .hover-translate:hover { transform: translateX(-4px); }
         
         .hover-scale { transition: transform 0.2s; }
         .hover-scale:hover { transform: scale(1.1); }
      `}</style>
    </div>
  );
};

export default StudentDetails;
