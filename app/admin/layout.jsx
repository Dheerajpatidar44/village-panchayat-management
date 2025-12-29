import Navbar from "@/app/components/Navbar";
import AdminSidebar from "@/app/components/sidebar/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Page Content */}
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
