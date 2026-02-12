import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

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
        // Update localStorage
        localStorage.setItem("employer", JSON.stringify(response.data.employer));
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
    <div className="page-container">
      <div className="page-header">
        <h1>Company Profile</h1>
        <button onClick={() => navigate("/employer/dashboard")} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {/* Verification Status */}
      {employer && (
        <div className={`verification-banner ${employer.verificationStatus.toLowerCase()}`}>
          <span className="icon">
            {employer.verificationStatus === "Verified" ? "✓" : 
             employer.verificationStatus === "Pending" ? "⏳" : "✗"}
          </span>
          <div>
            <strong>Verification Status: {employer.verificationStatus}</strong>
            {employer.verificationStatus === "Pending" && (
              <p>Your account is pending admin verification. You'll be notified once approved.</p>
            )}
            {employer.verificationStatus === "Rejected" && employer.rejectionReason && (
              <p>Rejection Reason: {employer.rejectionReason}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Logo Upload */}
        <section className="form-section logo-section">
          <h2>Company Logo</h2>
          <div className="logo-upload">
            {employer?.logo && (
              <img
                src={`http://localhost:5000${employer.logo}`}
                alt="Company Logo"
                className="current-logo"
              />
            )}
            <div className="upload-controls">
              <label htmlFor="logo-upload" className="btn-upload">
                {employer?.logo ? "Change Logo" : "Upload Logo"}
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: "none" }}
              />
              <p className="upload-hint">Recommended: 200x200px, PNG or JPG</p>
            </div>
          </div>
        </section>

        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Industry *</label>
              <select name="industry" value={formData.industry} onChange={handleChange} required>
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Size</label>
              <select name="companySize" value={formData.companySize} onChange={handleChange}>
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="form-group">
              <label>Founded Year</label>
              <input
                type="number"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                placeholder="e.g., 2010"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.company.com"
              />
            </div>

            <div className="form-group">
              <label>Headquarters</label>
              <input
                type="text"
                name="headquarters"
                value={formData.headquarters}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Brief description of your company..."
            />
          </div>
        </section>

        {/* Contact Person */}
        <section className="form-section">
          <h2>Contact Person</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="contactPerson.name"
                value={formData.contactPerson.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="contactPerson.designation"
                value={formData.contactPerson.designation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="contactPerson.phone"
                value={formData.contactPerson.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="contactPerson.email"
                value={formData.contactPerson.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="form-section">
          <h2>Address</h2>
          
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="form-section">
          <h2>Social Media</h2>
          
          <div className="form-group">
            <label>LinkedIn</label>
            <input
              type="url"
              name="socialLinks.linkedin"
              value={formData.socialLinks.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/company/..."
            />
          </div>

          <div className="form-group">
            <label>Twitter</label>
            <input
              type="url"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="form-group">
            <label>Facebook</label>
            <input
              type="url"
              name="socialLinks.facebook"
              value={formData.socialLinks.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/employer/dashboard")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .page-container {
          max-width: 1000px;
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

        .verification-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .verification-banner.verified {
          background: #d1fae5;
          color: #065f46;
        }

        .verification-banner.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .verification-banner.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .verification-banner .icon {
          font-size: 1.5rem;
        }

        .verification-banner strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .verification-banner p {
          margin: 0;
          font-size: 0.9rem;
        }

        .profile-form {
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
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .logo-section {
          text-align: center;
        }

        .logo-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .current-logo {
          width: 150px;
          height: 150px;
          object-fit: contain;
          border: 2px solid #eee;
          border-radius: 8px;
          padding: 1rem;
        }

        .upload-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-upload {
          padding: 0.75rem 2rem;
          background: #0ea5e9;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: transform 0.2s;
        }

        .btn-upload:hover {
          transform: translateY(-2px);
        }

        .upload-hint {
          color: #666;
          font-size: 0.85rem;
          margin: 0;
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

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
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

export default CompanyProfile;
