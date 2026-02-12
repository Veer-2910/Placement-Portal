import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ user, userRole, onToggleSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (userRole === 'student') sessionStorage.removeItem('token');
    else if (userRole === 'employer') sessionStorage.removeItem('employerToken');
    else if (userRole === 'faculty') sessionStorage.removeItem('facultyToken');
    navigate('/');
  };

  const getRoleName = () => {
    return userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User';
  };

  return (
    <nav className="navbar position-sticky top-0 z-3 px-4 py-3 border-bottom border-white" 
         style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)"
         }}>
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-light border-0 rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center"
          onClick={onToggleSidebar}
          style={{ width: 40, height: 40 }}
        >
          <Menu size={20} className="text-secondary" />
        </button>
        
        <div className="d-flex flex-column">
          <h1 className="h5 fw-bold text-dark mb-0 tracking-tight">Placement Portal</h1>
          <span className="small text-secondary fw-medium">{getRoleName()} Dashboard</span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 ms-auto">
        <button className="btn btn-light border-0 rounded-circle position-relative shadow-sm p-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
          <Bell size={20} className="text-secondary" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white p-1" style={{width: 10, height: 10}}>
            <span className="visually-hidden">unread messages</span>
          </span>
        </button>

        <div className="d-flex align-items-center gap-3 ps-3 border-start border-2">
          <div className="d-flex align-items-center gap-2 bg-white rounded-pill pe-3 p-1 border shadow-sm cursor-pointer hover-shadow transition-all">
            <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0) || <User size={18} />}
            </div>
            <div className="d-none d-md-block">
              <span className="d-block small fw-bold text-dark lh-1">{user?.name?.split(' ')[0] || 'User'}</span>
              <span className="d-block text-secondary lh-1" style={{fontSize: '10px'}}>{getRoleName()}</span>
            </div>
            <ChevronDown size={14} className="text-secondary ms-1" />
          </div>

          <button 
            className="btn btn-light border-0 rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center hover-bg-danger-subtle hover-text-danger transition-colors"
            onClick={handleLogout}
            title="Logout"
            style={{ width: 40, height: 40 }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important; }
        .hover-bg-danger-subtle:hover { background-color: #fee2e2 !important; color: #ef4444 !important; }
        .transition-all { transition: all 0.2s ease; }
      `}</style>
    </nav>
  );
};

export default Navbar;
