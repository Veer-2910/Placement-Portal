import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children, user }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const prevUnreadCount = useRef(0);

  // Fetch unread announcement count periodically
  useEffect(() => {
    if (!user || user.role !== "student") return;

    const fetchUnreadCount = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("/api/announcements/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newCount = response.data.unreadCount;
        setUnreadCount(newCount);

        // Show notification if unread count increased
        if (newCount > prevUnreadCount.current) {
          showNotification(
            "New Announcement",
            `You have ${newCount} new announcement${
              newCount === 1 ? "" : "s"
            } from faculty.`
          );
        }

        prevUnreadCount.current = newCount;
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    // Fetch immediately
    fetchUnreadCount();

    // Set up interval to check every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (announcementId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.get(`/api/announcements/${announcementId}/mark-as-read`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking announcement as read:", err);
    }
  };

  const showNotification = (title, message) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      // Add hiding class to trigger animation
      const element = document.querySelector(
        `[data-notification-id="${newNotification.id}"]`
      );
      if (element) {
        element.classList.add("hiding");
        // Remove after animation completes
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== newNotification.id)
          );
        }, 300);
      } else {
        // Fallback removal
        setNotifications((prev) =>
          prev.filter((n) => n.id !== newNotification.id)
        );
      }
    }, 5000);
  };

  const removeNotification = (id) => {
    // Add hiding class to trigger animation
    const element = document.querySelector(`[data-notification-id="${id}"]`);
    if (element) {
      element.classList.add("hiding");
      // Remove after animation completes
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 300);
    } else {
      // Fallback removal
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const value = {
    unreadCount,
    notifications,
    markAsRead,
    showNotification,
    removeNotification,
    setUnreadCount, // Expose setter for child components
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
