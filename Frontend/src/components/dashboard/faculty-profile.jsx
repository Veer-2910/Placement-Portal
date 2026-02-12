import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Building,
  Book,
  Calendar,
  Phone,
  Briefcase,
  ShieldCheck,
  Key,
  MapPin,
  Camera,
  Plus,
  X,
  Globe,
  Linkedin,
  Github,
  Search,
  Award,
  Bookmark,
  Activity,
  ExternalLink,
} from "lucide-react";
import "../../styles/profile.css";

const DetailItem = ({
  icon: Icon,
  label,
  value,
  name,
  editable,
  isEditing,
  formData,
  onChange,
}) => (
  <div className="profile-detail-item">
    <div className="detail-icon-box">
      <Icon size={20} />
    </div>
    <div className="detail-content">
      <span className="detail-label">{label}</span>
      {isEditing && editable ? (
        <input
          type="text"
          className="form-control form-control-sm border-0 bg-light mt-1"
          name={name}
          value={formData[name] || ""}
          onChange={onChange}
          autoFocus={false}
        />
      ) : (
        <div className="detail-value">
          {value || <span className="detail-value-empty">Not Provided</span>}
        </div>
      )}
    </div>
  </div>
);

const TagBlock = ({
  title,
  icon: Icon,
  tags,
  fieldName,
  isEditing,
  onAdd,
  onRemove,
  colorClass,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
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
          <button
            className="btn btn-outline-secondary border-0 bg-light"
            type="button"
            onClick={handleAddClick}
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2">
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <span
              key={index}
              className={`badge bg-light ${colorClass} border px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2`}
            >
              {tag}
              {isEditing && (
                <X
                  size={12}
                  className="cursor-pointer text-danger"
                  onClick={() => onRemove(fieldName, tag)}
                />
              )}
            </span>
          ))
        ) : (
          <span className="text-muted small">
            No {title.toLowerCase()} listed.
          </span>
        )}
      </div>
    </div>
  );
};

export default function FacultyProfile({ user }) {
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateMessage, setUpdateMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const normalizeProfile = (data) => {
    if (!data) return null;
    const p = { ...data };
    p.employeeId = data.employeeId || data.staffId || data.facultyId || "";
    p.email = data.universityEmail || data.email || data.officialEmail || "";
    p.fullName = data.fullName || data.name || data.displayName || "";
    p.institute = data.institute || data.instituteName || "";
    p.department = data.department || data.dept || "";
    p.designation = data.designation || "";
    p.cgpa = data.cgpa || "";
    p.location = data.location || "";
    p.availability = data.availability || "Active";
    p.mobile = data.mobile || "";
    p.personalEmail = data.personalEmail || "";
    p.bio = data.bio || "";
    p.skills = Array.isArray(data.skills) ? data.skills : [];
    p.researchInterests = Array.isArray(data.researchInterests)
      ? data.researchInterests
      : [];
    p.experience = Array.isArray(data.experience) ? data.experience : [];
    p.socialLinks = data.socialLinks || {
      linkedin: "",
      github: "",
      website: "",
    };
    return p;
  };

  const calculateCompleteness = (p) => {
    if (!p) return 0;
    const fields = [
      p.fullName,
      p.personalEmail,
      p.mobile,
      p.bio,
      p.location,
      p.profilePicture,
      p.skills?.length > 0,
      p.researchInterests?.length > 0,
      p.socialLinks?.linkedin,
      p.socialLinks?.github,
    ];
    const filled = fields.filter((f) => !!f).length;
    return Math.round((filled / fields.length) * 100);
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
          `http://localhost:5000/api/faculty/profile/${user._id}`,
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  const addTag = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value],
    }));
  };

  const removeTag = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateMessage("");
    try {
      const token = sessionStorage.getItem("token");
      const submitData = new FormData();

      const fields = [
        "fullName",
        "mobile",
        "department",
        "designation",
        "cgpa",
        "personalEmail",
        "bio",
        "location",
        "availability",
      ];
      fields.forEach((f) => {
        if (formData[f] !== undefined) submitData.append(f, formData[f]);
      });

      submitData.append("skills", JSON.stringify(formData.skills || []));
      submitData.append(
        "researchInterests",
        JSON.stringify(formData.researchInterests || [])
      );
      submitData.append(
        "experience",
        JSON.stringify(formData.experience || [])
      );
      submitData.append(
        "socialLinks",
        JSON.stringify(formData.socialLinks || {})
      );

      if (selectedFile) {
        submitData.append("profilePicture", selectedFile);
      }

      const res = await axios.put(
        "http://localhost:5000/api/faculty/profile",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const norm = normalizeProfile(res.data.faculty);
      setProfile(norm);
      setFormData(norm);
      setIsEditing(false);
      setSelectedFile(null);
      setUpdateMessage("Profile enhanced successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50 p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger m-4 shadow-sm border-0">{error}</div>
    );
  if (!profile)
    return (
      <div className="alert alert-warning m-4 shadow-sm border-0">
        No profile data found.
      </div>
    );

  const completeness = calculateCompleteness(profile);

  return (
    <div className="container-fluid py-4">
      {updateMessage && (
        <div className="alert alert-success border-0 shadow-sm mb-4 d-flex align-items-center">
          <ShieldCheck size={20} className="me-2" /> {updateMessage}
        </div>
      )}
      <div className="row g-4">
        {/* Left Column: Profile Overview Sidebar */}
        <div className="col-lg-4">
          <div className="sticky-sidebar">
            <div className="profile-card p-4">
            <div className="text-center mb-4">
              <div className="d-flex justify-content-center mb-3">
                <div className="position-relative profile-avatar-edit-wrapper">
                  <div
                    className="profile-avatar border-0 shadow-sm overflow-hidden"
                    style={{
                      backgroundColor: "var(--primary-50)",
                      color: "var(--primary-600)",
                    }}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      profile.fullName?.charAt(0) || "F"
                    )}
                  </div>
                  {isEditing && (
                    <label
                      htmlFor="photo-upload"
                      className="profile-photo-badge shadow-sm"
                    >
                      <Camera size={16} />
                      <input
                        type="file"
                        id="photo-upload"
                        hidden
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="badge bg-soft-success text-success rounded-pill px-3 py-1 small mb-2 d-inline-flex align-items-center">
                <Activity size={12} className="me-1" />{" "}
                {profile.availability || "Active"}
              </div>
              <h4 className="fw-bold text-dark mb-1">
                {profile.fullName || "Faculty Member"}
              </h4>
              <p className="text-muted small mb-3">
                {profile.designation || "Faculty Member"}
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                <span className="profile-tag">
                  <MapPin size={12} className="text-danger me-1" />
                  {profile.location || "Location Not Set"}
                </span>
                <span className="profile-tag">
                  <ShieldCheck size={12} className="text-success me-1" />
                  ID: {profile.employeeId || "N/A"}
                </span>
              </div>

              {/* Profile Completeness */}
              <div className="mb-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted small fw-medium">
                    Profile Completeness
                  </span>
                  <span className="text-primary small fw-bold">
                    {completeness}%
                  </span>
                </div>
                <div className="progress" style={{ height: "6px" }}>
                  <div
                    className="progress-bar rounded-pill"
                    role="progressbar"
                    style={{ width: `${completeness}%` }}
                    aria-valuenow={completeness}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>

              <button
                type="button"
                className={`btn w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2 mb-3 ${
                  isEditing ? "btn-outline-danger" : "btn-primary shadow-sm"
                }`}
                onClick={handleEditToggle}
              >
                {isEditing ? (
                  <>Cancel</>
                ) : completeness === 100 ? (
                  <>Edit Profile</>
                ) : (
                  <>Complete Profile</>
                )}
              </button>
            </div>

            <hr className="my-4 opacity-50" />

            <div className="text-start">
              <h6
                className="fw-bold text-uppercase small text-secondary mb-3 d-flex align-items-center"
                style={{ fontSize: "0.7rem" }}
              >
                <Globe size={14} className="me-2" /> Digital Presence
              </h6>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center text-secondary small">
                  <Mail size={16} className="me-3 text-primary" />
                  <span className="text-truncate">{profile.email}</span>
                </div>
                <div className="d-flex align-items-center text-secondary small">
                  <Linkedin size={16} className="me-3 text-primary" />
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control form-control-sm border-0 bg-light py-1"
                      placeholder="LinkedIn URL"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks?.linkedin || ""}
                      onChange={handleChange}
                    />
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
                    <input
                      type="text"
                      className="form-control form-control-sm border-0 bg-light py-1"
                      placeholder="GitHub URL"
                      name="socialLinks.github"
                      value={formData.socialLinks?.github || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    profile.socialLinks?.github ? (
                      <a 
                        href={profile.socialLinks.github.startsWith('http') ? profile.socialLinks.github : `https://${profile.socialLinks.github}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-truncate text-dark text-decoration-none hover-underline fw-medium"
                      >
                        Git/connected <ExternalLink size={10} className="ms-1" />
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
              <div className="profile-card-header bg-transparent border-0">
                <h5 className="profile-card-title d-flex align-items-center">
                  <Book size={18} className="me-2 text-primary" /> Professional Bio
                </h5>
              </div>
              <div className="card-body p-4">
              {isEditing ? (
                <textarea
                  className="form-control border-0 bg-light"
                  rows="3"
                  placeholder="Share a bit about your professional background, teaching philosophy, or research focus..."
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                ></textarea>
              ) : (
                <p className="text-secondary small mb-0 lh-lg">
                  {profile.bio ||
                    "No bio added yet. Tell us about your professional journey and expertise."}
                </p>
              )}
              </div>
            </div>

            {/* Personal Details Card */}
            <div className="profile-card">
              <div className="profile-card-header bg-transparent border-0">
                <h5 className="profile-card-title d-flex align-items-center">
                  <User size={18} className="me-2 text-primary" /> Core
                  Information
                </h5>
              </div>
              <div className="card-body p-0">
                <DetailItem
                  icon={User}
                  label="Full Name"
                  value={profile.fullName}
                  name="fullName"
                  editable={true}
                  isEditing={isEditing}
                  formData={formData}
                  onChange={handleChange}
                />
                <DetailItem
                  icon={MapPin}
                  label="Office Location / City"
                  value={profile.location}
                  name="location"
                  editable={true}
                  isEditing={isEditing}
                  formData={formData}
                  onChange={handleChange}
                />
                <DetailItem
                  icon={Mail}
                  label="Personal Email"
                  value={profile.personalEmail}
                  name="personalEmail"
                  editable={true}
                  isEditing={isEditing}
                  formData={formData}
                  onChange={handleChange}
                />
                <DetailItem
                  icon={Phone}
                  label="Contact Mobile"
                  value={profile.mobile}
                  name="mobile"
                  editable={true}
                  isEditing={isEditing}
                  formData={formData}
                  onChange={handleChange}
                />
                {isEditing && (
                  <div className="profile-detail-item">
                    <div className="detail-icon-box">
                      <Activity size={20} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Current Availability</span>
                      <select
                        className="form-select form-select-sm border-0 bg-light mt-1"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Sabbatical">Sabbatical</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Remote Only">Remote Only</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categorized Blocks */}
            <div className="row g-4">
              <div className="col-md-6">
                <TagBlock
                  title="Expertise & Skills"
                  icon={Key}
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
                  title="Research Interests"
                  icon={Search}
                  tags={
                    isEditing
                      ? formData.researchInterests
                      : profile.researchInterests
                  }
                  fieldName="researchInterests"
                  isEditing={isEditing}
                  onAdd={addTag}
                  onRemove={removeTag}
                  colorClass="text-warning"
                />
              </div>
              <div className="col-12">
                <TagBlock
                  title="Teaching & Professional Experience"
                  icon={Award}
                  tags={isEditing ? formData.experience : profile.experience}
                  fieldName="experience"
                  isEditing={isEditing}
                  onAdd={addTag}
                  onRemove={removeTag}
                  colorClass="text-success"
                />
              </div>
            </div>

            {/* Academic Details Card */}
            <div className="profile-card">
              <div className="profile-card-header bg-transparent border-0">
                <h5 className="profile-card-title d-flex align-items-center">
                  <Building size={18} className="me-2 text-success" />{" "}
                  Institutional Role
                </h5>
              </div>
              <div className="card-body p-0">
                {isEditing ? (
                  <div className="profile-detail-item">
                    <div className="detail-icon-box">
                      <Building size={20} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Institute</span>
                      <select
                        className="form-control form-control-sm border-0 bg-light mt-1"
                        name="institute"
                        value={formData.institute || ""}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Institute</option>
                        <option value="DEPSTAR">DEPSTAR</option>
                        <option value="CSPIT">CSPIT</option>
                        <option value="CMPICA">CMPICA</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="profile-detail-item">
                    <div className="detail-icon-box">
                      <Building size={20} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Institute</span>
                      <div className="detail-value">
                        {profile.institute || (
                          <span className="detail-value-empty">
                            Not Provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {isEditing ? (
                  <div className="profile-detail-item">
                    <div className="detail-icon-box">
                      <Book size={20} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Department</span>
                      <select
                        className="form-control form-control-sm border-0 bg-light mt-1"
                        name="department"
                        value={formData.department || ""}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="CSE">
                          Computer Science Engineering (CSE)
                        </option>
                        <option value="CE">Civil Engineering (CE)</option>
                        <option value="IT">Information Technology (IT)</option>
                        <option value="ME">Mechanical Engineering (ME)</option>
                        <option value="CL">Chemical Engineering (CL)</option>
                        <option value="EC">
                          Electronics & Communication (EC)
                        </option>
                        <option value="EE">Electrical Engineering (EE)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="profile-detail-item">
                    <div className="detail-icon-box">
                      <Book size={20} />
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Department</span>
                      <div className="detail-value">
                        {profile.department || (
                          <span className="detail-value-empty">
                            Not Provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <DetailItem
                  icon={Briefcase}
                  label="Designation"
                  value={profile.designation}
                  name="designation"
                  editable={true}
                  isEditing={isEditing}
                  formData={formData}
                  onChange={handleChange}
                />
                <DetailItem
                  icon={Award}
                  label="Academic CGPA"
                  value={profile.cgpa}
                  name="cgpa"
                  editable={true}
                  isEditing={isEditing}
                  formData={formData}
                  onChange={handleChange}
                />
                <DetailItem
                  icon={ShieldCheck}
                  label="Employee ID"
                  value={profile.employeeId}
                  editable={false}
                  isEditing={isEditing}
                />
                <DetailItem
                  icon={Mail}
                  label="University Email"
                  value={profile.email}
                  editable={false}
                  isEditing={isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="d-flex justify-content-end gap-3 mt-2 pr-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 shadow-sm"
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-5 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                  ) : null}
                  Save Enhanced Profile
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
