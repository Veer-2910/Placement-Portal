import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Download, 
  ExternalLink, 
  Trash2, 
  Edit2, 
  Search, 
  Filter,
  FileText,
  Link as LinkIcon,
  X
} from "lucide-react";

export default function FacultyResources({ user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Handle file download
  const handleDownload = (filePath) => {
    // Create a download link for the file
    const link = document.createElement("a");
    link.href = `http://localhost:5000/${filePath}`;
    link.download = filePath.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle opening links
  const handleOpenLink = (url) => {
    window.open(url, "_blank");
  };

  // Fetch existing resources
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

        const response = await axios.get("http://localhost:5000/api/faculty/resources", {
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
        const response = await axios.get("http://localhost:5000/api/faculty/resources/filters", {
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

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLink("");
    setFile(null);
    setCategory("");
    setTagsInput("");
    setError("");
    setSuccess("");
  };

  const handleEdit = (resource) => {
    setEditingId(resource._id);
    setTitle(resource.title);
    setDescription(resource.description || "");
    setLink(resource.link || "");
    setCategory(resource.category || "");
    setTagsInput(resource.tags ? resource.tags.join(", ") : "");
    // Note: Can't set file input value programmatically for security reasons
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/faculty/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResources(resources.filter(r => r._id !== id));
      setSuccess("Resource deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete resource");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title) {
      setError("Title is required");
      return;
    }

    if (!editingId && !link && !file) {
      setError("Either a link or file must be provided");
      return;
    }

    try {
      setIsUploading(true);
      const token = sessionStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (category) formData.append("category", category);
      if (tagsInput) {
        const tagsArray = tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        tagsArray.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      }

      if (file) {
        formData.append("file", file);
      } else if (link) {
        formData.append("link", link);
      }

      let response;
      if (editingId) {
        response = await axios.put(
          `http://localhost:5000/api/faculty/resources/${editingId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Update resource in list
        setResources(resources.map(r => r._id === editingId ? response.data.resource : r));
        setSuccess("Resource updated successfully!");
      } else {
        response = await axios.post(
          "http://localhost:5000/api/faculty/resources/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Add new resource to the list
        setResources([response.data.resource, ...resources]);
        setSuccess("Resource uploaded successfully!");
      }
      
      resetForm();

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to save resource");
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
           style={{ 
             background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)", 
             backdropFilter: "blur(20px)",
             boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)"
           }}>
        <div className="position-relative z-1 text-dark">
          <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2">RESOURCE CENTER</p>
          <h1 className="dash-title display-6 fw-bold text-dark mb-2">Resource Management</h1>
          <p className="text-secondary fs-5 mb-0" style={{maxWidth: '600px'}}>
            Upload and manage study materials and placement guides for students.
          </p>
        </div>
      </div>

      {/* Upload/Edit Form */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent border-bottom border-light p-4">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">{editingId ? "Edit Resource" : "Upload New Resource"}</h5>
          </div>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-medium">Title *</label>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter resource title"
                  required
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-medium">Category</label>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Notes, Papers"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium">Description</label>
                <textarea
                  className="form-control bg-light border-0"
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the resource"
                ></textarea>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Resource Link</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0"><LinkIcon size={18} /></span>
                  <input
                    type="url"
                    className="form-control bg-light border-0"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                    disabled={file !== null}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Or Upload File</label>
                <input
                  type="file"
                  className="form-control bg-light border-0"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={link !== ""}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium">Tags</label>
                <input
                  type="text"
                  className="form-control bg-light border-0"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g., python, algorithms, java (comma separated)"
                />
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-medium"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary px-4 fw-medium"
                disabled={isUploading}
              >
                {isUploading ? "Saving..." : (editingId ? "Update Resource" : "Upload Resource")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resources List */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent border-bottom border-light p-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="input-group" style={{ maxWidth: "400px" }}>
              <span className="input-group-text bg-light border-0">
                <Search size={18} className="text-secondary" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 py-2"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                 <FileText size={48} className="text-muted" />
              </div>
              <p className="text-muted fs-5">No resources uploaded yet.</p>
              <p className="text-secondary small">Upload your first resource using the form above.</p>
            </div>
          ) : (
             <div className="list-group list-group-flush">
                {resources.map((resource) => (
                  <div key={resource._id} className="list-group-item p-4 hover-bg-light transition-all border-bottom-light">
                      <div className="d-flex justify-content-between align-items-start gap-4">
                          <div className="flex-grow-1">
                             <div className="d-flex align-items-center mb-2">
                                <h5 className="mb-0 fw-bold text-dark me-3">{resource.title}</h5>
                                {resource.link ? (
                                    <span className="badge bg-indigo-subtle text-indigo rounded-pill fw-medium border border-indigo-subtle">
                                        <LinkIcon size={12} className="me-1" /> Link
                                    </span>
                                ) : (
                                    <span className="badge bg-emerald-subtle text-emerald rounded-pill fw-medium border border-emerald-subtle">
                                        <FileText size={12} className="me-1" /> File
                                    </span>
                                )}
                             </div>
                             {resource.description && (
                                <p className="text-secondary mb-2">{resource.description}</p>
                             )}
                             
                             <div className="d-flex flex-wrap gap-2 mt-2">
                                {resource.category && (
                                    <span className="badge bg-light text-secondary border fw-normal">{resource.category}</span>
                                )}
                                {resource.tags && resource.tags.map(tag => (
                                    <span key={tag} className="badge bg-light text-secondary border fw-normal">#{tag}</span>
                                ))}
                             </div>

                             <div className="d-flex align-items-center gap-3 mt-3 text-secondary small">
                                <span>{formatDate(resource.createdAt)}</span>
                                <span>•</span>
                                <span>Views: {resource.viewCount || 0}</span>
                             </div>
                          </div>

                          <div className="d-flex flex-column gap-2">
                             {/* Actions */}
                             <div className="d-flex gap-2 justify-content-end mb-2">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(resource)}>
                                    <Edit2 size={16} />
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(resource._id)}>
                                    <Trash2 size={16} />
                                </button>
                             </div>

                             {resource.link ? (
                                <button 
                                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                    onClick={() => handleOpenLink(resource.link)}
                                >
                                    Open Link <ExternalLink size={16} />
                                </button>
                             ) : (
                                <button
                                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                    onClick={() => handleDownload(resource.filePath)}
                                >
                                    Download <Download size={16} />
                                </button>
                             )}
                          </div>
                      </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
