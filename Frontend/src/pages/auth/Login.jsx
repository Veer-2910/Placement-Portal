"use client";

import { useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AtSign,
  Lock,
  UserCheck,
  Users,
  Building2,
  GraduationCap,
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [alert, setAlert] = useState(location.state?.alert || null);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setLoginLoading(true);
      setAlert(null);
      try {
        const url =
          loginForm.role === "faculty"
            ? `${BACKEND_URL}/api/faculty/login`
            : `${BACKEND_URL}/api/auth/login`;

        const res = await axios.post(url, loginForm, { withCredentials: true });

        let { token, faculty, student } = res.data;
        let user = faculty || student;
        if (!token || !user) {
          throw new Error("Invalid login response: missing token or user");
        }

        const role = loginForm.role;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userDetails", JSON.stringify({ ...user, role }));

        setUser({ ...user, token, role });

        const redirectPath =
          role === "faculty" ? "/faculty" : "/student-dashboard";
        navigate(redirectPath, { replace: true });
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Invalid credentials or server error.";
        setAlert({ type: "danger", message });
      } finally {
        setLoginLoading(false);
      }
    },
    [loginForm, navigate, setUser]
  );

  const handleInputChange = useCallback((field, value) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePasswordToggle = useCallback(() => {
    setShowPassword((s) => !s);
  }, []);

  const goToRegister = useCallback(() => {
    // First-time access: go to set-password flow based on role
    navigate(loginForm.role === "faculty" ? "/faculty/register" : "/register");
  }, [navigate, loginForm.role]);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-4"
      style={{
        background: "linear-gradient(135deg, var(--gray-50) 0%, #e2e8f0 100%)",
      }}
    >
      <div
        className="card shadow-lg border-0 animate-page"
        style={{ maxWidth: "480px", width: "100%", borderRadius: "1rem" }}
      >
        <div className="card-body p-0">
          <div className="p-5 text-center border-bottom border-light-subtle">
            <div className="mb-4">
              <div
                className="bg-primary text-white d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm"
                style={{ width: 64, height: 64 }}
              >
                <UserCheck size={32} />
              </div>
            </div>
            <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
            <p className="text-secondary mb-0">Sign in to your account</p>
          </div>

          <div className="p-5">
            {/* Role Selection */}
            <div className="mb-4">
              <div className="d-flex bg-light rounded-pill p-1 border">
                <button
                  type="button"
                  className={`flex-fill btn rounded-pill py-2 fw-medium transition-all ${
                    loginForm.role === "student"
                      ? "btn-white shadow-sm text-primary"
                      : "text-muted hover-text-dark"
                  }`}
                  style={
                    loginForm.role === "student"
                      ? { backgroundColor: "#fff" }
                      : {}
                  }
                  onClick={() => handleInputChange("role", "student")}
                >
                  <Users size={16} className="me-2" />
                  Student
                </button>
                <button
                  type="button"
                  className={`flex-fill btn rounded-pill py-2 fw-medium transition-all ${
                    loginForm.role === "faculty"
                      ? "btn-white shadow-sm text-primary"
                      : "text-muted hover-text-dark"
                  }`}
                  style={
                    loginForm.role === "faculty"
                      ? { backgroundColor: "#fff" }
                      : {}
                  }
                  onClick={() => handleInputChange("role", "faculty")}
                >
                  <UserCheck size={16} className="me-2" />
                  Faculty
                </button>
              </div>
            </div>

            {alert && (
              <div
                className={`alert alert-${alert.type} d-flex align-items-center gap-2`}
                role="alert"
              >
                {alert.type === "danger" && (
                  <span className="fw-bold">Error:</span>
                )}
                {alert.message}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label text-dark small fw-bold text-uppercase tracking-wide">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <AtSign size={18} />
                  </span>
                  <input
                    name="email"
                    type="email"
                    className="form-control border-start-0 ps-0 shadow-none"
                    placeholder={
                      loginForm.role === "faculty"
                        ? "faculty@charusat.edu.in"
                        : "23dcs010@charusat.edu.in"
                    }
                    value={loginForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-dark small fw-bold text-uppercase tracking-wide">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <Lock size={18} />
                  </span>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 ps-0 shadow-none"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0 bg-white text-muted"
                    onClick={handlePasswordToggle}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                  />
                  <label
                    className="form-check-label text-secondary small"
                    htmlFor="rememberMe"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-primary text-decoration-none small fw-medium"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <p className="text-secondary small mb-0">
                First time here?{" "}
                <button
                  className="btn btn-link p-0 text-primary text-decoration-none fw-bold"
                  onClick={goToRegister}
                >
                  Set your password
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
