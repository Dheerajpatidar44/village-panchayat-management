"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItem = (href, label) => (
    <Link
      href={href}
      className={`block px-4 py-2 rounded text-sm font-medium
        ${
          pathname === href
            ? "bg-green-700 text-white"
            : "text-gray-700 hover:bg-green-100 hover:text-green-800"
        }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-sm">
      
      {/* 🔰 LOGO / TITLE */}
      <div className="px-4 py-5 border-b">
        <h2 className="text-xl font-bold text-green-800">
          Gram Panchayat
        </h2>
        <p className="text-xs text-gray-500">
          Super Admin Panel
        </p>
      </div>

      {/* 📊 DASHBOARD */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Dashboard
        </p>
        {menuItem("/admin/dashboard", "Overview")}
      </div>

      {/* 👥 USER MANAGEMENT */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          User Management
        </p>
        {menuItem("/admin/employees", "Employees")}
        {menuItem("/admin/add-employee", "Add Employee")}
      </div>

      {/* 📝 COMPLAINT MANAGEMENT */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Complaint Management
        </p>
        {menuItem("/admin/complaints", "Complaint List")}
      </div>

      {/* 🏗️ PROJECT MANAGEMENT */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Project Management
        </p>
        {menuItem("/admin/projects", "Project List")}
        {menuItem("/admin/add-project", "Add Project")}
      </div>

      {/* 💰 FINANCIAL MANAGEMENT */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Financial Management
        </p>
        {menuItem("/admin/income", "Income Details")}
        {menuItem("/admin/expenses", "Expense Details")}
      </div>

      {/* 📢 NOTICE / ANNOUNCEMENT */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Notices
        </p>
        {menuItem("/admin/notices", "Publish Notice")}
      </div>
    </aside>
  );
}
