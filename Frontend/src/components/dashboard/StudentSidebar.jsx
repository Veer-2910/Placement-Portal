"use client";

import { NavLink } from "react-router-dom";
import { HouseDoor, Folder, List, Bell, Calendar } from "react-bootstrap-icons";
import { useNotifications } from "../../contexts/NotificationContext";

export default function StudentSidebar({
  onCollapseChange,
  isCollapsed = false,
}) {
  const { unreadCount } = useNotifications();
  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      to: "/student-dashboard",
      end: true,
      icon: HouseDoor,
    },
    {
      key: "drives",
      label: "Placement Drives",
      to: "/student-dashboard/drives",
      icon: Calendar,
    },
    {
      key: "applications",
      label: "My Applications",
      to: "/student-dashboard/applications",
      icon: Folder,
    },
    {
      key: "resources",
      label: "Resources",
      to: "/student-dashboard/resources",
      icon: Folder,
    },
    {
      key: "announcements",
      label: "Announcements",
      to: "/student-dashboard/announcements",
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
                    {item.key === "announcements" && unreadCount > 0 && (
                      <span className="badge bg-danger rounded-pill">
                        {unreadCount}
                      </span>
                    )}
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
