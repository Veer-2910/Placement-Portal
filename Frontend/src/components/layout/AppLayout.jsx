import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './AppLayout.css';

const AppLayout = ({ children, user, userRole }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-layout">
      <Navbar 
        user={user} 
        userRole={userRole}
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="app-layout__body">
        <Sidebar 
          userRole={userRole}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        
        <main className={`app-layout__content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
