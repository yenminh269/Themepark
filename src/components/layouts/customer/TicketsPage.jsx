import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { useState, useEffect } from "react";
import { api, getImageUrl } from "../../../services/api";
import Loading from "../admin/loading/Loading";

export default function TicketsPage() {
  const { cart, addToCart, removeFromCart, total, RIDE_LIMIT } = useCart();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rides from backend
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const result = await api.getAllRides();
        const ridesData = result.map(ride => ({
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
    const item = cart.find((i) => i.id === rideId && i.type === 'ride');
    return item ? item.quantity : 0;
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-[#EEF5FF] !text-slate-800">
      {/* Navbar is now global in App.jsx */}

      {/* Ticket Selection */}
      <main className="!flex-1 !max-w-6xl !mx-auto !p-6">
        <h1 className="!text-3xl !font-bold !text-[#176B87] !mb-6">
          Available Tickets
        </h1>

        {loading && (
          <div className="!text-center !py-10">
            <Loading />
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
              className="!bg-white !rounded-2xl !shadow-lg hover:!shadow-2xl !overflow-hidden !border !border-[#B4D4FF] !transition-all hover:!scale-[1.02] !group"
            >
              <div className="!relative !w-full !h-56 !overflow-hidden !bg-[#749BC2]">
                <img
                  src={getImageUrl(ride.photo_path, ride.name)}
                  alt={ride.name}
                  className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                />
                {/* Overlay for better text contrast */}
                <div className="!absolute !inset-0 !bg-[#176B87]/20 !pointer-events-none"></div>

                {/* Status Badge */}
                <div className="!absolute !top-3 !right-3 !px-3 !py-1 !bg-white/95 backdrop-blur-sm !rounded-full !text-xs !font-bold !shadow-lg">
                  {ride.status === 'open' ? (
                    <span className="!text-green-600">✅ Open</span>
                  ) : ride.status === 'maintenance' ? (
                    <span className="!text-orange-600">🔧 Maintenance</span>
                  ) : (
                    <span className="!text-red-600">🔒 Closed</span>
                  )}
                </div>
              </div>

              <div className="!p-6">
                <div className="!flex !items-start !justify-between !mb-3">
                  <h3 className="!text-xl !font-bold !text-[#176B87] !leading-tight">
                    {ride.name}
                  </h3>
                  <span className="!text-2xl !font-black !text-[#176B87] !ml-2">
                    ${ride.price.toFixed(2)}
                  </span>
                </div>

                {ride.description && (
                  <p className="!text-sm !text-gray-600 !mb-4 !leading-relaxed">
                    {ride.description}
                  </p>
                )}
                {ride.status === 'open' ? (
                  <div>
                    <div className="!flex !gap-2 !items-center !mb-2">
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
                        onClick={() => addToCart({
                          ...ride,
                          type: 'ride',
                          image_url: getImageUrl(ride.photo_path, ride.name)
                        })}
                        disabled={getQuantity(ride.id) >= RIDE_LIMIT}
                        className="!px-3 !py-2 !bg-[#176B87] !text-white !rounded-lg hover:!opacity-90 !transition !border-none disabled:!opacity-50 disabled:!cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <p className="!text-sm !text-gray-600 !text-center">
                      Limit: {RIDE_LIMIT} per order
                      {getQuantity(ride.id) >= RIDE_LIMIT && (
                        <span className="!text-orange-600 !font-semibold !ml-1">
                          (Limit reached)
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="!text-center !py-2">
                    <p className="!text-sm !font-semibold !text-gray-500">
                      {ride.status === 'maintenance'
                        ? 'Currently under maintenance'
                        : 'Ride is closed because of rain out'}
                    </p>
                  </div>
                )}
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
