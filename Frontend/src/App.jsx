import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Skeleton from "./components/ui/Skeleton";
import "./App.css";
import "./styles/dashboard.css";

const LoginPage = lazy(() => import("./pages/auth/Login"));
const RegisterPage = lazy(() => import("./pages/auth/Register"));
const FacultyRegistration = lazy(() => import("./pages/faculty/Registration"));
const DashboardLayout = lazy(() =>
  import("./components/dashboard/DashboardLayout")
);
const FacultyDashboardLayout = lazy(() =>
  import("./components/dashboard/FacultyDashboardLayout")
);
const DashboardContent = lazy(() =>
  import("./components/dashboard/dashboard-content.jsx")
);
const FacultyDashboardContent = lazy(() =>
  import("./components/dashboard/faculty-dashboard-content.jsx")
);
const StudentProfile = lazy(() =>
  import("./components/dashboard/student-profile.jsx")
);
const FacultyProfile = lazy(() =>
  import("./components/dashboard/faculty-profile.jsx")
);
const FacultyResources = lazy(() => import("./pages/faculty/Resources.jsx"));
const StudentResources = lazy(() => import("./pages/student/Resources.jsx"));
const FacultyAnnouncements = lazy(() =>
  import("./pages/faculty/Announcements.jsx")
);
const StudentAnnouncements = lazy(() =>
  import("./pages/student/Announcements.jsx")
);
const FacultyPlacementDrives = lazy(() =>
  import("./pages/faculty/PlacementDrives.jsx")
);
const StudentPlacementDrives = lazy(() =>
  import("./pages/student/PlacementDrives.jsx")
);
const MyApplications = lazy(() => import("./pages/student/MyApplications.jsx"));
const StudentManagement = lazy(() =>
  import("./pages/faculty/StudentManagement.jsx")
);
const JobBoard = lazy(() => import("./pages/student/JobBoard.jsx"));

// Employer Pages
const EmployerRegister = lazy(() => import("./pages/employer/EmployerRegister.jsx"));
const EmployerLogin = lazy(() => import("./pages/employer/EmployerLogin.jsx"));
const EmployerDashboard = lazy(() => import("./pages/employer/EmployerDashboard.jsx"));
const EmployerHome = lazy(() => import("./pages/employer/EmployerHome.jsx"));
const PostJob = lazy(() => import("./pages/employer/PostJob.jsx"));
const ManageJobs = lazy(() => import("./pages/employer/ManageJobs.jsx"));
const BrowseStudents = lazy(() => import("./pages/employer/BrowseStudents.jsx"));
const ViewApplicants = lazy(() => import("./pages/employer/ViewApplicants.jsx"));
const SubmitFeedback = lazy(() => import("./pages/employer/SubmitFeedback.jsx"));
const CompanyProfile = lazy(() => import("./pages/employer/CompanyProfile.jsx"));
const StudentDetails = lazy(() => import("./pages/employer/StudentDetails.jsx"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const EmployerVerification = lazy(() => import("./pages/admin/EmployerVerification.jsx"));
const JobApproval = lazy(() => import("./pages/admin/JobApproval.jsx"));

function App() {
  const [user, setUser] = useState(
    sessionStorage.getItem("userDetails")
      ? JSON.parse(sessionStorage.getItem("userDetails"))
      : null
  );

  useEffect(() => {
    // Check session on mount
    const token = sessionStorage.getItem("token");
    const userDetails = sessionStorage.getItem("userDetails")
      ? JSON.parse(sessionStorage.getItem("userDetails"))
      : null;
    setUser(userDetails || (token ? { token } : null));
  }, []);

  console.log("App render - User:", user);

  return (
    <Suspense
      fallback={
        <div className="vh-100 d-flex flex-column p-4 gap-3 bg-light">
          <Skeleton height="60px" borderRadius="12px" />
          <div className="d-flex gap-3 flex-grow-1">
            <Skeleton width="300px" borderRadius="12px" />
            <Skeleton className="flex-grow-1" borderRadius="12px" />
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/faculty/register" element={<FacultyRegistration />} />
        <Route
          path="/faculty/*"
          element={
            user && user.role === "faculty" ? (
              <FacultyDashboardLayout user={user} setUser={setUser} />
            ) : (
              <Navigate to="/faculty/login" replace />
            )
          }
        >
          <Route index element={<FacultyDashboardContent user={user} />} />
          <Route path="profile" element={<FacultyProfile user={user} />} />
          <Route path="resources" element={<FacultyResources user={user} />} />
          <Route path="students" element={<StudentManagement user={user} />} />
          <Route
            path="announcements"
            element={<FacultyAnnouncements user={user} />}
          />
          <Route
            path="drives"
            element={<FacultyPlacementDrives user={user} />}
          />
        </Route>
        <Route
          path="/faculty/login"
          element={<LoginPage setUser={setUser} />}
        />
        <Route
          path="/student-dashboard/*"
          element={
            user && user.role === "student" ? (
              <DashboardLayout user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<DashboardContent user={user} />} />
          <Route path="profile" element={<StudentProfile user={user} />} />
          <Route path="resources" element={<StudentResources user={user} />} />
          <Route
            path="announcements"
            element={<StudentAnnouncements user={user} />}
          />
          <Route path="applications" element={<MyApplications user={user} />} />
          <Route
            path="drives"
            element={<StudentPlacementDrives user={user} />}
          />
          <Route path="jobs" element={<JobBoard user={user} />} />
        </Route>
        <Route path="/student" element={<LoginPage setUser={setUser} />} />
        
        {/* Employer Routes */}
        <Route path="/employer/register" element={<EmployerRegister />} />
        <Route path="/employer/login" element={<EmployerLogin />} />
        <Route path="/employer/*" element={<EmployerDashboard />}>
          <Route index element={<EmployerHome />} />
          <Route path="jobs/new" element={<PostJob />} />
          <Route path="jobs" element={<ManageJobs />} />
          <Route path="jobs/:jobId/applicants" element={<ViewApplicants />} />
          <Route path="students" element={<BrowseStudents />} />
          <Route path="students/:studentId" element={<StudentDetails />} /> {/* ROUTE ADDED */}
          <Route path="applicants" element={<ViewApplicants />} />
          <Route path="feedback/:applicationId" element={<SubmitFeedback />} />
          <Route path="profile" element={<CompanyProfile />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employers/verify" element={<EmployerVerification />} />
        <Route path="/admin/jobs/approve" element={<JobApproval />} />
      </Routes>
    </Suspense>
  );
}

export default App;
