import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import EmployerSidebar from "../../components/dashboard/EmployerSidebar";

function EmployerDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem("employerToken");
    if (!token) {
      navigate("/employer/login");
    }
  }, [navigate]);

  return (
    <div className="min-vh-100">
      {/* Fixed sidebar */}
      <EmployerSidebar
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />

      {/* Main area shifted to the right of the fixed sidebar */}
      <main
        className="main-content p-3"
        style={{
          marginLeft: isCollapsed ? "70px" : "260px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default EmployerDashboard;
