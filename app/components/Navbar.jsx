"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-green-700 text-white px-6 py-3 flex items-center justify-between shadow">
      
      {/* Left: Logo / Project Name */}
      <div className="text-lg font-semibold">
        <Link href="/">
          Village Panchayat
        </Link>
      </div>

      {/* Right: Menu */}
      <ul className="flex gap-6 items-center text-sm">
        <li>
          <Link href="/dashboard" className="hover:text-gray-200">
            Dashboard
          </Link>
        </li>

        <li>
          <Link href="/complaints" className="hover:text-gray-200">
            Complaints
          </Link>
        </li>

        <li>
          {/* ✅ Logout page par redirect */}
          <Link
            href="/logout"
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </Link>
        </li>
      </ul>
    </nav>
  );
}
