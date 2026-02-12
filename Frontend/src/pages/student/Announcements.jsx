import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNotifications } from "../../contexts/NotificationContext";
import { Modal, Button } from "react-bootstrap";

export default function StudentAnnouncements({ user }) {
  const { showNotification, unreadCount, setUnreadCount } = useNotifications();
  const [announcements, setAnnouncements] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    institute: "",
    category: "",
    search: "",
  });
  const [availableFilters, setAvailableFilters] = useState({
    departments: [],
    institutes: [],
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const prevUnreadCount = useRef(unreadCount);

  // Fetch all announcements and available filters
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        const response = await axios.get("/api/announcements", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAllAnnouncements(response.data);
        setAnnouncements(response.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    const fetchFilters = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await axios.get("/api/announcements/filters", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAvailableFilters(response.data);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    // Removed duplicate function - unreadCount is now managed by NotificationContext

    if (user) {
      fetchAnnouncements();
      fetchFilters();
    }
  }, [user]);

  // Fetch announcements with filters
  useEffect(() => {
    const fetchFilteredAnnouncements = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.department)
          queryParams.append("department", filters.department);
        if (filters.institute)
          queryParams.append("institute", filters.institute);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.search) queryParams.append("search", filters.search);

        const queryString = queryParams.toString();
        const response = await axios.get(
          `/api/announcements${queryString ? `?${queryString}` : ""}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAnnouncements(response.data);
      } catch (err) {
        console.error("Error fetching filtered announcements:", err);
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredAnnouncements();
  }, [filters, user]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      institute: "",
      category: "",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show notification when unread count increases
  useEffect(() => {
    if (
      prevUnreadCount.current !== undefined &&
      unreadCount > prevUnreadCount.current
    ) {
      showNotification(
        "New Announcement",
        "You have a new announcement from faculty."
      );
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, showNotification]);

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

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
    if (!announcement.readBy?.includes(user._id)) {
      markAsRead(announcement._id);
    }
  };

  return (
    <div className="dash-container">
      <div className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
           style={{ 
             background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)", 
             backdropFilter: "blur(20px)",
             boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)"
           }}>
        <div>
          <p className="dash-eyebrow text-primary fw-bold mb-2">ANNOUNCEMENTS</p>
          <h2 className="dash-title display-6 fw-bold text-dark mb-2">Important Updates</h2>
          <p className="dash-subtitle text-secondary fs-5 mb-0">
            Stay informed with the latest announcements from faculty
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="mt-3">
            <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm border border-light">
              {unreadCount} unread{" "}
              {unreadCount === 1 ? "announcement" : "announcements"}
            </span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter Controls */}
      <div className="dash-card mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Filter by Department</label>
            <select
              className="form-control"
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
            >
              <option value="">All Departments</option>
              {availableFilters.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Filter by Institute</label>
            <select
              className="form-control"
              value={filters.institute}
              onChange={(e) => handleFilterChange("institute", e.target.value)}
            >
              <option value="">All Institutes</option>
              {availableFilters.institutes.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Filter by Category</label>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="Urgent">Urgent</option>
              <option value="Deadline">Deadline</option>
              <option value="Event">Event</option>
              <option value="Notice">Notice</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Search Announcements</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, description, or category..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              {filters.search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => handleFilterChange("search", "")}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="col-md-1 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={clearFilters}
              title="Clear filters"
            >
              Clear
            </button>
          </div>
        </div>

        {Object.values(filters).some((filter) => filter) && (
          <div className="mt-3">
            <small className="text-muted">
              Showing {announcements.length} announcement
              {announcements.length !== 1 ? "s" : ""}
              {filters.department && <span> in {filters.department}</span>}
              {filters.institute && <span> at {filters.institute}</span>}
              {filters.category && <span> in {filters.category}</span>}
              {filters.search && <span> matching "{filters.search}"</span>}
            </small>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="dash-card text-center py-5">
          <h5>No announcements available</h5>
          <p className="text-muted">
            Check back later for updates from faculty.
          </p>
        </div>
      ) : (
        <div className="row">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="col-12 mb-4">
              <div className="dash-card">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1">{announcement.title}</h5>
                    <p className="text-muted mb-2">
                      {announcement.description.length > 150
                        ? announcement.description.substring(0, 150) + "..."
                        : announcement.description}
                    </p>
                    <div className="small text-muted">
                      <strong>Posted by:</strong> {announcement.uploadedByName}
                      {}• {announcement.department}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`badge ${
                          (announcement.category || "General") === "Urgent"
                            ? "bg-danger"
                            : (announcement.category || "General") ===
                              "Deadline"
                            ? "bg-warning text-dark"
                            : (announcement.category || "General") === "Event"
                            ? "bg-info"
                            : (announcement.category || "General") === "Notice"
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      >
                        {announcement.category || "General"}
                      </span>
                    </div>
                    {announcement.filePath && (
                      <div className="mt-2">
                        <span className="badge bg-info">Document Attached</span>
                      </div>
                    )}
                  </div>
                  {!announcement.readBy?.includes(user._id) && (
                    <span className="badge bg-danger">NEW</span>
                  )}
                </div>
                <div className="mt-2 small text-muted">
                  Posted on: {formatDate(announcement.createdAt)}
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleView(announcement)}
                  >
                    View Announcement
                  </button>
                  {announcement.filePath && (
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => {
                        // Automatically mark as read when downloading document
                        if (!announcement.readBy?.includes(user._id)) {
                          markAsRead(announcement._id);
                        }
                        // Create a download link for the file
                        const link = document.createElement("a");
                        link.href = `http://localhost:5000/${announcement.filePath}`;
                        link.download =
                          announcement.fileName || "announcement-document";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download Document
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Announcement Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedAnnouncement?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <span
                className={`badge ${
                  (selectedAnnouncement?.category || "General") === "Urgent"
                    ? "bg-danger"
                    : (selectedAnnouncement?.category || "General") === "Deadline"
                    ? "bg-warning text-dark"
                    : (selectedAnnouncement?.category || "General") === "Event"
                    ? "bg-info"
                    : (selectedAnnouncement?.category || "General") === "Notice"
                    ? "bg-primary"
                    : "bg-secondary"
                }`}
              >
                {selectedAnnouncement?.category || "General"}
              </span>
              <span className="ms-2 text-muted small">
                Posted by: {selectedAnnouncement?.uploadedByName} • {selectedAnnouncement?.department}
              </span>
            </div>
            <span className="text-muted small">
              {selectedAnnouncement && formatDate(selectedAnnouncement.createdAt)}
            </span>
          </div>
          <div className="announcement-content py-3">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Announcement Details:</h6>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{selectedAnnouncement?.description}</p>
          </div>
          {selectedAnnouncement?.filePath && (
            <div className="mt-4 p-3 bg-light rounded-3 border">
              <h6 className="fw-bold mb-2">Attached Document:</h6>
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-truncate me-3">{selectedAnnouncement.fileName || "Document"}</span>
                <a
                  href={`http://localhost:5000/${selectedAnnouncement.filePath}`}
                  download={selectedAnnouncement.fileName || "attachment"}
                  className="btn btn-info btn-sm"
                >
                  Download Document
                </a>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
