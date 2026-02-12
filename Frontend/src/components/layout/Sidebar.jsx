import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  Building2,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  Eye,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ userRole, collapsed, onToggle }) => {
  const getNavigationItems = () => {
    switch (userRole) {
      case 'student':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: Briefcase, label: 'Job Board', path: '/student/jobs' },
          { icon: Building2, label: 'Placement Drives', path: '/student/drives' },
          { icon: FileText, label: 'My Applications', path: '/student/applications' },
          { icon: BarChart3, label: 'My Results', path: '/student/results' },
          { icon: Settings, label: 'Profile', path: '/student/profile' },
        ];
      
      case 'employer':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/employer/dashboard' },
          { icon: Briefcase, label: 'Manage Jobs', path: '/employer/jobs' },
          { icon: Users, label: 'Browse Students', path: '/employer/students' },
          { icon: Upload, label: 'Upload Results', path: '/employer/upload-results' },
          { icon: Eye, label: 'View Results', path: '/employer/preview-results' },
          { icon: Settings, label: 'Company Profile', path: '/employer/profile' },
        ];
      
      case 'faculty':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/faculty/dashboard' },
          { icon: Users, label: 'Students', path: '/faculty/students' },
          { icon: Building2, label: 'Drives', path: '/faculty/drives' },
          { icon: BarChart3, label: 'Reports', path: '/faculty/reports' },
          { icon: Settings, label: 'Settings', path: '/faculty/settings' },
        ];
      
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="sidebar-overlay d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3"
          onClick={onToggle}
          style={{ backdropFilter: 'blur(2px)' }}
        />
      )}
      
      <aside 
        className={`sidebar bg-white border-end border-light h-100 position-fixed top-0 start-0 z-4 transition-all d-flex flex-column ${collapsed ? 'sidebar--collapsed' : ''}`}
        style={{ 
          width: collapsed ? '80px' : '280px', 
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
        }}
      >
        <div className="sidebar__header p-4 d-flex align-items-center justify-content-center h-20 border-bottom border-light">
           {!collapsed ? (
             <div className="d-flex align-items-center gap-2">
               <div className="bg-primary rounded-3 text-white p-2 d-flex align-items-center justify-content-center" style={{width: 36, height: 36}}>
                 <Briefcase size={20} strokeWidth={3} />
               </div>
               <span className="fw-bold fs-5 text-dark tracking-tight">Portal</span>
             </div>
           ) : (
              <div className="bg-primary rounded-3 text-white p-2 d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                 <Briefcase size={24} strokeWidth={3} />
               </div>
           )}
        </div>

        <div className="sidebar__content flex-grow-1 overflow-y-auto custom-scrollbar p-3">
          <nav className="d-flex flex-column gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `d-flex align-items-center gap-3 px-3 py-3 rounded-4 text-decoration-none transition-all ${
                    isActive 
                      ? 'bg-primary-subtle text-primary fw-bold shadow-sm' 
                      : 'text-secondary hover-bg-light fw-medium'
                  }`
                }
                title={collapsed ? item.label : ''}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <div className={`${collapsed ? 'mx-auto' : ''}`}>
                  <item.icon size={22} className={collapsed ? "" : "flex-shrink-0"} />
                </div>
                {!collapsed && (
                  <span className="flex-grow-1">{item.label}</span>
                )}
                {!collapsed && (
                  <ChevronRight size={16} className="opacity-0 sidebar-chevron transition-opacity" />
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="sidebar__footer p-3 border-top border-light">
          <button 
            className="btn btn-light w-100 d-flex align-items-center justify-content-center py-2 text-secondary hover-text-primary"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>
      
      <style jsx>{`
        .hover-bg-light:hover { background-color: #f8fafc; color: #0f172a; }
        .sidebar-chevron { transition: opacity 0.2s; }
        .hover-bg-light:hover .sidebar-chevron { opacity: 0.5; }
        .bg-primary-subtle { background-color: #e0f2fe; }
        .text-primary { color: #0284c7; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </>
  );
};

export default Sidebar;
