import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PageFooter from "./PageFooter";
import RideGalleryWrapper from "./RideGalleryWrapper";
import "./Homepage.css";
import bgVideo from "../../../assets/video.mp4";
export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetTickets = () => {
    if (user) navigate("/tickets");
    else navigate("/login");
  };

  return (
    <div className="!min-h-screen !flex !flex-col !text-slate-800">
      {/* Navbar is now global in App.jsx - removed local navbar */}

      {/* Hero Section with Background */}
      <main className="!flex-1 !relative !overflow-hidden">
          <div className="!absolute !inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="!w-full !h-full !object-cover"
            >
              <source src={bgVideo} type="video/mp4" />
            </video>
            <div className="!absolute !inset-0 !bg-black/40"></div>
          </div>


        <div className="!relative !flex !items-center !justify-center !px-6 !py-10">
          <div className="!max-w-6xl !w-full">
            <div className="!text-center !mb-8">
              <div className="!inline-block !px-4 !py-2 !bg-white/80 !rounded-full !text-sm !font-semibold !text-[#176B87] !mb-6 !shadow-md">
                🎉 Welcome to the Most Exciting Theme Park!
              </div>
              <h1 className="!text-6xl md:!text-7xl !font-black !mb-6 !leading-tight">
                <span className="!text-white !drop-shadow-lg">Adventure Awaits
                </span>
                <br />
                <span className="!text-white !drop-shadow-lg">at</span>
                <span className="!text-[#91C8E4] italic !drop-shadow-lg"> Velocity Valley</span>
              </h1>
              <p className="!text-xl !text-white !mb-8 !max-w-2xl !mx-auto !drop-shadow-md">
                Experience the thrill of a lifetime with world-class rides, family fun,
                and unforgettable memories. Your adventure starts here!
              </p>
              <div className="!flex !flex-wrap !gap-4 !justify-center">
                <button
                  onClick={handleGetTickets}
                  className="!px-8 !py-4 !rounded-xl !text-lg !font-bold !bg-[#176B87] !text-white hover:!shadow-2xl hover:!scale-105 !transition-all !border-none !shadow-lg"
                >Get Your Tickets Now!
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
              <h2 className="!text-3xl !font-bold font-serif !text-center !text-white !mb-8">
               “Feel the Velocity — Where Speed Meets Thrill.”
              </h2>
              <div className="!grid md:!grid-cols-2 !gap-6">
                <div className="!relative !h-64 !rounded-2xl !overflow-hidden !shadow-2xl !group">
                  <img
                    src="https://orlandoinformer.com/wp-content/uploads/2023/05/Pipeline-Hero-Image-scaled.jpg"
                    alt="Roller Coaster"
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  <div className="!absolute !inset-0 !bg-[#176B87]/20 !flex !items-end !p-6">
                    <div>
                      <h3 className="!text-white !text-xl !font-bold !mb-1">Thrilling Coasters</h3>
                      <p className="!text-white/90 !text-sm">  Experience adrenaline-pumping roller coasters and exciting attractions for all ages.</p>
                    </div>
                  </div>
                </div>
                <div className="!relative !h-64 !rounded-2xl !overflow-hidden !shadow-2xl !group">
                  <img
                    src="https://www.usnews.com/object/image/0000014e-b11b-d9dd-a9ee-f59b84d60000/150721-themepark-stock.jpg?update-time=1437490513030&size=responsive640"
                    alt="Family Fun"
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  <div className="!absolute !inset-0 !bg-[#176B87]/20 !flex !items-end !p-6">
                    <div>
                      <h3 className="!text-white !text-xl !font-bold !mb-1">Family Adventures</h3>
                      <p className="!text-white/90 !text-sm">  Create magical memories with attractions perfect for the whole family!</p>
                    </div>
                  </div>
                </div>
                <div className="!relative !h-64 !rounded-2xl !overflow-hidden !shadow-2xl !group">
                  <img
                    src="https://www.splashzonewaterpark.com/content/uploads/2016/04/Hurricane-Island.png"
                    alt="Water Rides"
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  <div className="!absolute !inset-0 !bg-[#176B87]/20 !flex !items-end !p-6">
                    <div>
                      <h3 className="!text-white !text-xl !font-bold !mb-1">Splash Zone</h3>
                      <p className="!text-white/90 !text-sm">Cool off in style!</p>
                    </div>
                  </div>
                </div>
                <div className="!relative !h-64 !rounded-2xl !overflow-hidden !shadow-2xl !group">
                  <img
                    src="https://www.tripsavvy.com/thmb/LCINurZ9u4CBjUgNKH4-4o0lJNE=/2048x1365/filters:fill(auto,1)/12372879563_d7d347f9e5_k-5c40d51a46e0fb0001d4a2e6.jpg"
                    alt="Easy Booking"
                    className="!w-full !h-full !object-cover group-hover:!scale-110 !transition-transform !duration-500"
                  />
                  <div className="!absolute !inset-0 !bg-[#176B87]/20 !flex !items-end !p-6">
                    <div>
                      <h3 className="!text-white !text-xl !font-bold !mb-1">Easy Booking</h3>
                      <p className="!text-white/90 !text-sm">Skip the lines! Book your tickets online and enjoy hassle-free entry.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/* Park Information Section */}
          <div className="!mt-16 !bg-white/80 backdrop-blur-sm !rounded-2xl !p-8 !shadow-xl">
            <div className="!mb-8">
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
                About Us
              </h3>
              <div className="!text-gray-700 !leading-relaxed !space-y-4">
                <p>
                  <em>Velocity Valley</em> is a modern high-energy amusement park designed for adrenaline seekers and families alike.
                  Nestled against the scenic foothills of Colorado's Aurora Springs, the park blends cutting-edge ride technology
                  with immersive themed zones. Guests can dive into futuristic high-speed coasters, explore adventure-themed lands,
                  relax in shaded plazas, and enjoy an evening illuminated by vibrant neon displays.
                From towering water slides to precision-engineered launch coasters, <em>Velocity Valley</em> delivers a full-day experience
                  of speed, excitement, and unforgettable memories.
                </p>
              </div>
            </div>

            {/* Mission Statement */}
            <div>
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
            Mission Statement
              </h3>
              <div className="!text-gray-700 !leading-relaxed !pl-8">
                <p className="!italic !text-lg">
                  "To create unforgettable moments through innovation, excitement, and world-class entertainment —
                  bringing guests together through the thrill of speed, adventure, and imagination."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      <PageFooter />
    </div>
  );
}
