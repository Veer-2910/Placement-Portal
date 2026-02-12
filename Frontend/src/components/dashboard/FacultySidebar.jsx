"use client";

import { NavLink } from "react-router-dom";
import {
  HouseDoor,
  Folder,
  List,
  Bell,
  People,
  Calendar,
  BarChart,
} from "react-bootstrap-icons";

export default function FacultySidebar({
  onCollapseChange,
  isCollapsed = false,
}) {
  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      to: "/faculty",
      end: true,
      icon: HouseDoor,
    },
    {
      key: "resources",
      label: "Resources",
      to: "/faculty/resources",
      icon: Folder,
    },
    {
      key: "students",
      label: "Student Management",
      to: "/faculty/students",
      icon: People,
    },
    {
      key: "drives",
      label: "Placement Drives",
      to: "/faculty/drives",
      icon: Calendar,
    },
    {
      key: "analytics",
      label: "Placement Analytics",
      to: "/faculty/analytics",
      icon: BarChart,
    },
    {
      key: "announcements",
      label: "Announcements",
      to: "/faculty/announcements",
      icon: Bell,
    },
  ];

  const toggleSidebar = () => {
    onCollapseChange(!isCollapsed);
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
    </aside>
  );
}
