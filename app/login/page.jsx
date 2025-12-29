"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import AdminSidebar from "../../app/components/sidebar/AdminSidebar";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  const DEMO_EMAIL = "Superadmin@test.com";
  const DEMO_PASSWORD = "123456";

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem("isLoggedIn", "true");

      // ✅ Show welcome toggle
      setShowWelcome(true);

      // ⏳ Redirect after animation
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1800);
    } else {
      setError("Invalid email or password");
    }
  };

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);

    localStorage.setItem("isLoggedIn", "true");
    setShowWelcome(true);

    setTimeout(() => {
      router.push("/admin/dashboard"); // <-- yahan "/" ki jagah "/admin/dashboard"
    }, 1800);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("isLoggedIn")) {
      router.push("/login");
    }
  }, []);

  return (
    <>
      {/* 🌟 WELCOME TOGGLE / OVERLAY */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-900/90">
          <div className="text-center text-white animate-welcome">
            <h1 className="text-4xl font-bold mb-4">Welcome to</h1>
            <h2 className="text-5xl font-extrabold text-green-300">
              Digital Gram Panchayat
            </h2>
            <p className="mt-4 text-green-100">
              Empowering villages through technology
            </p>
          </div>
        </div>
      )}

      {/* 🔹 MAIN LOGIN PAGE */}
      <div className="min-h-screen flex">
        {/* LEFT – LOGIN */}
        <div className="w-full md:w-2/5 flex items-center justify-center bg-white px-8">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Gram Panchayat Login
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Digital Village Management System
            </p>

            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-gray-800 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border px-3 py-2 rounded-md text-black focus:ring-2 focus:ring-green-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-800 font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded-md text-black focus:ring-2 focus:ring-green-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-700 text-white py-2.5 rounded-md font-semibold hover:bg-green-800 transition"
              >
                Login
              </button>
            </form>

            {/* Demo Login */}
            <div className="mt-5 text-sm text-gray-600">
              <p className="mb-1">Demo Login:</p>

              <div
                onClick={handleDemoLogin}
                className="cursor-pointer bg-gray-100 border border-dashed border-gray-400 px-3 py-2 rounded hover:bg-gray-200"
              >
                <p>
                  <b>Email:</b> {DEMO_EMAIL}
                </p>
                <p>
                  <b>Password:</b> {DEMO_PASSWORD}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (Click here to login instantly)
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              {" "}
              © {new Date().getFullYear()} Digital Gram Panchayat{" "}
            </p>
          </div>
        </div>

        {/* RIGHT – DECORATION */}
        <div className="hidden md:flex w-3/5 relative bg-green-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/village-bg.jpg')" }}
          ></div>
          <div className="absolute inset-0 bg-green-900/70"></div>
          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <h2 className="text-3xl font-bold mb-4">Digital Gram Panchayat</h2>
            <p className="text-lg text-green-100">
              Transparent governance and digital village services.
            </p>
          </div>
        </div>
      </div>

      {/* ✨ CUSTOM ANIMATION */}
      <style jsx global>{`
        @keyframes welcome {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-welcome {
          animation: welcome 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
