import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PageFooter from "./PageFooter";
import RideGalleryWrapper from "./RideGalleryWrapper";
import "./Homepage.css";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetTickets = () => {
    if (user) navigate("/tickets");
    else navigate("/login");
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !via-[#B4D4FF] !to-[#86B6F6] !text-slate-800">
      {/* Navbar is now global in App.jsx - removed local navbar */}

      {/* Hero Section with Background */}
      <main className="!flex-1 !relative !overflow-hidden">
        {/* Background Pattern */}
        <div className="!absolute !inset-0 !opacity-10">
          <div className="!absolute !top-10 !left-10 !w-72 !h-72 !bg-[#176B87] !rounded-full !blur-3xl"></div>
          <div className="!absolute !bottom-10 !right-10 !w-96 !h-96 !bg-[#86B6F6] !rounded-full !blur-3xl"></div>
        </div>

        <div className="!relative !flex !items-center !justify-center !px-6 !py-10">
          <div className="!max-w-6xl !w-full">
            <div className="!text-center !mb-8">
              <div className="!inline-block !px-4 !py-2 !bg-white/80 !rounded-full !text-sm !font-semibold !text-[#176B87] !mb-6 !shadow-md">
                🎉 Welcome to the Most Exciting Theme Park!
              </div>
              <h1 className="!text-6xl md:!text-7xl !font-black !mb-6 !leading-tight">
                <span className="!text-[#4682A9]">Adventure Awaits
                </span>
                <br />
                <span className="!text-[#4682A9]">at</span>
                <span className="!text-#176B87] italic"> Velocity Valley</span>
              </h1>
              <p className="!text-xl !text-gray-700 !mb-8 !max-w-2xl !mx-auto">
                Experience the thrill of a lifetime with world-class rides, family fun,
                and unforgettable memories. Your adventure starts here! 🎡
              </p>
              <div className="!flex !flex-wrap !gap-4 !justify-center">
                <button
                  onClick={handleGetTickets}
                  className="!px-8 !py-4 !rounded-xl !text-lg !font-bold !bg-gradient-to-r !from-[#176B87] !to-[#86B6F6] !text-white hover:!shadow-2xl hover:!scale-105 !transition-all !border-none !shadow-lg"
                >
                  🎢 Get Your Tickets Now
                </button>
              </div>
            </div>

            {/* Ride Gallery */}
            <div className="!mb-16 !bg-white/80 backdrop-blur-sm !rounded-2xl !p-8 !shadow-xl">
              <h2 className="!text-3xl !font-bold !text-center !text-[#176B87] !mb-6">
                🎢 Our Amazing Rides
              </h2>
              <RideGalleryWrapper />
            </div>

            {/* Image Gallery Preview */}
            <div className="!mb-16">
              <h2 className="!text-3xl !font-bold !text-center !text-[#176B87] !mb-8">
                📸 Experience the Thrills
              </h2>
              <div className="!grid md:!grid-cols-3 !gap-6">
                <div className="!relative !h-64 !rounded-2xl !overflow-hidden !shadow-2xl !group">
                  <img
                    src="https://orlandoinformer.com/wp-content/uploads/2023/05/Pipeline-Hero-Image-scaled.jpg"
                    alt="Roller Coaster"
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/60 !to-transparent !flex !items-end !p-6">
                    <div>
                      <h3 className="!text-white !text-xl !font-bold !mb-1">Thrilling Coasters</h3>
                      <p className="!text-white/90 !text-sm">Feel the adrenaline rush!</p>
                    </div>
                  </div>
                </div>
                <div className="!relative !h-64 !rounded-2xl !overflow-hidden !shadow-2xl !group">
                  <img
                    src="https://www.usnews.com/object/image/0000014e-b11b-d9dd-a9ee-f59b84d60000/150721-themepark-stock.jpg?update-time=1437490513030&size=responsive640"
                    alt="Family Fun"
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/60 !to-transparent !flex !items-end !p-6">
                    <div>
                      <h3 className="!text-white !text-xl !font-bold !mb-1">Family Adventures</h3>
                      <p className="!text-white/90 !text-sm">Fun for all ages!</p>
                    </div>
                  </div>
                </div>
                <div className="!relative !h-64 !rounded-2xl !overflow-hidden !shadow-2xl !group">
                  <img
                    src="https://www.splashzonewaterpark.com/content/uploads/2016/04/Hurricane-Island.png"
                    alt="Water Rides"
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  <div className="!absolute !inset-0 !bg-gradient-to-t !from-black/60 !to-transparent !flex !items-end !p-6">
                    <div>
                      <h3 className="!text-white !text-xl !font-bold !mb-1">Splash Zone</h3>
                      <p className="!text-white/90 !text-sm">Cool off in style!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Feature Cards */}
          <div className="!grid md:!grid-cols-3 !gap-8 !mt-16">
            <div className="!bg-white/90 backdrop-blur-sm !rounded-2xl !p-8 !shadow-xl hover:!shadow-2xl hover:!scale-105 !transition-all !border !border-white">
              <div className="!text-5xl !mb-4">🎢</div>
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-3">Thrilling Rides</h3>
              <p className="!text-gray-600">
                Experience adrenaline-pumping roller coasters and exciting attractions for all ages.
              </p>
            </div>

            <div className="!bg-white/90 backdrop-blur-sm !rounded-2xl !p-8 !shadow-xl hover:!shadow-2xl hover:!scale-105 !transition-all !border !border-white">
              <div className="!text-5xl !mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-3">Family Fun</h3>
              <p className="!text-gray-600">
                Create magical memories with attractions perfect for the whole family.
              </p>
            </div>

            <div className="!bg-white/90 backdrop-blur-sm !rounded-2xl !p-8 !shadow-xl hover:!shadow-2xl hover:!scale-105 !transition-all !border !border-white">
              <div className="!text-5xl !mb-4">🎟️</div>
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-3">Easy Booking</h3>
              <p className="!text-gray-600">
                Skip the lines! Book your tickets online and enjoy hassle-free entry.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="!grid md:!grid-cols-4 !gap-6 !mt-16 !bg-white/80 backdrop-blur-sm !rounded-2xl !p-8 !shadow-xl">
            <div className="!text-center">
              <div className="!text-4xl !font-black !text-[#176B87] !mb-2">50+</div>
              <div className="!text-gray-600 !font-medium">Attractions</div>
            </div>
            <div className="!text-center">
              <div className="!text-4xl !font-black !text-[#176B87] !mb-2">1M+</div>
              <div className="!text-gray-600 !font-medium">Happy Visitors</div>
            </div>
            <div className="!text-center">
              <div className="!text-4xl !font-black !text-[#176B87] !mb-2">24/7</div>
              <div className="!text-gray-600 !font-medium">Support</div>
            </div>
            <div className="!text-center">
              <div className="!text-4xl !font-black !text-[#176B87] !mb-2">⭐️ 4.9</div>
              <div className="!text-gray-600 !font-medium">Rating</div>
            </div>
          </div>
        </div>
      </div>
      </main>

      <PageFooter />
    </div>
  );
}
