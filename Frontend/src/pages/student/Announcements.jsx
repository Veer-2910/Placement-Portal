import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNotifications } from "../../contexts/NotificationContext";
import { Modal, Button } from "react-bootstrap";
import { 
  Megaphone, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  CheckCircle2, 
  X,
  FileText,
  AlertCircle,
  Clock
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

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
        const response = await axios.get("http://localhost:5000/api/announcements", {
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
        const response = await axios.get("http://localhost:5000/api/announcements/filters", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableFilters(response.data);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

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
        if (filters.department) queryParams.append("department", filters.department);
        if (filters.institute) queryParams.append("institute", filters.institute);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.search) queryParams.append("search", filters.search);

        const queryString = queryParams.toString();
        const response = await axios.get(
          `http://localhost:5000/api/announcements${queryString ? `?${queryString}` : ""}`,
          { headers: { Authorization: `Bearer ${token}` } }
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
      search: "",
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
      await axios.get(`http://localhost:5000/api/announcements/${announcementId}/mark-as-read`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      // Update local state to reflect read status
      setAnnouncements(prev => prev.map(a => 
        a._id === announcementId 
          ? { ...a, readBy: [...(a.readBy || []), user._id] } 
          : a
      ));
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

  const getCategoryBadgeClass = (category) => {
    switch(category) {
      case 'Urgent': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'Deadline': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'Event': return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'Notice': return 'bg-primary-subtle text-primary border border-primary-subtle';
      default: return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
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
          <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2 text-uppercase small">Updates</p>
          <h1 className="dash-title display-6 fw-bold text-dark mb-2">Announcements</h1>
          <p className="text-secondary fs-5 mb-0" style={{maxWidth: '600px'}}>
            Stay informed with the latest updates, notices, and events from the faculty.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <div className="position-absolute top-0 end-0 m-4 animate-bounce-in">
             <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm border border-white d-flex align-items-center gap-2">
               <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
               {unreadCount} New
             </span>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger border-0 shadow-sm rounded-4 mb-4 p-3 d-flex align-items-center gap-3">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Filter Controls */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4 bg-white">
           <div className="row g-3">
             <div className="col-lg-3 col-md-6">
                <div className="form-group">
                   <label className="form-label small fw-bold text-uppercase text-secondary">Department</label>
                   <select
                     className="form-select bg-light border-0"
                     value={filters.department}
                     onChange={(e) => handleFilterChange("department", e.target.value)}
                   >
                     <option value="">All Departments</option>
                     {availableFilters.departments.map((dept) => (
                       <option key={dept} value={dept}>{dept}</option>
                     ))}
                   </select>
                </div>
             </div>
             
             <div className="col-lg-3 col-md-6">
                <div className="form-group">
                   <label className="form-label small fw-bold text-uppercase text-secondary">Category</label>
                   <select
                     className="form-select bg-light border-0"
                     value={filters.category}
                     onChange={(e) => handleFilterChange("category", e.target.value)}
                   >
                     <option value="">All Categories</option>
                     {['General', 'Urgent', 'Deadline', 'Event', 'Notice'].map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                     ))}
                   </select>
                </div>
             </div>

             <div className="col-lg-4 col-md-8">
                <div className="form-group">
                   <label className="form-label small fw-bold text-uppercase text-secondary">Search</label>
                   <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-secondary"><Search size={18} /></span>
                      <input
                        type="text"
                        className="form-control bg-light border-0"
                        placeholder="Search by title..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                      {filters.search && (
                        <button className="btn btn-light border-0" onClick={() => handleFilterChange("search", "")}>
                          <X size={16} />
                        </button>
                      )}
                   </div>
                </div>
             </div>

             <div className="col-lg-2 col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100 border-2 fw-medium"
                  onClick={clearFilters}
                  disabled={!Object.values(filters).some(f => f)}
                >
                  Clear Filters
                </button>
             </div>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="row g-4">
           {[1,2,3].map(i => <div key={i} className="col-12"><Skeleton height="160px" borderRadius="16px" /></div>)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-5 card rounded-4 border-0 shadow-sm p-5">
           <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 border border-light-subtle">
             <Megaphone size={48} className="text-secondary" />
           </div>
           <h4 className="fw-bold text-dark mb-2">No Announcements</h4>
           <p className="text-secondary mb-0">Check back later for important updates.</p>
        </div>
      ) : (
        <div className="row g-4">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="col-12">
              <div 
                className={`card border-0 shadow-sm rounded-4 overflow-hidden transition-all hover-lift ${!announcement.readBy?.includes(user._id) ? 'border-start border-4 border-primary' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleView(announcement)}
              >
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                    <div className="d-flex gap-3 align-items-start">
                       <div className={`p-3 rounded-3 flex-shrink-0 ${!announcement.readBy?.includes(user._id) ? 'bg-primary-subtle text-primary' : 'bg-light text-secondary'}`}>
                          <Megaphone size={24} />
                       </div>
                       <div>
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                             <h5 className="fw-bold text-dark mb-0">{announcement.title}</h5>
                             {!announcement.readBy?.includes(user._id) && (
                               <span className="badge bg-danger rounded-pill px-2 py-1 small">New</span>
                             )}
                             <span className={`badge rounded-pill fw-medium px-2 py-1 ${getCategoryBadgeClass(announcement.category || 'General')}`}>
                               {announcement.category || 'General'}
                             </span>
                          </div>
                          <p className="text-secondary mb-3 lh-base">
                            {announcement.description.length > 200 
                              ? announcement.description.substring(0, 200) + "..." 
                              : announcement.description}
                          </p>
                          
                          <div className="d-flex flex-wrap gap-4 text-secondary small align-items-center">
                             <span className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">
                               <User size={14} /> {announcement.uploadedByName}
                             </span>
                             <span className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded">
                               <Calendar size={14} /> {formatDate(announcement.createdAt)}
                             </span>
                             {announcement.filePath && (
                               <span className="d-flex align-items-center gap-1 text-primary fw-medium bg-primary-subtle px-2 py-1 rounded">
                                 <FileText size={14} /> Attachment
                               </span>
                             )}
                          </div>
                       </div>
                    </div>
                    
                    <div className="d-flex flex-column align-items-end gap-2 flex-shrink-0 ms-auto">
                       <button className="btn btn-light btn-sm rounded-pill px-3 fw-medium text-primary hover-bg-primary hover-text-white transition-colors">
                          View Details
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Announcement Modal */}
      <Modal 
        show={showViewModal} 
        onHide={() => setShowViewModal(false)} 
        size="lg" 
        centered
        contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
      >
        <div className="modal-header border-bottom border-blue-100 p-4" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)" }}>
           <div className="d-flex align-items-center gap-3 w-100">
              <div className="bg-white border border-blue-100 p-2 rounded-circle shadow-sm text-primary">
                 <Megaphone size={20} />
              </div>
              <div className="flex-grow-1">
                 <h5 className="modal-title fw-bold text-dark mb-1">{selectedAnnouncement?.title}</h5>
                 <div className="d-flex gap-2 align-items-center text-primary-emphasis small">
                    <User size={14} /> {selectedAnnouncement?.uploadedByName}
                    <span>•</span>
                    <Clock size={14} /> {selectedAnnouncement && formatDate(selectedAnnouncement.createdAt)}
                 </div>
              </div>
              <button className="btn-close opacity-50" onClick={() => setShowViewModal(false)}></button>
           </div>
        </div>
        
        <div className="modal-body p-4 p-lg-5" style={{ backgroundColor: "#f8fcff" }}>
           <div className="mb-4">
              <span className={`badge rounded-pill px-3 py-2 fw-medium ${getCategoryBadgeClass(selectedAnnouncement?.category || 'General')}`}>
                 {selectedAnnouncement?.category || "General"}
              </span>
              <span className="badge bg-white text-dark border border-blue-100 ms-2 rounded-pill px-3 py-2 shadow-sm">
                 {selectedAnnouncement?.department || "All Departments"}
              </span>
           </div>
           
           <div className="bg-white rounded-4 p-4 border border-blue-100 mb-4 shadow-sm">
              <p className="text-dark mb-0 leading-relaxed" style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
                 {selectedAnnouncement?.description}
              </p>
           </div>
           
           {selectedAnnouncement?.filePath && (
             <div className="d-flex align-items-center justify-content-between bg-blue-50 rounded-3 p-3 border border-blue-100">
                <div className="d-flex align-items-center gap-3">
                   <div className="bg-white p-2 rounded-circle text-primary shadow-sm">
                      <FileText size={20} />
                   </div>
                   <div>
                      <h6 className="fw-bold text-dark mb-0">Attached Document</h6>
                      <p className="small text-secondary mb-0">{selectedAnnouncement.fileName || "Download Attachment"}</p>
                   </div>
                </div>
                <a
                  href={`http://localhost:5000/${selectedAnnouncement.filePath}`}
                  download={selectedAnnouncement.fileName || "attachment"}
                  className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                  onClick={(e) => {
                     // Prevent modal close if inside link
                     e.stopPropagation(); 
                  }}
                >
                  <Download size={16} className="me-2" /> Download
                </a>
             </div>
           )}
        </div>
      </Modal>
      
      <style jsx>{`
        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05) !important; }
        .hover-bg-primary:hover { background-color: var(--bs-primary) !important; color: white !important; }
        .bg-blue-50 { background-color: #eff6ff; }
        .border-blue-100 { border-color: #dbeafe !important; }
      `}</style>
    </div>
  );
}
