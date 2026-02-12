import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Library, 
  Search, 
  X, 
  FileText, 
  Link as LinkIcon, 
  Download, 
  ExternalLink,
  Eye,
  Calendar,
  User,
  BookOpen,
  Filter
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

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

        const response = await axios.get("http://localhost:5000/api/faculty/resources/all", {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDownload = (filePath) => {
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
    <div className="dash-container bg-transparent p-0 border-0">
      <div className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
           style={{ 
             background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)", 
             backdropFilter: "blur(20px)",
             boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)"
           }}>
        <div className="position-relative z-1">
           <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2 text-uppercase small">Knowledge Base</p>
           <h1 className="dash-title display-6 fw-bold text-dark mb-2">Learning Resources</h1>
           <p className="text-secondary fs-5 mb-0" style={{maxWidth: '600px'}}>
             Access study materials, lecture notes, and reference links shared by faculty.
           </p>
        </div>
        <div className="position-absolute end-0 top-0 opacity-25 p-5 d-none d-lg-block">
           <Library size={240} className="text-secondary opacity-10" />
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0 rounded-4 mb-4">{error}</div>}

      {/* Search and Filter Controls */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 bg-white">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4 border-bottom pb-4">
             <div className="d-flex align-items-center gap-2">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                   <Filter size={20} />
                </div>
                <h5 className="fw-bold text-dark mb-0">Search & Filter</h5>
             </div>
             <div className="d-flex gap-2 w-100 w-md-50">
                <div className="input-group">
                   <span className="input-group-text bg-light border-0"><Search size={18} className="text-secondary" /></span>
                   <input
                     type="text"
                     className="form-control bg-light border-0"
                     placeholder="Search resources by title..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                   {(searchTerm || selectedCategory || selectedTag) && (
                     <button className="btn btn-light border-0" onClick={() => { setSearchTerm(""); setSelectedCategory(""); setSelectedTag(""); }}>
                       <X size={18} />
                     </button>
                   )}
                </div>
             </div>
          </div>

          <div className="d-flex flex-column gap-3">
             {/* Categories */}
             {categories.length > 0 && (
               <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="text-secondary small fw-bold text-uppercase me-2">Categories:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`btn btn-sm rounded-pill px-3 fw-medium transition-all ${
                        selectedCategory === cat
                          ? "btn-primary shadow-sm"
                          : "btn-outline-secondary border-0 bg-light text-secondary"
                      }`}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
             )}
             
             {/* Tags */}
             {tags.length > 0 && (
               <div className="d-flex flex-wrap align-items-center gap-2">
                  <span className="text-secondary small fw-bold text-uppercase me-2">Tags:</span>
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      className={`btn btn-sm rounded-pill px-3 fw-medium transition-all ${
                        selectedTag === tag
                          ? "btn-success text-white shadow-sm"
                          : "btn-outline-success border-0 bg-success-subtle text-success"
                      }`}
                      onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    >
                      #{tag}
                    </button>
                  ))}
               </div>
             )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row g-4">
           {[1,2,3,4].map(i => <div key={i} className="col-lg-6 col-xl-4"><Skeleton height="250px" borderRadius="16px" /></div>)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-5 card rounded-4 border-0 shadow-sm p-5">
           <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 border border-light-subtle">
             <BookOpen size={48} className="text-secondary" />
           </div>
           <h4 className="fw-bold text-dark mb-2">No Resources Found</h4>
           <p className="text-secondary mb-0">Adjust your filters or check back later.</p>
        </div>
      ) : (
        <div className="row g-4">
          {resources.map((resource) => (
            <div key={resource._id} className="col-lg-6 col-xl-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift transition-all overflow-hidden group">
                <div className="card-body p-4 d-flex flex-column">
                   <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                         <div className={`p-3 rounded-3 ${resource.link ? 'bg-indigo-subtle text-indigo' : 'bg-primary-subtle text-primary'}`}>
                            {resource.link ? <LinkIcon size={24} /> : <FileText size={24} />}
                         </div>
                         <div>
                            <h6 className="fw-bold text-dark mb-1 line-clamp-1" title={resource.title}>{resource.title}</h6>
                            <span className="badge bg-light text-secondary border border-light-subtle rounded-pill fw-medium">
                               {resource.link ? 'External Link' : 'Document'}
                            </span>
                         </div>
                      </div>
                   </div>

                   {resource.description && (
                     <p className="text-secondary small mb-3 line-clamp-2 flex-grow-1">
                       {resource.description}
                     </p>
                   )}

                   <div className="d-flex flex-wrap gap-2 mb-4">
                      {resource.category && (
                        <span className="badge bg-white text-secondary border border-light-subtle px-2 py-1 rounded">
                           {resource.category}
                        </span>
                      )}
                      {resource.tags && resource.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge bg-white text-secondary border border-light-subtle px-2 py-1 rounded">
                           #{tag}
                        </span>
                      ))}
                   </div>

                   <div className="mt-auto pt-3 border-top border-light">
                      <div className="d-flex justify-content-between align-items-center mb-3 text-secondary small">
                         <span className="d-flex align-items-center gap-1"><User size={14} /> {resource.uploadedByName}</span>
                         <span className="d-flex align-items-center gap-1"><Calendar size={14} /> {formatDate(resource.createdAt)}</span>
                      </div>
                      
                      {resource.link ? (
                        <button
                          className="btn btn-outline-primary w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 hover-bg-primary hover-text-white transition-all"
                          onClick={() => handleOpenLink(resource.link)}
                        >
                          Open Resource <ExternalLink size={16} />
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary w-100 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm gradient-btn"
                          onClick={() => handleDownload(resource.filePath)}
                        >
                          Download File <Download size={16} />
                        </button>
                      )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
         .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
         .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
         .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important; }
         .bg-indigo-subtle { background-color: #e0e7ff; }
         .text-indigo { color: #4338ca; }
         .hover-bg-primary:hover { background-color: var(--bs-primary); color: white; }
      `}</style>
    </div>
  );
}
