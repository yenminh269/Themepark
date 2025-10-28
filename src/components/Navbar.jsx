import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./layouts/customer/AuthContext";
import { useCart } from "./layouts/customer/CartContext";

export default function Navbar() {
  const { user, signout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetTickets = () => {
    if (user) navigate("/tickets");
    else navigate("/login");
  };

  const handleSignOut = () => {
    signout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="!sticky !top-0 !z-50 !bg-white/90 backdrop-blur-lg !border-b !border-[#B4D4FF]/30 !shadow-sm">
      <div className="!mx-auto !max-w-7xl !px-6 !py-4">
        <div className="!flex !items-center !justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              navigate("/");
              setMobileMenuOpen(false);
            }}
            className="!flex !items-center !gap-2 !text-2xl !font-bold !text-[#176B87] hover:!scale-105 !transition-transform !bg-transparent !border-none"
          >
            <span className="!text-3xl">🎢</span>
            <span className="!bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !bg-clip-text !text-transparent">
              VelocityValley
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="!hidden md:!flex !items-center !gap-6">
            <button
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="!text-gray-700 hover:!text-[#176B87] !font-medium !transition !bg-transparent !border-none"
            >
              Home
            </button>
            <button
            onClick={handleGetTickets}
            className="!text-gray-700 hover:!text-[#176B87] !font-medium !transition !bg-transparent !border-none"
            >
            🎟️ Get Tickets
            </button>
            <button
              onClick={() => {
                navigate("/stores");
                setMobileMenuOpen(false);
              }}
              className="!text-gray-700 hover:!text-[#176B87] !font-medium !transition !bg-transparent !border-none"
            >
              🛍️ Shop
            </button>
            {user && (
              <button
                onClick={() => {
                  navigate("/userinfo");
                  setMobileMenuOpen(false);
                }}
                className="!text-gray-700 hover:!text-[#176B87] !font-medium !transition !bg-transparent !border-none"
              >
                My Account
              </button>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="!hidden md:!flex !items-center !gap-3">
            {user ? (
              <>
                {cart.length > 0 && (
                  <button
                    onClick={() => navigate("/tickets")}
                    className="!relative !p-2 !text-[#176B87] hover:!bg-[#EEF5FF] !rounded-full !transition !bg-transparent !border-none"
                  >
                    <span className="!text-2xl">🛒</span>
                    <span className="!absolute -!top-1 -!right-1 !bg-red-500 !text-white !text-xs !w-5 !h-5 !rounded-full !flex !items-center !justify-center !font-bold">
                      {cart.length}
                    </span>
                  </button>
                )}
                <span className="!text-sm !text-gray-600">
                  Hi, <strong>{user.first_name || user.email?.split('@')[0]}</strong>
                </span>
                <button
                  onClick={handleSignOut}
                  className="!px-4 !py-2 !rounded-lg !font-semibold !bg-[#176B87] !text-white hover:!shadow-lg hover:!scale-105 !transition !border-none"
                >
                  Sign Out
                </button>

              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="!px-4 !py-2 !rounded-lg !font-semibold !border-2 !border-[#176B87] !text-[#176B87] hover:!bg-[#176B87] hover:!text-white !transition !no-underline"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="!px-4 !py-2 !rounded-lg !font-semibold !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white hover:!shadow-lg hover:!scale-105 !transition !no-underline"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:!hidden !p-2 !text-[#176B87] !bg-transparent !border-none"
          >
            <svg className="!w-6 !h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:!hidden !mt-4 !pb-4 !space-y-2 !border-t !border-gray-200 !pt-4">
            <button
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="!block !w-full !text-left !px-4 !py-2 !text-gray-700 hover:!bg-[#EEF5FF] !rounded-lg !bg-transparent !border-none"
            >
              Home
            </button>
            <button
            onClick={() => {
            handleGetTickets();
            setMobileMenuOpen(false);
            }}
            className="!block !w-full !text-left !px-4 !py-2 !text-gray-700 hover:!bg-[#EEF5FF] !rounded-lg !bg-transparent !border-none"
            >
            🎟️ Get Tickets
            </button>
            <button
              onClick={() => {
                navigate("/stores");
                setMobileMenuOpen(false);
              }}
              className="!block !w-full !text-left !px-4 !py-2 !text-gray-700 hover:!bg-[#EEF5FF] !rounded-lg !bg-transparent !border-none"
            >
              🛍️ Shop
            </button>
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/userinfo");
                    setMobileMenuOpen(false);
                  }}
                  className="!block !w-full !text-left !px-4 !py-2 !text-gray-700 hover:!bg-[#EEF5FF] !rounded-lg !bg-transparent !border-none"
                >
                  My Account
                </button>
                <button
                  onClick={handleSignOut}
                  className="!block !w-full !text-left !px-4 !py-2 !text-red-600 hover:!bg-red-50 !rounded-lg !bg-transparent !border-none"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="!block !px-4 !py-2 !text-[#176B87] hover:!bg-[#EEF5FF] !rounded-lg !no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="!block !px-4 !py-2 !text-[#176B87] hover:!bg-[#EEF5FF] !rounded-lg !no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
