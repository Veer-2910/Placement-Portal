import { Outlet } from "react-router-dom";
import StudentSidebar from "./Sidebar";

function StudentDashboard() {
  return (
    <div className="min-vh-100">
      {/* Fixed sidebar */}
      <StudentSidebar />

      {/* Main area shifted to the right of the fixed sidebar */}
      <main className="main-content p-3">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentDashboard;
