import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;