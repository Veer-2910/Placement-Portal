import { useEffect, useState } from "react";
import axios from "axios";
import { 
    User, Mail, Building, Book, Calendar, 
    School, GraduationCap, Award, Hash, MapPin, Phone,
    Camera, Plus, X, Globe, Linkedin, Github,
    Lightbulb, Rocket, Zap, Activity, ShieldCheck, FileText, Download, ExternalLink, CloudUpload, Briefcase
} from "lucide-react";
import { calculateProfileStrength, getStrengthTips } from "../../utils/profile-utils";
import "../../styles/profile.css";

const DetailItem = ({ icon: Icon, label, value, name, editable, isEditing, formData, onChange }) => (
  <div className="profile-detail-item">
    <div className="detail-icon-box">
      <Icon size={20} />
    </div>
    <div className="detail-content">
      <span className="detail-label">{label}</span>
      {isEditing && editable ? (
        <input 
          type={name === 'cgpa' ? 'number' : 'text'}
          step={name === 'cgpa' ? '0.01' : '1'}
          className="form-control form-control-sm border-0 bg-light mt-1" 
          name={name}
          value={formData[name] || ""}
          onChange={onChange}
          autoFocus={false}
        />
      ) : (
        <div className="detail-value">{value || <span className="detail-value-empty">Not Provided</span>}</div>
      )}
    </div>
  </div>
);

const TagBlock = ({ title, icon: Icon, tags, fieldName, isEditing, onAdd, onRemove, colorClass }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                onAdd(fieldName, inputValue.trim());
                setInputValue("");
            }
        }
    };

    const handleAddClick = () => {
        if (inputValue.trim()) {
            onAdd(fieldName, inputValue.trim());
            setInputValue("");
        }
    };

    return (
        <div className="profile-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="profile-card-title d-flex align-items-center mb-0">
                    <Icon size={18} className={`me-2 ${colorClass}`} /> {title}
                </h5>
            </div>
            
            {isEditing && (
                <div className="input-group input-group-sm mb-3 tag-input-wrapper">
                    <input 
                        type="text" 
                        className="form-control border-0 bg-light" 
                        placeholder={`Add ${title.toLowerCase()}...`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="btn btn-outline-secondary border-0 bg-light" type="button" onClick={handleAddClick}>
                        <Plus size={16} />
                    </button>
                </div>
            )}

            <div className="d-flex flex-wrap gap-2">
                {tags && tags.length > 0 ? (
                    tags.map((tag, index) => (
                        <span key={index} className={`badge bg-light ${colorClass} border px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2`}>
                            {tag}
                            {isEditing && <X size={12} className="cursor-pointer text-danger" onClick={() => onRemove(fieldName, tag)} />}
                        </span>
                    ))
                ) : (
                    <span className="text-muted small">No {title.toLowerCase()} listed.</span>
                )}
            </div>
        </div>
    );
};

export default function StudentProfile({ user }) {
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateMessage, setUpdateMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  // Normalize fields from the stored document into a UI-friendly shape
  const normalizeProfile = (data) => {
    if (!data) return null;
    const p = { ...data };
    p.enrollment = data.studentId || data.enrollmentNo || data.enrollmentNumber || data.enrollment || data.rollNumber || "";
    p.email = data.universityEmail || data.email1 || data.email || "";
    p.fullName = data.fullName || data.name || data.displayName || "";
    p.institute = data.institute || data.instituteName || "";
    p.branch = data.branch || data.department || data.program || "";
    p.semester = data.semester || "";
    p.academicYear = data.academicYear || "";
    p.cgpa = data.cgpa || "";
    p.gender = data.gender || "";
    p.phone = data.phone || "";
    p.location = data.location || "";
    p.status = data.status || "Active";
    p.personalEmail = data.personalEmail || "";
    p.bio = data.bio || "";
    p.resume = data.resume || "";
    p.skills = Array.isArray(data.skills) ? data.skills : [];
    p.interestAreas = Array.isArray(data.interestAreas) ? data.interestAreas : [];
    p.projects = Array.isArray(data.projects) ? data.projects : [];
    p.socialLinks = data.socialLinks || { linkedin: "", github: "", portfolio: "" };
    p.preferences = data.preferences || { jobTypes: [], locations: [], roles: [], minSalary: "" };
    return p;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/auth/student/profile/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const norm = normalizeProfile(res.data);
        setProfile(norm);
        setFormData(norm);
        if (norm.profilePicture) {
            setPreviewImage(`http://localhost:5000${norm.profilePicture}`);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?._id]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setUpdateMessage("");
    if (!isEditing) {
        setFormData(profile);
        setSelectedFile(null);
        setResumeFile(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [child]: value }
        }));
    } else if (name.startsWith('preferences.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            preferences: { ...prev.preferences, [field]: value }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const addTag = (field, value) => {
    if (field.startsWith('preferences.')) {
        const prefField = field.split('.')[1];
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [prefField]: [...(prev.preferences[prefField] || []), value]
            }
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), value]
        }));
    }
  };

  const removeTag = (field, value) => {
    if (field.startsWith('preferences.')) {
        const prefField = field.split('.')[1];
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [prefField]: prev.preferences[prefField].filter(v => v !== value)
            }
        }));
    } else {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(v => v !== value)
        }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateMessage("");
    try {
      const token = sessionStorage.getItem("token");
      const submitData = new FormData();
      
      const fields = [
        'fullName', 'personalEmail', 'phone', 'branch', 
        'semester', 'cgpa', 'yearOfEnrollment', 'expectedYearOfGraduation', 'bio',
        'location', 'status'
      ];
      fields.forEach(f => {
        if (formData[f] !== undefined) submitData.append(f, formData[f]);
      });

      submitData.append('skills', JSON.stringify(formData.skills || []));
      submitData.append('interestAreas', JSON.stringify(formData.interestAreas || []));
      submitData.append('projects', JSON.stringify(formData.projects || []));
      submitData.append('socialLinks', JSON.stringify(formData.socialLinks || {}));
      submitData.append('preferences', JSON.stringify(formData.preferences || {}));

      if (selectedFile) {
        submitData.append('profilePicture', selectedFile);
      }
      
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/auth/student/profile/${user._id}`,
        submitData,
        { 
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            } 
        }
      );
      
      const norm = normalizeProfile(res.data.student);
      setProfile(norm);
      setFormData(norm);
      setIsEditing(false);
      setSelectedFile(null);
      setResumeFile(null);
      setUpdateMessage("Student profile enhanced successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) return (
      <div className="d-flex justify-content-center align-items-center min-vh-50 p-5">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
      </div>
  );
  
  if (error) return <div className="alert alert-danger m-4 shadow-sm border-0">{error}</div>;
  if (!profile) return <div className="alert alert-warning m-4 shadow-sm border-0">No profile data found.</div>;

  const completeness = calculateProfileStrength(profile);

  return (
    <div className="container-fluid py-4">
      {updateMessage && (
        <div className="alert alert-success border-0 shadow-sm mb-4 d-flex align-items-center">
          <Award size={20} className="me-2" /> {updateMessage}
        </div>
      )}
      <div className="row g-4">
        {/* Left Column: Student Overview Sidebar */}
        <div className="col-lg-4">
           <div className="sticky-sidebar">
             <div className="profile-card p-4">
              <div className="text-center mb-4">
                 <div className="d-flex justify-content-center mb-4">
                    <div className="position-relative profile-avatar-edit-wrapper">
                        <div className="profile-avatar border-0 overflow-hidden" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                            ) : (
                                profile.fullName?.charAt(0) || "S"
                            )}
                        </div>
                        {isEditing && (
                            <label htmlFor="student-photo-upload" className="profile-photo-badge shadow-sm">
                                <Camera size={16} />
                                <input type="file" id="student-photo-upload" hidden onChange={handleFileChange} accept="image/*" />
                            </label>
                        )}
                    </div>
                 </div>
                 <div className="badge bg-soft-primary text-primary rounded-pill px-3 py-1 small mb-2 d-inline-flex align-items-center">
                    <Activity size={12} className="me-1" /> {profile.status || "Active"}
                 </div>
                 <h4 className="fw-bold text-dark mb-1">{profile.fullName || "Student Member"}</h4>
                 <p className="text-muted small mb-3">{profile.branch || "Management Student"}</p>
                 
                 <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                    <span className="profile-tag">
                        <MapPin size={12} className="text-danger me-1"/>
                        {profile.location || "Location Not Set"}
                    </span>
                    <span className="profile-tag">
                        <ShieldCheck size={12} className="text-success me-1"/>
                        Roll: {profile.enrollment || "N/A"}
                    </span>
                 </div>

                 {/* Profile Completeness */}
                 <div className="mb-4 text-start px-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-muted small fw-medium">Profile Completeness</span>
                        <span className="text-primary small fw-bold">{completeness}%</span>
                    </div>
                    <div className="progress" style={{ height: '6px' }}>
                        <div 
                            className="progress-bar rounded-pill bg-primary" 
                            role="progressbar" 
                            style={{ width: `${completeness}%` }}
                            aria-valuenow={completeness} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                        ></div>
                    </div>
                 </div>
                  
                  {/* Profile Strength Boost Widget */}
                  {completeness < 100 && (
                     <div className="bg-light rounded-4 p-3 mb-4 border border-light-subtle d-flex align-items-center gap-3 text-start">
                        <div className="flex-shrink-0 bg-white shadow-sm rounded-3 p-2 text-warning d-flex align-items-center justify-content-center">
                            <Lightbulb size={24} />
                        </div>
                        <div>
                            <p className="text-secondary small fw-medium mb-1">Boost Your Profile</p>
                            <p className="text-dark small fw-bold mb-0 lh-sm" style={{fontSize: '0.8rem'}}>{getStrengthTips(completeness)}</p>
                        </div>
                     </div>
                  )}

                 <button 
                    type="button"
                    className={`btn w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 mb-3 ${isEditing ? 'btn-outline-danger' : 'btn-primary shadow-sm'}`}
                    onClick={handleEditToggle}
                 >
                    {isEditing ? <>Cancel</> : completeness === 100 ? <>Edit Profile</> : <>Complete Profile</>}
                 </button>
              </div>
              
              <hr className="my-4 opacity-50" />
              
              <div className="text-start px-2">
                  <h6 className="fw-bold text-uppercase small text-secondary mb-3 d-flex align-items-center" style={{ fontSize: '0.7rem' }}>
                    <Globe size={14} className="me-2" /> Quick Connection
                  </h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center text-secondary small">
                        <Mail size={16} className="me-3 text-primary" />
                        <span className="text-truncate">{profile.email}</span>
                    </div>
                    <div className="d-flex align-items-center text-secondary small">
                        <Linkedin size={16} className="me-3 text-primary" />
                        {isEditing ? (
                            <input type="text" className="form-control form-control-sm border-0 bg-light py-1" placeholder="LinkedIn URL" name="socialLinks.linkedin" value={formData.socialLinks?.linkedin || ""} onChange={handleChange}/>
                        ) : (
                            profile.socialLinks?.linkedin ? (
                                <a 
                                    href={profile.socialLinks.linkedin.startsWith('http') ? profile.socialLinks.linkedin : `https://${profile.socialLinks.linkedin}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-truncate text-primary text-decoration-none hover-underline fw-medium"
                                >
                                    In/connected <ExternalLink size={10} className="ms-1" />
                                </a>
                            ) : (
                                <span className="text-truncate text-muted">Not Linked</span>
                            )
                        )}
                    </div>
                    <div className="d-flex align-items-center text-secondary small">
                        <Github size={16} className="me-3 text-dark" />
                        {isEditing ? (
                             <input type="text" className="form-control form-control-sm border-0 bg-light py-1" placeholder="GitHub URL" name="socialLinks.github" value={formData.socialLinks?.github || ""} onChange={handleChange}/>
                        ) : (
                             profile.socialLinks?.github ? (
                                <a 
                                    href={profile.socialLinks.github.startsWith('http') ? profile.socialLinks.github : `https://${profile.socialLinks.github}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-truncate text-dark text-decoration-none hover-underline fw-medium"
                                >
                                    Git/view <ExternalLink size={10} className="ms-1" />
                                </a>
                            ) : (
                                <span className="text-truncate text-muted">Not Linked</span>
                            )
                        )}
                    </div>
                  </div>
              </div>
           </div>
        </div>
        </div>
        
        {/* Right Column: Detailed Information */}
        <div className="col-lg-8">
           <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                {/* Bio Card */}
                <div className="profile-card">
                   <div className="profile-card-header bg-light border-0">
                      <h5 className="profile-card-title d-flex align-items-center">
                        <User size={18} className="me-2 text-primary" /> About Me
                      </h5>
                   </div>
                   <div className="card-body p-4">
                  {isEditing ? (
                    <textarea 
                        className="form-control border-0 bg-light" 
                        rows="3" 
                        placeholder="Tell people about yourself, your goals, and interests..."
                        name="bio"
                        value={formData.bio || ""}
                        onChange={handleChange}
                    ></textarea>
                  ) : (
                    <p className="text-secondary small mb-0 lh-lg">{profile.bio || "No bio added yet. Share some highlights about your academic journey and professional goals."}</p>
                  )}
               </div>
            </div>

                {/* Resume Card (New) */}
                <div className="profile-card">
                   <div className="profile-card-header bg-light border-0">
                      <h5 className="profile-card-title d-flex align-items-center">
                          <FileText size={18} className="me-2 text-danger" /> Resume & CV
                      </h5>
                   </div>
                   <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="small text-muted">Manage your documents</div>
                        {!isEditing && profile.resume && (
                            <a 
                                href={`http://localhost:5000${profile.resume}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-outline-danger rounded-pill d-flex align-items-center gap-1"
                            >
                                <Download size={14} /> Download
                            </a>
                        )}
                    </div>
                    
                    {isEditing ? (
                    <div className="resume-upload-zone p-4 text-center border rounded-3 bg-light">
                        <CloudUpload size={32} className="text-muted mb-2" />
                        <p className="small text-muted mb-2">Upload your latest resume (PDF or DOCX max 10MB)</p>
                        <input 
                            type="file" 
                            id="resume-upload" 
                            className="form-control form-control-sm" 
                            accept=".pdf,.doc,.docx" 
                            onChange={handleResumeChange}
                        />
                        {resumeFile && <div className="mt-2 small text-success fw-medium">Ready to upload: {resumeFile.name}</div>}
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 border">
                        <div className="bg-white p-2 rounded shadow-sm">
                            <FileText size={24} className="text-danger" />
                        </div>
                        <div>
                            <span className="d-block fw-bold small text-dark">{profile.fullName}_Resume.pdf</span>
                            {profile.resume ? (
                                <span className="text-success small d-flex align-items-center gap-1">
                                    <ShieldCheck size={12} /> Verified & Uploaded
                                </span>
                            ) : (
                                <span className="text-muted small">No resume uploaded yet.</span>
                            )}
                        </div>
                        {profile.resume && (
                            <a 
                                href={`http://localhost:5000${profile.resume}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ms-auto text-primary small fw-medium"
                            >
                                <ExternalLink size={14} className="me-1" /> View
                            </a>
                        )}
                    </div>
                  )}
               </div>
            </div>

               {/* Personal Details Card */}
               <div className="profile-card">
                  <div className="profile-card-header bg-light border-0">
                      <h5 className="profile-card-title d-flex align-items-center">
                        <ShieldCheck size={18} className="me-2 text-primary" /> Personal Information
                      </h5>
                  </div>
                  <div className="card-body p-0">
                      <DetailItem icon={User} label="Full Name" value={profile.fullName} name="fullName" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                      <DetailItem icon={MapPin} label="Current Location / City" value={profile.location} name="location" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                      <DetailItem icon={Mail} label="Personal Email" value={profile.personalEmail} name="personalEmail" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                      <DetailItem icon={Phone} label="Contact Phone" value={profile.phone} name="phone" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                      {isEditing && (
                          <div className="profile-detail-item">
                            <div className="detail-icon-box"><Activity size={20} /></div>
                            <div className="detail-content">
                                <span className="detail-label">Academic Status</span>
                                <select 
                                    className="form-select form-select-sm border-0 bg-light mt-1" 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Graduated">Graduated</option>
                                    <option value="Interning">Interning</option>
                                    <option value="Seeking Opportunities">Seeking Opportunities</option>
                                </select>
                            </div>
                          </div>
                      )}
                      <DetailItem icon={User} label="Gender Identity" value={profile.gender} name="gender" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                  </div>
               </div>

               {/* Categorized Blocks */}
               <div className="row g-4">
                    <div className="col-md-6">
                        <TagBlock 
                            title="Skills" 
                            icon={Zap} 
                            tags={isEditing ? formData.skills : profile.skills} 
                            fieldName="skills"
                            isEditing={isEditing}
                            onAdd={addTag}
                            onRemove={removeTag}
                            colorClass="text-primary"
                        />
                    </div>
                    <div className="col-md-6">
                        <TagBlock 
                            title="Interests" 
                            icon={Lightbulb} 
                            tags={isEditing ? formData.interestAreas : profile.interestAreas} 
                            fieldName="interestAreas"
                            isEditing={isEditing}
                            onAdd={addTag}
                            onRemove={removeTag}
                            colorClass="text-success"
                        />
                    </div>
                    <div className="col-12">
                        <TagBlock 
                            title="Projects & Achievements" 
                            icon={Rocket} 
                            tags={isEditing ? formData.projects : profile.projects} 
                            fieldName="projects"
                            isEditing={isEditing}
                            onAdd={addTag}
                            onRemove={removeTag}
                            colorClass="text-warning"
                        />
                    </div>
               </div>
               

                {/* Job & Match Preferences Card */}
                <div className="profile-card">
                   <div className="profile-card-header bg-light border-0">
                      <h5 className="profile-card-title d-flex align-items-center">
                        <Briefcase size={18} className="me-2 text-primary" /> Job & Match Preferences
                      </h5>
                   </div>
                   <div className="card-body p-4">
                      <p className="small text-secondary mb-4">
                         These preferences help our AI match you with the most relevant job opportunities.
                      </p>
                      
                      <div className="row g-4">
                         {/* Preferred Roles */}
                         <div className="col-12">
                            <label className="form-label small fw-bold text-secondary">Preferred Job Roles</label>
                            {isEditing ? (
                               <div className="input-group input-group-sm mb-2 tag-input-wrapper">
                                   <input 
                                       type="text" 
                                       className="form-control border-0 bg-light" 
                                       placeholder="e.g., Software Engineer, Data Analyst..."
                                       onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                             e.preventDefault();
                                             if (e.target.value.trim()) {
                                                addTag('preferences.roles', e.target.value.trim());
                                                e.target.value = '';
                                             }
                                          }
                                       }}
                                   />
                                   <span className="input-group-text bg-light border-0"><Plus size={16} /></span>
                               </div>
                            ) : null}
                            <div className="d-flex flex-wrap gap-2">
                               {profile.preferences?.roles && profile.preferences.roles.length > 0 ? (
                                  (isEditing ? formData.preferences.roles : profile.preferences.roles).map((role, i) => (
                                     <span key={i} className="badge bg-blue-50 text-blue-600 border border-blue-100 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                                        {role}
                                        {isEditing && <X size={12} className="cursor-pointer text-danger" onClick={() => removeTag('preferences.roles', role)} />}
                                     </span>
                                  ))
                               ) : (
                                  <span className="text-muted small fst-italic">No specific roles selected.</span>
                               )}
                            </div>
                         </div>
                         
                         {/* Preferred Locations */}
                         <div className="col-md-6">
                            <label className="form-label small fw-bold text-secondary">Preferred Locations</label>
                            {isEditing ? (
                               <div className="input-group input-group-sm mb-2 tag-input-wrapper">
                                   <input 
                                       type="text" 
                                       className="form-control border-0 bg-light" 
                                       placeholder="e.g., Bangalore, Remote..."
                                       onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                             e.preventDefault();
                                             if (e.target.value.trim()) {
                                                addTag('preferences.locations', e.target.value.trim());
                                                e.target.value = '';
                                             }
                                          }
                                       }}
                                   />
                               </div>
                            ) : null}
                            <div className="d-flex flex-wrap gap-1">
                               {profile.preferences?.locations && profile.preferences.locations.length > 0 ? (
                                  (isEditing ? formData.preferences.locations : profile.preferences.locations).map((loc, i) => (
                                     <span key={i} className="badge bg-light text-secondary border px-2 py-1 rounded d-flex align-items-center gap-1">
                                        <MapPin size={10} /> {loc}
                                        {isEditing && <X size={10} className="cursor-pointer text-danger ms-1" onClick={() => removeTag('preferences.locations', loc)} />}
                                     </span>
                                  ))
                               ) : (
                                  <span className="text-muted small">Any Location</span>
                               )}
                            </div>
                         </div>

                         {/* Min Salary & Type */}
                         <div className="col-md-6">
                            <div className="mb-3">
                               <label className="form-label small fw-bold text-secondary">Minimum CTC (LPA)</label>
                               {isEditing ? (
                                  <input 
                                     type="number" 
                                     className="form-control form-control-sm border-0 bg-light"
                                     placeholder="e.g. 4.5"
                                     name="preferences.minSalary"
                                     value={formData.preferences?.minSalary || ""}
                                     onChange={handleChange}
                                  />
                               ) : (
                                  <div className="fw-medium text-dark">{profile.preferences?.minSalary ? `₹ ${profile.preferences.minSalary} LPA` : "Not specified"}</div>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

               {/* Academic Records Card */}
               <div className="profile-card">
                  <div className="profile-card-header bg-light border-0">
                      <h5 className="profile-card-title d-flex align-items-center">
                        <GraduationCap size={18} className="me-2 text-success" /> Academic Records
                      </h5>
                  </div>
                  <div className="card-body p-0">
                      <DetailItem icon={Building} label="Registered Institute" value={profile.institute} editable={false} isEditing={isEditing} />
                      <DetailItem icon={School} label="Branch / Department" value={profile.branch} name="branch" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                      <DetailItem icon={Book} label="Current Semester" value={profile.semester} name="semester" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                      <DetailItem icon={Award} label="Overall CGPA" value={profile.cgpa} name="cgpa" editable={true} isEditing={isEditing} formData={formData} onChange={handleChange} />
                      <DetailItem icon={Hash} label="Enrollment / Roll Number" value={profile.enrollment} editable={false} isEditing={isEditing} />
                      <DetailItem icon={Mail} label="University Email" value={profile.email} editable={false} isEditing={isEditing} />
                  </div>
               </div>

               {isEditing && (
                 <div className="d-flex justify-content-end gap-3 mt-2 pr-2">
                    <button type="button" className="btn btn-light rounded-pill px-4 shadow-sm" onClick={handleEditToggle} disabled={loading}>
                      Discard
                    </button>
                    <button type="submit" className="btn btn-primary rounded-pill px-5 shadow-sm" disabled={loading}>
                      {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                      Save Changes
                    </button>
                 </div>
               )}
           </form>
        </div>
      </div>
    </div>
  );
}
