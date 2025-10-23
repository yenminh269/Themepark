import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Homepage.css";

export default function ConfirmationPage() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#EEF5FF] to-[#B4D4FF] text-slate-800">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 bg-[#EEF5FF] border-b border-[#B4D4FF] backdrop-blur-md py-4">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold tracking-wide text-[#176B87] hover:opacity-80 transition"
          >
            🎢 ThemePark
          </button>
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
        </div>
      </nav>

      <div className="bg-white/80 rounded-xl shadow-lg p-10 text-center max-w-lg">
        <h1 className="text-3xl font-bold text-[#176B87] mb-4">Thank You!</h1>
        <p className="text-slate-700 mb-6">
          Your purchase has been confirmed. We can’t wait to see you at the park!
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-[#176B87] text-white font-bold rounded-lg shadow hover:opacity-90 transition"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
