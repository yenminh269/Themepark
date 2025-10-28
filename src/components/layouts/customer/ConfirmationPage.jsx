import React from "react";
import { useNavigate } from "react-router-dom";
import PageFooter from "./PageFooter";
import "./Homepage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="!min-h-screen !flex !flex-col !items-center !justify-center !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
      {/* Navbar is now global in App.jsx */}
      <div className="!bg-white/80 !rounded-xl !shadow-lg !p-10 !text-center !max-w-lg">
        <h1 className="!text-3xl !font-bold !text-[#176B87] !mb-4">Thank You!</h1>
        <p className="!text-slate-700 !mb-6">
          Your purchase has been confirmed. We can't wait to see you at the park!
        </p>
        <button
          onClick={() => navigate("/")}
          className="!px-6 !py-3 !bg-[#176B87] !text-white !font-bold !rounded-lg !shadow hover:!opacity-90 !transition !border-none"
        >
          Return to Home
        </button>
      </div>
      <PageFooter />
    </div>
  );
}
