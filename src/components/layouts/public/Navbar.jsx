import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../customer/AuthContext";
import { useCart } from "../customer/CartContext";
import { getImageUrl } from "../../../services/api";

export default function Navbar() {
  const { user, signout } = useAuth();
  const { cart, removeFromCart, addToCart, total } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const cartDropdownRef = useRef(null);

  const handleGetTickets = () => {
    if (user) navigate("/tickets");
    else navigate("/login");
  };

  const handleSignOut = () => {
    signout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  // Close cart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setCartDropdownOpen(false);
      }
    };

    if (cartDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cartDropdownOpen]);

  return (
    <nav className="!bg-[#4682A9]">
      <div className="!mx-auto !max-w-7xl !px-6 !py-4">
        <div className="!flex !items-center !justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              navigate("/");
              setMobileMenuOpen(false);
            }}
            className="!flex !items-center !gap-2 !text-2xl !font-bold !text-[#91C8E4] hover:!scale-105 !transition-transform !bg-transparent !border-none"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/14023/14023195.png"
              alt="Velocity icon"
              className="!h-[1em] !w-[1em] object-contain inline-block"
            />
            <span className="pt-2 !bg-clip-text !text-[#91C8E4]">
              Velocity Valley
            </span>
          </button>

          {/* Centered Navigation Container with hover effect */}
          <div className="!hidden lg:!flex !absolute !left-1/2 !-translate-x-1/2 !transition-all hover:!scale-105 !border-[3px] !border-[rgba(30,30,30,0.60)] !rounded-xl !p-1 !bg-white">
            <div className="!flex !items-center !gap-4 !overflow-x-auto !whitespace-nowrap ">
              <button
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="!py-2 !px-4 !text-[#4682A9] !cursor-pointer !flex !justify-center !font-bold hover:!bg-[#91C8E4] !transition-[background] !duration-300 !ease-in-out !rounded-[20px] !bg-transparent !border-none !shrink-0"
              >🎡 Home
              </button>
              <button
                onClick={handleGetTickets}
                className="!py-2 !px-4 !text-[#4682A9] !cursor-pointer !flex !justify-center !font-bold hover:!bg-[#91C8E4] !transition-[background] !duration-300 !ease-in-out !rounded-[20px] !bg-transparent !border-none !shrink-0"
              >🎟️ Get Tickets
              </button>
              <button
                onClick={() => {
                  navigate("/stores");
                  setMobileMenuOpen(false);
                }}
                className="!py-2 !px-4 !text-[#4682A9] !cursor-pointer !flex !justify-center !font-bold hover:!bg-[#91C8E4] !transition-[background] !duration-300 !ease-in-out !rounded-[20px] !bg-transparent !border-none !shrink-0"
              >🎁 Shop
              </button>
              {user && (
                <button
                  onClick={() => {
                    navigate("/userinfo");
                    setMobileMenuOpen(false);
                  }}
                  className="!py-2 !px-4 !text-[#4682A9] !cursor-pointer !flex !justify-center !font-bold hover:!bg-[#91C8E4] !transition-[background] !duration-300 !ease-in-out !rounded-[20px] !bg-transparent !border-none !shrink-0"
                > My Account
                </button>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="!hidden lg:!flex !items-center !gap-3">
            {user ? (
              <>
                {cart.length > 0 && (
                  <div className="!relative" ref={cartDropdownRef}>
                    <button
                      onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                      className="!relative !p-2 !text-[#176B87] hover:!bg-[#EEF5FF] !rounded-full !transition !bg-transparent !border-none"
                    >
                      <span className="!text-2xl">🛒</span>
                      <span className="!absolute -!top-1 -!right-1 !bg-red-500 !text-white !text-xs !w-5 !h-5 !rounded-full !flex !items-center !justify-center !font-bold">
                        {cart.length}
                      </span>
                    </button>

                    {/* Cart Dropdown */}
                    {cartDropdownOpen && (
                      <div className="!absolute !right-0 !mt-2 !w-96 !bg-white !rounded-xl !shadow-2xl !border !border-[#B4D4FF] !z-50 !max-h-[500px] !overflow-hidden !flex !flex-col">
                        <div className="!p-4 !border-b !border-[#B4D4FF] !bg-gradient-to-r !from-[#EEF5FF] !to-[#B4D4FF]/20">
                          <h3 className="!text-lg !font-bold !text-[#176B87]">Your Cart</h3>
                          <p className="!text-xs !text-gray-600">{cart.length} ride{cart.length !== 1 ? 's' : ''} selected</p>
                        </div>

                        <div className="!overflow-y-auto !max-h-[300px] !p-2">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="!flex !gap-3 !p-3 !mb-2 !bg-[#EEF5FF]/50 hover:!bg-[#EEF5FF] !rounded-lg !transition"
                            >
                              <img
                                src={getImageUrl(item.photo_path, item.name)}
                                alt={item.name}
                                className="!w-16 !h-16 !object-cover !rounded-lg !border !border-[#B4D4FF]"
                              />
                              <div className="!flex-1">
                                <h4 className="!font-semibold !text-[#176B87] !text-sm">{item.name}</h4>
                                <p className="!text-xs !text-gray-600">${item.price.toFixed(2)} each</p>
                                <div className="!flex !gap-2 !items-center !mt-1">
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="!px-2 !py-1 !bg-white !border !border-[#176B87] !text-[#176B87] !rounded !text-xs hover:!bg-[#176B87] hover:!text-white !transition"
                                  >
                                    -
                                  </button>
                                  <span className="!text-xs !font-semibold !text-[#176B87]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="!px-2 !py-1 !bg-[#176B87] !text-white !rounded !text-xs hover:!opacity-90 !transition !border-none"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                              <div className="!text-right">
                                <p className="!font-bold !text-[#176B87] !text-sm">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="!p-4 !border-t !border-[#B4D4FF] !bg-gradient-to-r !from-[#EEF5FF] !to-[#B4D4FF]/20">
                          <div className="!flex !justify-between !items-center !mb-3">
                            <span className="!font-bold !text-[#176B87]">Total:</span>
                            <span className="!font-bold !text-[#176B87] !text-xl">${total.toFixed(2)}</span>
                          </div>
                          <button
                            onClick={() => {
                              navigate("/checkout");
                              setCartDropdownOpen(false);
                            }}
                            className="!w-full !px-4 !py-2 !bg-[#176B87] !text-white !rounded-lg !font-semibold hover:!opacity-90 !transition !border-none"
                          > View Full Cart & Checkout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <span className="!text-lg !text-white mt-3">
                  Hi, <strong>{user.first_name || user.email?.split('@')[0]}</strong>
                </span>
                <button
                  onClick={handleSignOut}
                  className="!text-sm !py-3 !px-4 !rounded-[30px] !bg-[#4682A9] !font-bold !text-white !border-2 !border-white hover:!opacity-90 !transition"
                >Sign Out
                </button>

              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="!text-sm !py-3 !px-4 !rounded-[30px] !bg-[#4682A9] !font-bold !text-white !border-2 !border-white hover:!opacity-90 !transition !no-underline"
                > Log In
                </Link>
                <Link
                  to="/signup"
                  className="!text-sm !py-3 !px-4 !rounded-[30px] !bg-[#4682A9] !font-bold !text-white !border-2 !border-white hover:!opacity-90 !transition !no-underline"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:!hidden !p-2 !text-[#91C8E4] hover:!bg-[#91C8E4] hover:!text-[#176B87] !rounded-lg !bg-transparent !border-none"
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
          <div className="lg:!hidden flex  !mt-4 !pb-4 !space-y-2 !border-t !border-gray-200 !pt-4">
            <button
              onClick={() => {
                navigate("/");
                setMobileMenuOpen(false);
              }}
              className="!block !w-full  !px-4 !py-2 !text-gray-700 hover:!bg-[#91C8E4] !rounded-lg !bg-transparent !border-none"
            > 🎡 Home 
            </button>
            <button
            onClick={() => {
            handleGetTickets();
            setMobileMenuOpen(false);
            }}
            className="!block !w-full  !px-4 !py-2 !text-gray-700 hover:!bg-[#91C8E4] !rounded-lg !bg-transparent !border-none"
            >🎟️ Get Tickets
            </button>
            <button
              onClick={() => {
                navigate("/stores");
                setMobileMenuOpen(false);
              }}
              className="!block !w-full !px-4 !py-2 !text-gray-700 hover:!bg-[#91C8E4] !rounded-lg !bg-transparent !border-none"
            >🎁 Shop
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
                 className="!text-sm !mb-0 !py-3 !px-4 !rounded-[20px] !bg-[#4682A9] !font-bold !text-white !border-2 !border-white hover:!opacity-90 !transition !no-underline"
               onClick={() => setMobileMenuOpen(false)}
                >Log In
                </Link>
                <Link
                  to="/signup"
                  className="!text-sm !py-3  !px-4 !rounded-[20px] !bg-[#4682A9] !font-bold !text-white !border-2 !border-white hover:!opacity-90 !transition !no-underline"
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
