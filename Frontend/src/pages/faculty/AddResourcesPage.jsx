import { useState, useEffect } from "react";
import { PlusCircle, FileText } from "react-bootstrap-icons";
import axios from "axios";

const BACKEND_URL = "http://localhost:5000"; // make sure this matches your server port

function AddResourcePage() {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch existing resources on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/resources`);
        setResources(res.data);
      } catch (err) {
        console.error(err);
        setAlert({ type: "danger", message: "Failed to load resources" });
      }
    };
    fetchResources();
  }, []);

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!title || !link) return;

    setLoading(true);
    setAlert(null);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/resources`, {
        title,
        link,
      });
      setResources([res.data, ...resources]); // prepend new resource
      setTitle("");
      setLink("");
      setAlert({ type: "success", message: "Resource added successfully!" });
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: err.response?.data?.message || "Failed to add resource",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2
        className="mb-4 d-flex align-items-center"
        style={{ color: "#2c3e50" }}
      >
        <PlusCircle className="me-2" size={28} />
        Add Resources
      </h2>

      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      )}

      <form className="mb-5" onSubmit={handleAddResource}>
        <div className="mb-3">
          <label className="form-label">Resource Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter resource title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Resource Link</label>
          <input
            type="url"
            className="form-control"
            placeholder="Enter resource link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn"
          style={{
            backgroundColor: "#2c3e50",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "0.5rem 1.5rem",
          }}
        >
          {loading ? "Adding..." : "Add Resource"}
        </button>
      </form>

      <div>
        <h3
          className="mb-3 d-flex align-items-center"
          style={{ color: "#2c3e50" }}
        >
          <FileText className="me-2" size={20} />
          Added Resources
        </h3>

        {resources.length === 0 ? (
          <div className="alert alert-info">
            No resources added yet. Add your first resource above.
          </div>
        ) : (
          <ul className="list-group">
            {resources.map((resource) => (
              <li
                key={resource._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>{resource.title}</span>
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#2c3e50",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.25rem 0.75rem",
                  }}
                >
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AddResourcePage;
