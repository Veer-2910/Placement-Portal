import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentResources({ user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Fetch all resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        // Build query params
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedTag) params.tag = selectedTag;

        const response = await axios.get("/api/faculty/resources/all", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setResources(response.data);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to load resources");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResources();
    }
  }, [user, searchTerm, selectedCategory, selectedTag]);

  // Fetch categories and tags for filtering
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get("/api/faculty/resources/filters", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data.categories || []);
        setTags(response.data.tags || []);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    if (user) {
      fetchFilters();
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownload = (filePath) => {
    // Create a download link for the file
    const link = document.createElement("a");
    link.href = `http://localhost:5000/${filePath}`;
    link.download = filePath.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenLink = (url) => {
    window.open(url, "_blank");
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
          <p className="dash-eyebrow text-primary fw-bold mb-2">LEARNING RESOURCES</p>
          <h2 className="dash-title display-6 fw-bold text-dark mb-2">Available Resources</h2>
          <p className="dash-subtitle text-secondary fs-5 mb-0">
            Access learning materials uploaded by faculty
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search and Filter Controls */}
      <div className="dash-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Search & Filter</h5>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "200px" }}
            />
            {(selectedCategory || selectedTag) && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedTag("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {(categories.length > 0 || tags.length > 0) && (
          <div className="d-flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${
                  selectedCategory === cat
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? "" : cat)
                }
              >
                {cat}
              </button>
            ))}
            {tags.map((tag) => (
              <button
                key={tag}
                className={`btn btn-sm ${
                  selectedTag === tag ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="dash-card text-center py-5">
          <h5>No resources available</h5>
          <p className="text-muted">
            Check back later for learning materials from faculty.
          </p>
        </div>
      ) : (
        <div className="row">
          {resources.map((resource) => (
            <div key={resource._id} className="col-lg-6 col-xl-4 mb-4">
              <div className="dash-card h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1">{resource.title}</h5>
                    {resource.description && (
                      <p className="text-muted small mb-0">
                        {resource.description}
                      </p>
                    )}
                    {(resource.category ||
                      (resource.tags && resource.tags.length > 0)) && (
                  <div className="mt-2">
                        {resource.category && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-1">
                            {resource.category}
                          </span>
                        )}
                        {resource.tags &&
                          resource.tags.map((tag) => (
                            <span
                              key={tag}
                              className="badge bg-secondary-subtle text-secondary border border-secondary-subtle me-1"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  {resource.link ? (
                    <span className="badge bg-indigo-subtle text-indigo border border-indigo-subtle">Link</span>
                  ) : (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle">File</span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="small text-secondary mb-1">
                    <strong className="text-dark">Uploaded by:</strong> {resource.uploadedByName}
                  </div>
                  <div className="small text-secondary mb-1">
                    <strong className="text-dark">Department:</strong> {resource.department}
                  </div>
                  <div className="small text-secondary mb-1">
                    <strong className="text-dark">Date:</strong> {formatDate(resource.createdAt)}
                  </div>
                  {(resource.viewCount > 0 || resource.downloadCount > 0) && (
                    <div className="small text-secondary border-top pt-2 mt-2">
                      <span className="me-3">
                        <i className="bi bi-eye me-1"></i> {resource.viewCount || 0}
                      </span>
                      <span>
                         <i className="bi bi-download me-1"></i> {resource.downloadCount || 0}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 border-top">
                  {resource.link ? (
                    <button
                      className="btn btn-outline-primary w-100 fw-medium"
                      onClick={() => handleOpenLink(resource.link)}
                    >
                      Open Link
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary w-100 fw-medium shadow-sm transition-all"
                      onClick={() => handleDownload(resource.filePath)}
                    >
                      Download File
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
