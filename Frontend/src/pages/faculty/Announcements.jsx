import { useState, useEffect } from "react";
import axios from "axios";
import { useNotifications } from "../../contexts/NotificationContext";
import { Modal, Button } from "react-bootstrap";

export default function FacultyAnnouncements({ user }) {
  const { showNotification } = useNotifications();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Fetch announcements when component mounts
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const response = await axios.get("/api/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter announcements created by this faculty
      const facultyAnnouncements = response.data.filter(
        (announcement) => announcement.uploadedBy._id === user._id
      );

      setAnnouncements(facultyAnnouncements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setTitle(announcement.title);
    setDescription(announcement.description);
    setCategory(announcement.category || "General");
    setEditingId(announcement._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to form
  };

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      await axios.delete(`/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification(
        "Announcement Deleted",
        "The announcement has been successfully deleted."
      );

      // Refresh announcements list
      fetchAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError(err.response?.data?.message || "Failed to delete announcement");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setTitle("");
    setDescription("");
    setCategory("General");
    setFile(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description) {
      setError("Title and description are required");
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      if (file) {
        formData.append("file", file);
      }

      let response;
      if (isEditing) {
        // Update existing announcement
        response = await axios.put(
          `/api/announcements/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccess("Announcement updated successfully!");
        showNotification(
          "Announcement Updated",
          "Your announcement has been successfully updated."
        );
      } else {
        // Create new announcement
        response = await axios.post("/api/announcements", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Announcement posted successfully!");
        // Show notification
        showNotification(
          "Announcement Posted",
          "Your announcement has been successfully posted and is now visible to students."
        );
      }

      // Clear form
      setTitle("");
      setDescription("");
      setCategory("General");
      setFile(null);
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      console.error("Announcement operation error:", err);
      setError(
        err.response?.data?.message ||
          (isEditing
            ? "Failed to update announcement"
            : "Failed to post announcement")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
           style={{ 
             background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)", 
             backdropFilter: "blur(20px)",
             boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)"
           }}>
        <div>
          <p className="dash-eyebrow text-primary fw-bold mb-2">MANAGEMENT</p>
          <h2 className="dash-title display-6 fw-bold text-dark mb-2">Faculty Announcements</h2>
          <p className="dash-subtitle text-secondary fs-5 mb-0">
            Communicate critical updates and deadlines to your students.
          </p>
        </div>
      </div>

      {/* Post Announcement Form */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">Create Announcement</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter announcement description"
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Urgent">Urgent</option>
              <option value="Deadline">Deadline</option>
              <option value="Event">Event</option>
              <option value="Notice">Notice</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Attachment (Optional)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <div className="form-text">
              Upload a document (PDF, DOC, DOCX, etc.) to accompany your
              announcement
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Posting..."
                : isEditing
                ? "Update Announcement"
                : "Post Announcement"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
        </div>
      </div>

      {/* Display existing announcements */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">Your Announcements</h5>

        {loading && announcements.length === 0 ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <p>No announcements posted yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement._id}>
                    <td>
                      <div className="fw-bold">{announcement.title}</div>
                      <div className="small text-muted">
                        {announcement.description.length > 100
                          ? announcement.description.substring(0, 100) + "..."
                          : announcement.description}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          announcement.category === "Urgent"
                            ? "bg-danger"
                            : announcement.category === "Deadline"
                            ? "bg-warning text-dark"
                            : announcement.category === "Event"
                            ? "bg-info"
                            : announcement.category === "Notice"
                            ? "bg-primary"
                            : "bg-secondary"
                        }`}
                      >
                        {announcement.category}
                      </span>
                    </td>
                    <td>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => handleView(announcement)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(announcement)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(announcement._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* View Announcement Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedAnnouncement?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <span
              className={`badge ${
                selectedAnnouncement?.category === "Urgent"
                  ? "bg-danger"
                  : selectedAnnouncement?.category === "Deadline"
                  ? "bg-warning text-dark"
                  : selectedAnnouncement?.category === "Event"
                  ? "bg-info"
                  : selectedAnnouncement?.category === "Notice"
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            >
              {selectedAnnouncement?.category}
            </span>
            <span className="ms-2 text-muted small">
              Posted on: {selectedAnnouncement && new Date(selectedAnnouncement.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="announcement-content">
            <h6 className="fw-bold mb-2">Description:</h6>
            <p style={{ whiteSpace: "pre-wrap" }}>{selectedAnnouncement?.description}</p>
          </div>
          {selectedAnnouncement?.filePath && (
            <div className="mt-4">
              <h6 className="fw-bold mb-2">Attachment:</h6>
              <a
                href={`http://localhost:5000/${selectedAnnouncement.filePath}`}
                download={selectedAnnouncement.fileName || "attachment"}
                className="btn btn-outline-info btn-sm"
              >
                Download Document
              </a>
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
