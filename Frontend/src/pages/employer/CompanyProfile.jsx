import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Building2, Mail, Phone, MapPin, Globe, Calendar, Users } from "lucide-react";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employer, setEmployer] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    foundedYear: "",
    headquarters: "",
    contactPerson: {
      name: "",
      designation: "",
      phone: "",
      email: ""
    },
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: ""
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("employerToken");
      if (!token) {
        navigate("/employer/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/employer/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const emp = response.data.employer;
        setEmployer(emp);
        setFormData({
          companyName: emp.companyName || "",
          industry: emp.industry || "",
          companySize: emp.companySize || "",
          website: emp.website || "",
          description: emp.description || "",
          foundedYear: emp.foundedYear || "",
          headquarters: emp.headquarters || "",
          contactPerson: emp.contactPerson || {
            name: "",
            designation: "",
            phone: "",
            email: ""
          },
          address: emp.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
          },
          socialLinks: emp.socialLinks || {
            linkedin: "",
            twitter: "",
            facebook: ""
          }
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem("employerToken");

      const response = await axios.put(
        "http://localhost:5000/api/employer/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Profile updated successfully!");
        sessionStorage.setItem("employer", JSON.stringify(response.data.employer));
        fetchProfile();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const token = sessionStorage.getItem("employerToken");
      const response = await axios.post(
        "http://localhost:5000/api/employer/upload-logo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success) {
        alert("Logo uploaded successfully!");
        fetchProfile();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to upload logo");
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Company Profile</h2>
        <p className="text-secondary mb-0">Manage your company information and settings</p>
      </div>

      {/* Verification Status */}
      {employer && (
        <div className={`alert ${employer.verificationStatus === 'Verified' ? 'alert-success' : employer.verificationStatus === 'Pending' ? 'alert-warning' : 'alert-danger'} d-flex align-items-center mb-4`}>
          <div className="flex-grow-1">
            <strong>Verification Status: {employer.verificationStatus}</strong>
            {employer.verificationStatus === "Pending" && (
              <p className="mb-0 mt-1 small">Your account is pending admin verification. You'll be notified once approved.</p>
            )}
            {employer.verificationStatus === "Rejected" && employer.rejectionReason && (
              <p className="mb-0 mt-1 small">Rejection Reason: {employer.rejectionReason}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Logo & Basic Info */}
          <div className="col-lg-4">
            {/* Logo Upload */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4 text-center">
                <h5 className="fw-bold mb-4">Company Logo</h5>
                {employer?.logo ? (
                  <img
                    src={`http://localhost:5000${employer.logo}`}
                    alt="Company Logo"
                    className="mb-3"
                    style={{ width: "150px", height: "150px", objectFit: "contain", border: "2px solid #e9ecef", borderRadius: "12px", padding: "1rem" }}
                  />
                ) : (
                  <div className="mb-3 d-flex align-items-center justify-content-center" style={{ width: "150px", height: "150px", margin: "0 auto", border: "2px dashed #dee2e6", borderRadius: "12px" }}>
                    <Building2 size={48} className="text-secondary" />
                  </div>
                )}
                <label htmlFor="logo-upload" className="btn btn-primary w-100">
                  {employer?.logo ? "Change Logo" : "Upload Logo"}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: "none" }}
                />
                <p className="text-secondary small mt-2 mb-0">Recommended: 200x200px, PNG or JPG</p>
              </div>
            </div>

            {/* Account Info - Read Only */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Account Information</h5>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">Company Email (Read-only)</label>
                  <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                    <Mail size={16} className="text-secondary" />
                    <span className="small">{employer?.companyEmail || "Loading..."}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">Member Since</label>
                  <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                    <Calendar size={16} className="text-secondary" />
                    <span className="small">{employer ? new Date(employer.createdAt).toLocaleDateString() : "Loading..."}</span>
                  </div>
                </div>
                <div>
                  <label className="form-label small text-secondary fw-semibold">Last Login</label>
                  <div className="d-flex align-items-center gap-2 p-2 bg-light rounded">
                    <Calendar size={16} className="text-secondary" />
                    <span className="small">{employer?.lastLogin ? new Date(employer.lastLogin).toLocaleDateString() : "Never"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Information */}
          <div className="col-lg-8">
            {/* Basic Information */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Basic Information</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      className="form-control"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Industry *</label>
                    <select name="industry" className="form-select" value={formData.industry} onChange={handleChange} required>
                      <option value="">Select Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Company Size</label>
                    <select name="companySize" className="form-select" value={formData.companySize} onChange={handleChange}>
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Founded Year</label>
                    <input
                      type="number"
                      name="foundedYear"
                      className="form-control"
                      value={formData.foundedYear}
                      onChange={handleChange}
                      placeholder="e.g., 2010"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Website</label>
                    <input
                      type="url"
                      name="website"
                      className="form-control"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.company.com"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Headquarters</label>
                    <input
                      type="text"
                      name="headquarters"
                      className="form-control"
                      value={formData.headquarters}
                      onChange={handleChange}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Company Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Brief description of your company..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Contact Person</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Name</label>
                    <input
                      type="text"
                      name="contactPerson.name"
                      className="form-control"
                      value={formData.contactPerson.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Designation</label>
                    <input
                      type="text"
                      name="contactPerson.designation"
                      className="form-control"
                      value={formData.contactPerson.designation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      type="tel"
                      name="contactPerson.phone"
                      className="form-control"
                      value={formData.contactPerson.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      name="contactPerson.email"
                      className="form-control"
                      value={formData.contactPerson.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Address</h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      className="form-control"
                      value={formData.address.street}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">City</label>
                    <input
                      type="text"
                      name="address.city"
                      className="form-control"
                      value={formData.address.city}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">State</label>
                    <input
                      type="text"
                      name="address.state"
                      className="form-control"
                      value={formData.address.state}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">ZIP Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      className="form-control"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      className="form-control"
                      value={formData.address.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Social Media</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">LinkedIn</label>
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      className="form-control"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Twitter</label>
                    <input
                      type="url"
                      name="socialLinks.twitter"
                      className="form-control"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Facebook</label>
                    <input
                      type="url"
                      name="socialLinks.facebook"
                      className="form-control"
                      value={formData.socialLinks.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="d-flex gap-3 justify-content-end">
              <button type="button" onClick={() => navigate("/employer")} className="btn btn-outline-secondary px-4">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
