import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IdCard, Mail, Lock, Shield } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

function FacultyRegistration() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    universityEmail: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Send OTP for email verification
  const handleSendOTP = useCallback(async () => {
    if (!form.employeeId.trim() || !form.universityEmail.trim()) {
      setErrors(["Employee ID and University Email are required to send OTP"]);
      return;
    }
    if (!/\.edu\.in$/i.test(form.universityEmail)) {
      setErrors(["University Email must end with .edu.in"]);
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      await axios.post(`${BACKEND_URL}/api/faculty/send-activation-otp`, {
        email: form.universityEmail,
        employeeId: form.employeeId,
      });
      setOtpSent(true);
    } catch (err) {
      setErrors([err.response?.data?.message || "Failed to send OTP. Please try again."]);
    } finally {
      setLoading(false);
    }
  }, [form.employeeId, form.universityEmail]);

  // Verify OTP
  const handleVerifyOTP = useCallback(async () => {
    if (!otp.trim()) {
      setErrors(["Please enter the OTP"]);
      return;
    }
    setLoading(true);
    setErrors([]);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/faculty/verify-activation-otp`, {
        email: form.universityEmail,
        otp: otp.trim(),
      });
      setOtpVerified(true);
      setVerificationToken(response.data.verificationToken);
    } catch (err) {
      setErrors([err.response?.data?.message || "Invalid OTP. Please try again."]);
    } finally {
      setLoading(false);
    }
  }, [otp, form.universityEmail]);

  const validate = useCallback(() => {
    const newErrors = [];
    if (!form.employeeId.trim())
      newErrors.push("Employee ID is required.");
    if (!form.universityEmail.trim())
      newErrors.push("University Email is required.");

    if (form.universityEmail && !/\.edu\.in$/i.test(form.universityEmail)) {
      newErrors.push("University Email must end with .edu.in");
    }
    if (!form.password) newErrors.push("Password is required.");
    if (!form.confirmPassword) newErrors.push("Confirm Password is required.");
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]).{8,}$/;
    if (form.password && !strongRegex.test(form.password)) {
      newErrors.push(
        "Password must be 8+ chars and include upper, lower, number, special"
      );
    }
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
      newErrors.push("Passwords do not match");
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;
      setLoading(true);
      setErrors([]);
      try {
        await axios.post(`${BACKEND_URL}/api/faculty/activate`, {
          email: form.universityEmail,
          employeeId: form.employeeId,
          password: form.password,
          verificationToken: verificationToken,
        });

        navigate("/", {
          replace: true,
          state: {
            alert: {
              type: "success",
              message:
                "Password set successfully! You can now login with your email and password.",
            },
          },
        });
      } catch (err) {
        setErrors([
          err.response?.data?.message ||
            "Failed to set password. Please contact your institute.",
        ]);
      } finally {
        setLoading(false);
      }
    },
    [form, navigate, validate, verificationToken]
  );

  const handleBackToLogin = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Password strength checker
  const getPasswordStrength = (password) => {
    const checks = [
      { regex: /.{8,}/, message: "At least 8 characters" },
      { regex: /[A-Z]/, message: "Uppercase letter" },
      { regex: /[a-z]/, message: "Lowercase letter" },
      { regex: /\d/, message: "Number" },
      {
        regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/,
        message: "Special character",
      },
    ];

    const passedChecks = checks.filter((check) =>
      check.regex.test(password)
    ).length;

    if (passedChecks === 0) return { strength: 0, label: "", color: "" };
    if (passedChecks <= 2)
      return { strength: passedChecks, label: "Weak", color: "danger" };
    if (passedChecks <= 4)
      return { strength: passedChecks, label: "Medium", color: "warning" };
    return { strength: passedChecks, label: "Strong", color: "success" };
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-4"
      style={{
        background: "linear-gradient(135deg, var(--gray-50) 0%, #e2e8f0 100%)",
      }}
    >
      <div
        className="card shadow-lg border-0 animate-page"
        style={{ maxWidth: "800px", width: "100%", borderRadius: "1rem" }}
      >
        <div className="row g-0">
          {/* Header */}
          <div className="col-12 border-bottom border-light-subtle">
            <div className="p-5 text-center">
              <div className="mb-4">
                <div
                  className="bg-success text-white d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm"
                  style={{ width: 64, height: 64 }}
                >
                  <Shield size={32} />
                </div>
              </div>
              <h2 className="fw-bold text-dark mb-2">Faculty Registration</h2>
              <p className="text-secondary mb-0">Create your secure account</p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="col-12">
            <div className="p-5">
              <form onSubmit={handleSubmit}>
                {errors.length > 0 && (
                  <div
                    className="alert alert-danger shadow-sm border-0"
                    role="alert"
                  >
                    <ul className="mb-0 ps-3">
                      {errors.map((er, i) => (
                        <li key={i}>{er}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label text-dark small fw-bold text-uppercase tracking-wide">
                      Employee ID
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <IdCard size={18} />
                      </span>
                      <input
                        name="employeeId"
                        type="text"
                        className="form-control border-start-0 ps-0 shadow-none"
                        placeholder="e.g., FAC001"
                        value={form.employeeId}
                        onChange={(e) =>
                          handleInputChange("employeeId", e.target.value)
                        }
                        disabled={otpSent}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-dark small fw-bold text-uppercase tracking-wide">
                      University Email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Mail size={18} />
                      </span>
                      <input
                        name="universityEmail"
                        type="email"
                        className="form-control border-start-0 ps-0 shadow-none"
                        placeholder="email@charusat.edu.in"
                        value={form.universityEmail}
                        onChange={(e) =>
                          handleInputChange("universityEmail", e.target.value)
                        }
                        disabled={otpSent}
                      />
                      <button
                        type="button"
                        className="btn btn-success shadow-sm"
                        onClick={handleSendOTP}
                        disabled={loading || otpSent}
                      >
                        {loading ? "Sending..." : otpSent ? "OTP Sent ✓" : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  {/* OTP Input - shown after OTP is sent */}
                  {otpSent && !otpVerified && (
                    <div className="col-12">
                      <label className="form-label text-dark small fw-bold text-uppercase tracking-wide">
                        Enter OTP
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-muted">
                          <Shield size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0 shadow-none"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                        <button
                          type="button"
                          className="btn btn-success shadow-sm"
                          onClick={handleVerifyOTP}
                          disabled={loading}
                        >
                          {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                      <small className="text-muted">Check your email for the OTP code</small>
                    </div>
                  )}

                  {/* Password fields - shown only after OTP is verified */}
                  {otpVerified && (
                    <>
                      <div className="col-md-6">
                    <label className="form-label text-dark small fw-bold text-uppercase tracking-wide">
                      New Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Lock size={18} />
                      </span>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0 ps-0 shadow-none"
                        placeholder="Create password"
                        value={form.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 bg-white text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-3">
                        <div className="progress" style={{ height: "4px" }}>
                          <div
                            className={`progress-bar bg-${passwordStrength.color}`}
                            role="progressbar"
                            style={{
                              width: `${
                                (passwordStrength.strength / 5) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Strength
                          </small>
                          <small
                            className={`text-${passwordStrength.color} fw-bold`}
                            style={{ fontSize: "0.75rem" }}
                          >
                            {passwordStrength.label}
                          </small>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-dark small fw-bold text-uppercase tracking-wide">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Lock size={18} />
                      </span>
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0 ps-0 shadow-none"
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0 bg-white text-muted"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                    </>
                  )}
                </div>

                <div className="d-grid gap-3 d-md-flex justify-content-md-between align-items-center mt-5 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-link text-secondary text-decoration-none px-0"
                    onClick={handleBackToLogin}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Login
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-5 py-2 fw-bold shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></div>
                        Setting Password...
                      </div>
                    ) : (
                      "Set Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyRegistration;
