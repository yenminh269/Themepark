import React from "react";
import { useNavigate } from "react-router-dom";
import PageFooter from "./PageFooter";
import "./Homepage.css";

export default function ConfirmationPage() {
  const navigate = useNavigate();

  return (
    <div className="!min-h-screen !flex !flex-col !items-center !justify-center !bg-[#EEF5FF] !text-slate-800">
      {/* Navbar is now global in App.jsx */}
      <div className="!bg-[#FFFCED] !rounded-xl !shadow-lg !p-10 !text-center !max-w-lg">
        <h1 className="!text-3xl !font-bold !text-[#176B87] !mb-4">Thank You!</h1>
        <p className="!text-slate-700 !mb-3">
          Your purchase has been confirmed. 
        </p>
        <p className="!text-slate-700 mb-0 pb-0">
          The recipe has been sent to your email💌
        </p>
         <p className="!text-slate-700 !mb-3">Please check your spam folder if you do not see it.</p>
        <p className="!text-slate-700 !mb-3">
          Can't wait to see you at the park!
          If you have any questions, please contact us.
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
