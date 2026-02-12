"use client";

import { NavLink, useNavigate } from "react-router-dom";
import {
  HouseDoor,
  Briefcase,
  PlusCircle,
  People,
  PersonCheck,
  Building,
  BoxArrowRight,
} from "react-bootstrap-icons";

export default function EmployerSidebar({
  onCollapseChange,
  isCollapsed = false,
}) {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      to: "/employer",
      end: true,
      icon: HouseDoor,
    },
    {
      key: "post-job",
      label: "Post Job",
      to: "/employer/jobs/new",
      icon: PlusCircle,
    },

    {
      key: "browse-students",
      label: "Browse Students",
      to: "/employer/students",
      icon: People,
    },

    {
      key: "company-profile",
      label: "Company Profile",
      to: "/employer/profile",
      icon: Building,
    },
  ];

  const toggleSidebar = () => {
    onCollapseChange(!isCollapsed);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("employerToken");
    sessionStorage.removeItem("employer");
    sessionStorage.removeItem("userRole");
    navigate("/employer/login");
  };

  return (
    <aside
      className={`sidebar bg-white border-end position-fixed ${
        isCollapsed ? "collapsed" : ""
      }`}
      style={{
        width: isCollapsed ? "70px" : "260px",
        height: "100vh",
        zIndex: 1000,
        transition: "width 0.3s ease",
      }}
    >
      {/* Sidebar Header */}
      <div
        className="sidebar-header border-bottom d-flex align-items-center justify-content-between p-3"
        onClick={toggleSidebar}
        style={{ cursor: "pointer" }}
        title="Click to toggle sidebar"
      >
        <div
          className={`d-flex align-items-center ${
            isCollapsed ? "justify-content-center w-100" : "w-100"
          }`}
        >
          {!isCollapsed ? (
            <div className="d-flex align-items-center justify-content-start w-100">
              <img
                src="/charusat-logo.png"
                alt="CHARUSAT"
                style={{
                  height: "40px",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ) : (
            <div
              className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "36px", height: "36px" }}
            >
              <span className="fw-bold fs-5">C</span>
            </div>
          )}
        </div>
      </div>

      <ul className="list-unstyled p-2 mt-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.key} className="mb-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `d-flex align-items-center px-3 py-2 rounded-3 text-decoration-none transition-all ${
                    isActive ? "active" : "text-secondary"
                  }`
                }
                style={{ height: "48px" }}
              >
                <IconComponent
                  size={20}
                  className={isCollapsed ? "" : "me-3"}
                />
                {!isCollapsed && (
                  <div className="d-flex align-items-center flex-grow-1 justify-content-between">
                    <span className="fw-medium">{item.label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div className="mt-auto p-2 border-top" style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <button
          onClick={handleLogout}
          className="d-flex align-items-center px-3 py-2 rounded-3 text-decoration-none transition-all text-danger border-0 bg-transparent w-100"
          style={{ height: "48px", cursor: "pointer" }}
        >
          <BoxArrowRight size={20} className={isCollapsed ? "" : "me-3"} />
          {!isCollapsed && <span className="fw-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
