"use client";

import { useState } from "react";
import { Outlet, useLocation, NavLink, Link } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import {
  Person,
  BoxArrowRight,
  Bell,
  List,
  ChevronRight,
} from "react-bootstrap-icons";
import {
  NotificationProvider,
  useNotifications,
} from "../../contexts/NotificationContext";

function ToastNotification({ notification, onRemove }) {
  return (
    <div
      className="toast show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-notification-id={notification.id}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        minWidth: "300px",
        zIndex: 9999,
      }}
    >
      <div className="toast-header">
        <strong className="me-auto">{notification.title}</strong>
        <button
          type="button"
          className="btn-close"
          onClick={() => onRemove(notification.id)}
        ></button>
      </div>
      <div className="toast-body">{notification.message}</div>
    </div>
  );
}

function DashboardContent({ user, setUser }) {
  const { notifications, removeNotification, unreadCount } = useNotifications();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userDetails");
    window.location.href = "/";
  };

  if (!user) {
    return <p className="p-4 text-center">Loading user...</p>;
  }

  return (
    <>
      <div className="dashboard-layout d-flex min-vh-100">
        <StudentSidebar
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
        />

        {/* Top Header Bar */}
        <div
          className="top-header border-bottom position-fixed d-flex align-items-center justify-content-end"
          style={{
            left: 0,
            paddingLeft: isSidebarCollapsed ? "105px" : "325px",
            paddingRight: "24px",
            height: "64px",
            zIndex: 999,
            transition: "padding-left 0.3s ease",
            width: "100%",
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255, 255, 255, 0.5)",
          }}
        >
          {/* Page Title */}
          <div className="me-auto d-flex align-items-center">
            <span className="text-dark fw-bold fs-5 text-capitalize">
              {location.pathname
                .split("/")
                .pop()
                .replace(/-/g, " ")
                .replace("student dashboard", "Dashboard") || "Dashboard"}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <NavLink
              to="/student-dashboard/announcements"
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center position-relative"
              style={{
                width: "40px",
                height: "40px",
                color: "#64748b",
                padding: 0,
              }}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                  style={{ fontSize: "10px", padding: "0.25em 0.4em" }}
                >
                  {unreadCount}
                  <span className="visually-hidden">unread messages</span>
                </span>
              )}
            </NavLink>

            {/* Profile Icon */}
            <NavLink
              to="/student-dashboard/profile"
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "40px",
                height: "40px",
                color: "#1f2937",
                padding: 0,
              }}
              title="Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-person-fill"
                viewBox="0 0 16 16"
              >
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              </svg>
            </NavLink>

            {/* Logout Button */}
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2 px-3"
              onClick={handleLogout}
              title="Logout"
            >
              <BoxArrowRight size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main
          className="flex-fill ps-2 pe-4"
          style={{
            marginLeft: isSidebarCollapsed ? "100px" : "320px",
            marginTop: "64px",
            paddingTop: "24px",
            paddingBottom: "24px",
            width: isSidebarCollapsed
              ? "calc(100% - 100px)"
              : "calc(100% - 320px)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "auto",
          }}
        >
          <div key={location.pathname} className="animate-page">
            <Outlet />
          </div>
        </main>
      </div>
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        {notifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </>
  );
}

export default function DashboardLayout({ user, setUser }) {
  return (
    <NotificationProvider user={user}>
      <DashboardContent user={user} setUser={setUser} />
    </NotificationProvider>
  );
}
