import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Building2, FileText, User, Lock, Check, ChevronRight, ChevronLeft } from "lucide-react";

const EmployerRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: "",
    companyEmail: "",
    industry: "",
    companySize: "",
    website: "",
    
    // Step 2: Company Details
    description: "",
    address: "",
    city: "",
    state: "",
    
    // Step 3: Contact Person
    contactPersonName: "",
    contactPersonDesignation: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    
    // Step 4: Account Security
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, title: "Company Info", icon: Building2 },
    { number: 2, title: "Company Details", icon: FileText },
    { number: 3, title: "Contact Person", icon: User },
    { number: 4, title: "Security", icon: Lock }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!formData.companyEmail.trim()) newErrors.companyEmail = "Company email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) 
        newErrors.companyEmail = "Invalid email format";
      else if (/@(gmail|yahoo|outlook|hotmail)\./i.test(formData.companyEmail))
        newErrors.companyEmail = "Please use official company email";
      if (!formData.industry) newErrors.industry = "Industry is required";
      if (!formData.companySize) newErrors.companySize = "Company size is required";
    }

    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = "Company description is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
    }

    if (step === 3) {
      if (!formData.contactPersonName.trim()) newErrors.contactPersonName = "Contact person name is required";
      if (!formData.contactPersonDesignation.trim()) newErrors.contactPersonDesignation = "Designation is required";
      if (!formData.contactPersonPhone.trim()) newErrors.contactPersonPhone = "Phone number is required";
      else if (!/^\d{10}$/.test(formData.contactPersonPhone.replace(/\D/g, '')))
        newErrors.contactPersonPhone = "Invalid phone number";
      if (!formData.contactPersonEmail.trim()) newErrors.contactPersonEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactPersonEmail))
        newErrors.contactPersonEmail = "Invalid email format";
    }

    if (step === 4) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
        newErrors.password = "Password must include uppercase, lowercase, and number";
      
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
      else if (formData.password !== formData.confirmPassword) 
        newErrors.confirmPassword = "Passwords do not match";
      
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;
    
    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        password: formData.password,
        industry: formData.industry,
        companySize: formData.companySize,
        website: formData.website,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        contactPerson: {
          name: formData.contactPersonName,
          designation: formData.contactPersonDesignation,
          phone: formData.contactPersonPhone,
          email: formData.contactPersonEmail
        }
      };

      const response = await axios.post(
        "http://localhost:5000/api/employer/register",
        payload
      );

      if (response.data.success) {
        navigate("/employer/login", {
          state: {
            message: "Registration successful! Please wait for admin approval to login."
          }
        });
      }
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || "Registration failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="step-title">Company Information</h3>
            <p className="step-subtitle">Tell us about your company</p>

            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g., Tech Solutions Inc."
                  className={errors.companyName ? "error" : ""}
                />
                {errors.companyName && <span className="error-text">{errors.companyName}</span>}
              </div>

              <div className="form-group">
                <label>Company Email *</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="hr@company.com"
                  className={errors.companyEmail ? "error" : ""}
                />
                {errors.companyEmail && <span className="error-text">{errors.companyEmail}</span>}
                <small>Please use official company email (not Gmail, Yahoo, etc.)</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Industry *</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={errors.industry ? "error" : ""}
                >
                  <option value="">Select Industry</option>
                  <option value="IT/Software">IT/Software</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
                {errors.industry && <span className="error-text">{errors.industry}</span>}
              </div>

              <div className="form-group">
                <label>Company Size *</label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className={errors.companySize ? "error" : ""}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
                {errors.companySize && <span className="error-text">{errors.companySize}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Company Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.company.com"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3 className="step-title">Company Details</h3>
            <p className="step-subtitle">Provide more information about your company</p>

            <div className="form-group">
              <label>Company Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Brief description of your company, what you do, your mission, etc."
                className={errors.description ? "error" : ""}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
                className={errors.address ? "error" : ""}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={errors.city ? "error" : ""}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={errors.state ? "error" : ""}
                />
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3 className="step-title">Contact Person</h3>
            <p className="step-subtitle">Primary contact for recruitment activities</p>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder="Contact person name"
                  className={errors.contactPersonName ? "error" : ""}
                />
                {errors.contactPersonName && <span className="error-text">{errors.contactPersonName}</span>}
              </div>

              <div className="form-group">
                <label>Designation *</label>
                <input
                  type="text"
                  name="contactPersonDesignation"
                  value={formData.contactPersonDesignation}
                  onChange={handleChange}
                  placeholder="HR Manager, Recruiter, etc."
                  className={errors.contactPersonDesignation ? "error" : ""}
                />
                {errors.contactPersonDesignation && <span className="error-text">{errors.contactPersonDesignation}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  className={errors.contactPersonPhone ? "error" : ""}
                />
                {errors.contactPersonPhone && <span className="error-text">{errors.contactPersonPhone}</span>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="contactPersonEmail"
                  value={formData.contactPersonEmail}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className={errors.contactPersonEmail ? "error" : ""}
                />
                {errors.contactPersonEmail && <span className="error-text">{errors.contactPersonEmail}</span>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3 className="step-title">Account Security</h3>
            <p className="step-subtitle">Create a secure password for your account</p>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className={errors.password ? "error" : ""}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
                <small>Must include uppercase, lowercase, and number</small>
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <span>I agree to the Terms and Conditions and Privacy Policy</span>
              </label>
              {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}
            </div>

            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        {/* Header */}
        <div className="registration-header">
          <div className="logo-section">
            <div className="logo-icon">
              <Building2 size={32} />
            </div>
            <h1>Employer Registration</h1>
            <p>Join our placement portal to recruit talented students</p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="stepper">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            
            return (
              <div key={step.number} className="stepper-item">
                <div className={`stepper-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-number">
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`stepper-line ${isCompleted ? 'completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="btn-secondary"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="registration-footer">
          <p>
            Already have an account?{" "}
            <Link to="/employer/login">Login here</Link>
          </p>
        </div>
      </div>

      <style>{`
        .registration-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        }

        .registration-card {
          background: white;
          border-radius: 16px;
          padding: 0;
          max-width: 800px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .registration-header {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: white;
          padding: 2rem 2rem;
          text-align: center;
        }

        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .registration-header h1 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .registration-header p {
          margin: 0;
          opacity: 0.95;
          font-size: 0.95rem;
        }

        .stepper {
          display: flex;
          padding: 1.5rem 2rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          justify-content: center;
        }

        .stepper-item {
          display: flex;
          align-items: center;
        }

        .stepper-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s;
          flex-shrink: 0;
        }

        .stepper-step.current .step-number {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
        }

        .stepper-step.completed .step-number {
          background: #10b981;
          color: white;
        }

        .step-label {
          display: flex;
          flex-direction: column;
        }

        .step-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.85rem;
        }

        .step-num {
          font-size: 0.7rem;
          color: #64748b;
        }

        .stepper-line {
          width: 60px;
          height: 2px;
          background: #e2e8f0;
          margin: 0 0.75rem;
          transition: background 0.3s;
        }

        .stepper-line.completed {
          background: #10b981;
        }

        .step-content {
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }

        .step-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
        }

        .step-subtitle {
          color: #64748b;
          margin: 0 0 1.5rem 0;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
          border-color: #ef4444;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #64748b;
          font-size: 0.8rem;
        }

        .error-text {
          display: block;
          margin-top: 0.25rem;
          color: #ef4444;
          font-size: 0.8rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          align-items: start;
        }

        .checkbox-group {
          margin-top: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .navigation-buttons {
          display: flex;
          justify-content: space-between;
          padding: 0 2rem 1.5rem 2rem;
          gap: 1rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.875rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .registration-footer {
          text-align: center;
          padding: 1.5rem 2rem 2rem 2rem;
          border-top: 1px solid #e2e8f0;
        }

        .registration-footer p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .registration-footer a {
          color: #0ea5e9;
          text-decoration: none;
          font-weight: 600;
        }

        .registration-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .registration-container {
            padding: 1rem;
          }

          .stepper {
            flex-direction: column;
            gap: 1rem;
          }

          .stepper-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .stepper-line {
            display: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .navigation-buttons {
            flex-direction: column-reverse;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployerRegister;
