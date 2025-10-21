import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    signin(email, password);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#EEF5FF] to-[#B4D4FF] text-slate-800">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-2xl font-extrabold text-[#176B87] hover:opacity-80 transition"
      >
        🎢 ThemePark
      </button>

      <div className="bg-white/80 rounded-xl shadow-lg p-10 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-[#176B87]">Login / Sign Up</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-[#B4D4FF] rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-[#B4D4FF] rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full px-6 py-3 bg-[#176B87] text-white font-bold rounded-lg shadow hover:opacity-90 transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
