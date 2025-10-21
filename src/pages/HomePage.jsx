import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleGetTickets = () => {
    if (user) navigate("/tickets");
    else navigate("/login");
  };

  const handleSignOut = () => {
    signout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#EEF5FF] to-[#B4D4FF] text-slate-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#EEF5FF] border-b border-[#B4D4FF] backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold tracking-wide text-[#176B87] hover:opacity-80 transition"
          >
            🎢 ThemePark
          </button>

          {/* Right side */}
          {!user ? (
            <div className="space-x-3">
              <Link
                to="/login"
                className="inline-block px-4 py-2 rounded-lg font-semibold bg-white text-[#176B87] border border-[#176B87] hover:bg-[#EEF5FF] transition"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="inline-block px-4 py-2 rounded-lg font-semibold bg-white text-[#176B87] border border-[#176B87] hover:bg-[#EEF5FF] transition"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-slate-700">
                Signed in as <strong>{user.email}</strong>
              </span>
              <button
                onClick={() => navigate("/userinfo")}
                className="px-4 py-2 rounded-lg font-semibold border border-[#176B87] text-[#176B87] hover:bg-[#B4D4FF] transition"
              >
                User Info
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg font-semibold border border-[#176B87] text-[#176B87] hover:bg-[#B4D4FF] transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="flex-1 flex items-center justify-center text-center px-6">
        <div className="max-w-3xl p-10 bg-white/60 rounded-2xl backdrop-blur-md shadow-lg">
          <h2 className="text-5xl font-extrabold mb-4 text-[#176B87]">
            Welcome to our Theme Park
          </h2>
          <p className="text-lg mb-8 text-slate-700">
            Family fun, thrilling rides, and unforgettable memories, come check us out!
          </p>
          <button
            onClick={handleGetTickets}
            className="px-6 py-3 bg-[#176B87] text-white font-bold rounded-lg shadow-md hover:opacity-90 transition"
          >
            Get Tickets
          </button>
        </div>
      </header>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-slate-600 bg-[#EEF5FF]">
        © {new Date().getFullYear()} ThemePark • 3380 Project
      </footer>
    </div>
  );
}
  