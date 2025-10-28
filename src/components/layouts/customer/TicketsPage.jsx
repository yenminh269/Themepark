import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { useState, useEffect } from "react";

export default function TicketsPage() {
  const { user, signout } = useAuth();
  const { cart, addToCart, removeFromCart, total } = useCart();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rides from backend
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/rides');
        if (!response.ok) {
          throw new Error('Failed to fetch rides');
        }
        const result = await response.json();
        // Map backend data to match cart structure (id instead of ride_id)
        const ridesData = result.data.map(ride => ({
          id: ride.ride_id,
          name: ride.name,
          price: parseFloat(ride.price),
          description: ride.description,
          photo_path: ride.photo_path,
          status: ride.status
        }));
        setRides(ridesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching rides:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const getQuantity = (rideId) => {
    const item = cart.find((i) => i.id === rideId);
    return item ? item.quantity : 0;
  };

  const handleSignOut = () => {
    signout();
    navigate("/");
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
      {/* Navbar */}
      <nav className="!sticky !top-0 !z-50 !bg-[#EEF5FF] !border-b !border-[#B4D4FF] backdrop-blur-md">
        <div className="!mx-auto !max-w-6xl !px-6 !py-4 !flex !items-center !justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="!text-2xl !font-bold !tracking-wide !text-[#176B87] hover:!opacity-80 !transition !bg-transparent !border-none"
          >
            🎢 ThemePark
          </button>

          <div className="!flex !items-center !gap-3">
            {user && (
              <span className="!hidden sm:!inline !text-sm !text-slate-700">
                Signed in as <strong>{user.email}</strong>
              </span>
            )}
            <button
              onClick={() => navigate("/userinfo")}
              className="!px-4 !py-2 !rounded-lg !font-semibold !border !border-[#176B87] !text-[#176B87] hover:!bg-[#B4D4FF] !transition !bg-transparent"
            >
              User Info
            </button>
            <button
              onClick={handleSignOut}
              className="!px-4 !py-2 !rounded-lg !font-semibold !border !border-[#176B87] !text-[#176B87] hover:!bg-[#B4D4FF] !transition !bg-transparent"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Ticket Selection */}
      <main className="!flex-1 !max-w-6xl !mx-auto !p-6">
        <h1 className="!text-3xl !font-bold !text-[#176B87] !mb-6">
          Available Tickets
        </h1>

        {loading && (
          <div className="!text-center !py-10">
            <p className="!text-lg !text-[#176B87]">Loading tickets...</p>
          </div>
        )}

        {error && (
          <div className="!bg-red-100 !border !border-red-400 !text-red-700 !px-4 !py-3 !rounded !mb-6">
            <p>Error loading tickets: {error}</p>
          </div>
        )}

        {!loading && !error && rides.length === 0 && (
          <div className="!text-center !py-10">
            <p className="!text-lg !text-slate-600">No tickets available at the moment.</p>
          </div>
        )}

        {!loading && !error && rides.length > 0 && (
        <div className="!grid sm:!grid-cols-2 lg:!grid-cols-3 !gap-6">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="!bg-white/80 !rounded-xl !shadow !overflow-hidden !border !border-[#B4D4FF]"
            >
              {ride.photo_path && (
                <div className="!w-full !h-48 !overflow-hidden !bg-gray-100">
                  <img
                    src={ride.photo_path.startsWith('http')
                      ? ride.photo_path
                      : `http://localhost:3001${ride.photo_path}`}
                    alt={ride.name}
                    className="!w-full !h-full !object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="!w-full !h-full !flex !items-center !justify-center !text-gray-400">No Image</div>';
                    }}
                  />
                </div>
              )}
              <div className="!p-6">
                <h3 className="!text-xl !font-bold !text-[#176B87] !mb-2">
                  {ride.name}
                </h3>
                {ride.description && (
                  <p className="!text-sm !text-slate-600 !mb-2 !line-clamp-2">
                    {ride.description}
                  </p>
                )}
                <p className="!text-lg !font-semibold !text-slate-700 !mb-4">
                  ${ride.price.toFixed(2)}
                </p>
                <div className="!flex !gap-2 !items-center">
                  <button
                    onClick={() => removeFromCart(ride.id)}
                    className="!px-3 !py-2 !bg-white !border !border-[#176B87] !text-[#176B87] !rounded-lg hover:!bg-[#EEF5FF] !transition"
                  >
                    -
                  </button>
                  <span className="!px-3 !font-semibold !text-[#176B87]">
                    {getQuantity(ride.id)}
                  </span>
                  <button
                    onClick={() => addToCart(ride)}
                    className="!px-3 !py-2 !bg-[#176B87] !text-white !rounded-lg hover:!opacity-90 !transition !border-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Summary */}
        {!loading && !error && rides.length > 0 && (
        <div className="!mt-10 !bg-white/70 !p-6 !rounded-xl !shadow !flex !justify-between !items-center">
          <p className="!text-lg !font-semibold !text-[#176B87]">
            Total: ${total.toFixed(2)}
          </p>
          <button
            onClick={() => navigate("/checkout")}
            className="!px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none"
          >
            Continue to Payment
          </button>
        </div>
        )}
      </main>

      <PageFooter />
    </div>
  );
}
