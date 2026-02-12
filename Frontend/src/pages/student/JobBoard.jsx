import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronRight, 
  Info,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";

export default function JobBoard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Single Job View
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationNotes, setApplicationNotes] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [sortBy, setSortBy] = useState("match"); // match, latest, salary

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const [jobsRes, profileRes, matchedRes] = await Promise.all([
        axios.get("http://localhost:5000/api/jobs", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:5000/api/auth/student/profile/${user._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/students/matched-jobs", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);
      
      // Merge jobs with match scores
      const jobsWithScores = jobsRes.data.map(job => {
        const matchedJob = matchedRes.data.find(m => m._id === job._id);
        return {
          ...job,
          matchScore: matchedJob?.matchScore || 0
        };
      });
      
      setJobs(jobsWithScores);
      setMatchedJobs(matchedRes.data);
      setBookmarks(profileRes.data.bookmarkedJobs || []);
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      setIsApplying(true);
      setError("");
      const token = sessionStorage.getItem("token");
      await axios.post("http://localhost:5000/api/applications/apply", {
        jobId: selectedJob._id,
        notes: applicationNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Application submitted successfully!");
      setSelectedJob(null);
      setApplicationNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  const handleBookmark = async (e, driveId) => {
    e.stopPropagation();
    try {
      setIsBookmarking(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/students/bookmarks/toggle", { driveId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data.bookmarkedJobs);
    } catch (err) {
       console.error("Bookmark toggle failed", err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const filteredJobs = jobs
    .filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "match") {
        return (b.matchScore || 0) - (a.matchScore || 0);
      } else if (sortBy === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  return (
    <div className="dash-container bg-transparent p-0 border-0">
      <div className="dash-hero mb-4 p-4 p-lg-5 rounded-4 border border-white position-relative overflow-hidden"
           style={{ 
             background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)", 
             backdropFilter: "blur(20px)",
             boxShadow: "0 8px 32px 0 rgba(14, 165, 233, 0.1)"
           }}>
        <div className="position-relative z-1">
          <p className="dash-eyebrow text-primary fw-bold tracking-wide mb-2">OPPORTUNITIES</p>
          <h1 className="dash-title display-6 fw-bold text-dark mb-2">Job Board</h1>
          <p className="text-secondary fs-5 mb-0" style={{maxWidth: '600px'}}>
            Find and apply for the latest job postings and internships.
          </p>
        </div>
      </div>

      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {success}
        <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
      </div>}
      
      <div className="row g-4">
        {/* Job List */}
        <div className={selectedJob ? "col-lg-5" : "col-12"}>
          <div className="card border-0 shadow-sm overflow-hidden rounded-4">
            <div className="card-header bg-transparent border-light p-3">
              <div className="input-group border rounded-3 bg-light">
                <span className="input-group-text bg-transparent border-0"><Search size={18} className="text-secondary" /></span>
                <input
                  type="text"
                  className="form-control bg-transparent border-0 py-2"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="mt-3 d-flex justify-content-between align-items-center">
                <span className="text-secondary small">{filteredJobs.length} jobs found</span>
                <select 
                  className="form-select form-select-sm border-0 bg-light w-auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="match">Sort by: Best Match</option>
                  <option value="latest">Sort by: Latest</option>
                </select>
              </div>
            </div>
            
            <div className="card-body p-0" style={{maxHeight: '74vh', overflowY: 'auto'}}>
              {loading ? (
                <div className="p-4 d-flex flex-column gap-3">
                   {[1,2,3,4,5].map(i => <Skeleton key={i} height="120px" borderRadius="12px" />)}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No jobs available right now.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredJobs.map(job => (
                    <button
                      key={job._id}
                      onClick={() => setSelectedJob(job)}
                      className={`list-group-item list-group-item-action p-4 border-0 border-bottom-light transition-all ${selectedJob?._id === job._id ? 'bg-primary-subtle' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                           <div className="bg-white rounded-3 p-2 shadow-sm me-3 border border-light-subtle">
                             <Briefcase size={20} className="text-primary" />
                           </div>
                           <div>
                             <h6 className="mb-0 fw-bold">{job.title}</h6>
                             <span className="text-secondary small">{job.company}</span>
                           </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                           {/* Match Score Badge */}
                           {job.matchScore > 0 && (
                             <span className={`badge rounded-pill fw-bold ${
                               job.matchScore >= 80 ? 'bg-success' : 
                               job.matchScore >= 60 ? 'bg-warning text-dark' : 
                               'bg-secondary'
                             }`}>
                               {job.matchScore}% Match
                             </span>
                           )}
                           <button 
                             className="btn border-0 p-1" 
                             onClick={(e) => handleBookmark(e, job._id)}
                             disabled={isBookmarking}
                           >
                             <Star size={18} fill={bookmarks.includes(job._id) ? "#f59e0b" : "none"} color={bookmarks.includes(job._id) ? "#f59e0b" : "#64748b"} />
                           </button>
                           <span className={`badge ${job.jobType === 'Full-time' ? 'bg-blue-subtle text-blue' : 'bg-purple-subtle text-purple'} rounded-pill`}>
                             {job.jobType}
                           </span>
                        </div>
                      </div>
                      <div className="d-flex gap-3 text-secondary small mt-3">
                        <div className="d-flex align-items-center gap-1"><MapPin size={14} /> {job.location}</div>
                        <div className="d-flex align-items-center gap-1"><DollarSign size={14} /> {job.ctc || 'N/A'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Detail Sidebar/View */}
        {selectedJob && (
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{top: '20px'}}>
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex justify-content-between align-items-start mb-4">
                   <div className="d-flex align-items-center">
                      <div className="bg-primary-subtle text-primary rounded-4 p-3 me-3">
                        <Briefcase size={32} />
                      </div>
                      <div>
                        <h2 className="mb-0 fw-bold">{selectedJob.title}</h2>
                        <p className="text-primary fw-medium mb-0 fs-5">{selectedJob.company}</p>
                      </div>
                   </div>
                   <button className="btn-close" onClick={() => setSelectedJob(null)}></button>
                </div>

                <div className="row g-3 mb-4">
                   <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 border border-light-subtle">
                         <p className="small text-secondary text-uppercase fw-bold mb-1">Location</p>
                         <p className="mb-0 fw-medium d-flex align-items-center gap-2 text-dark"><MapPin size={18} /> {selectedJob.location}</p>
                      </div>
                   </div>
                   <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 border border-light-subtle">
                         <p className="small text-secondary text-uppercase fw-bold mb-1">Salary / CTC</p>
                         <p className="mb-0 fw-medium d-flex align-items-center gap-2 text-dark"><DollarSign size={18} /> {selectedJob.ctc || 'Not Specified'}</p>
                      </div>
                   </div>
                   <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 border border-light-subtle">
                         <p className="small text-secondary text-uppercase fw-bold mb-1">Deadline</p>
                         <p className="mb-0 fw-medium d-flex align-items-center gap-2 text-dark"><Calendar size={18} /> {new Date(selectedJob.deadline).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="col-sm-6">
                      <div className="bg-light rounded-3 p-3 border border-light-subtle">
                         <p className="small text-secondary text-uppercase fw-bold mb-1">Min. CGPA</p>
                         <p className="mb-0 fw-medium d-flex align-items-center gap-2 text-dark"><CheckCircle size={18} /> {selectedJob.criteria?.cgpa || '0.0'}</p>
                      </div>
                   </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3 border-bottom pb-2">About the Role</h5>
                  <p className="text-secondary leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3 border-bottom pb-2">Requirements</h5>
                  <ul className="text-secondary">
                    {selectedJob.requirements?.map((req, i) => (
                      <li key={i} className="mb-1">{req}</li>
                    ))}
                  </ul>
                </div>

                {error && <div className="alert alert-danger mb-4">{error}</div>}

                <div className="bg-light rounded-4 p-4 border border-primary-subtle shadow-sm">
                   <h6 className="fw-bold mb-3">Application Notes</h6>
                   <textarea 
                     className="form-control border-white shadow-sm mb-3" 
                     rows="3" 
                     placeholder="Why are you interested in this role?"
                     value={applicationNotes}
                     onChange={(e) => setApplicationNotes(e.target.value)}
                   ></textarea>
                   <button 
                     className="btn btn-primary btn-lg w-100 fw-bold rounded-3 shadow-sm"
                     disabled={isApplying}
                     onClick={handleApply}
                   >
                     {isApplying ? "Submitting..." : "Apply Now"}
                   </button>
                   <p className="text-center text-secondary small mt-3 mb-0">Your profile details and resume will be sent to the recruiter.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
