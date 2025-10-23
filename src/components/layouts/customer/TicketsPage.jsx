import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";

export default function TicketsPage() {
  const { user, signout } = useAuth();
  const { cart, addToCart, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  const rides = [
    { id: 1, name: "Ride 1", price: 15 },
    { id: 2, name: "Ride 2", price: 10 },
    { id: 3, name: "Ride 3", price: 12 },
    { id: 4, name: "Ride 4", price: 8 },
    { id: 5, name: "Ride 5", price: 9 },
    { id: 6, name: "Ride 6", price: 11 },
  ];

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

        <div className="!grid sm:!grid-cols-2 lg:!grid-cols-3 !gap-6">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="!bg-white/80 !rounded-xl !shadow !p-6 !border !border-[#B4D4FF]"
            >
              <h3 className="!text-xl !font-bold !text-[#176B87] !mb-2">
                {ride.name}
              </h3>
              <p className="!text-slate-700 !mb-4">${ride.price}</p>
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
          ))}
        </div>

        {/* Summary */}
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
      </main>

      <PageFooter />
    </div>
  );
}
