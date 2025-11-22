import React from "react";
import PageFooter from "./PageFooter";
import "./Homepage.css";

export default function ParkHoursPage() {
  const hours = [
    { day: "Sunday", time: "11:00am - 6:00pm" },
    { day: "Monday", time: "10:00am - 8:00pm" },
    { day: "Tuesday", time: "10:00am - 8:00pm" },
    { day: "Wednesday", time: "10:00am - 8:00pm" },
    { day: "Thursday", time: "10:00am - 8:00pm" },
    { day: "Friday", time: "10:00am - 10:00pm" },
    { day: "Saturday", time: "10:00am - 10:00pm" }
  ];

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
      {/* Main Content */}
      <main className="!flex-1 !relative">
        <div className="!max-w-4xl !mx-auto !px-6 !py-16">
          {/* Header Section */}
          <div className="!text-center !mb-12">
            <div className="!inline-block !px-6 !py-3 !bg-[#176B87] !rounded-full !text-white !font-semibold !mb-6 !shadow-lg">
              Plan Your Visit
            </div>
            <h1 className="!text-5xl md:!text-6xl !font-black !mb-4 !text-[#176B87]">
              Park Hours
            </h1>
            <p className="!text-xl !text-gray-700 !max-w-2xl !mx-auto">
              Velocity Valley is open year-round! Check our operating hours below to plan your adventure.
            </p>
          </div>

          {/* Hours Display */}
          <div className="!bg-white !rounded-2xl !shadow-2xl !overflow-hidden">
            <div className="!bg-[#176B87] !p-6 !text-center">
              <h2 className="!text-3xl !font-bold !text-white">Weekly Schedule</h2>
            </div>

            <div className="!p-8">
              <div className="!space-y-4">
                {hours.map((schedule, index) => (
                  <div
                    key={index}
                    className="!flex !justify-between !items-center !p-6 !bg-gradient-to-r !from-[#EEF5FF] !to-[#B4D4FF]/30 !rounded-xl !shadow-md hover:!shadow-lg !transition-shadow"
                  >
                    <span className="!text-2xl !font-bold !text-[#176B87]">
                      {schedule.day}
                    </span>
                    <span className="!text-xl !font-semibold !text-gray-700">
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Additional Information */}
              <div className="!mt-8 !p-6 !bg-[#91C8E4]/20 !rounded-xl !border-l-4 !border-[#176B87]">
                <h3 className="!text-xl !font-bold !text-[#176B87] !mb-3">
                  Important Information
                </h3>
                <ul className="!text-gray-700 !space-y-2 !list-disc !list-inside">
                  <li>Park hours may vary during holidays and special events</li>
                  <li>Last entry is 1 hour before closing time</li>
                  <li>Some attractions may close earlier for maintenance</li>
                  <li>Check our website or call (555) 123-4567 for real-time updates</li>
                </ul>
              </div>

              {/* Call to Action */}
              <div className="!mt-8 !text-center">
                <a
                  href="/tickets"
                  className="!inline-block !px-8 !py-4 !bg-[#176B87] !text-white !font-bold !text-lg !rounded-xl hover:!bg-[#0f4f66] !shadow-lg hover:!shadow-xl !transition-all hover:!scale-105"
                >
                  Get Your Tickets Now!
                </a>
              </div>
            </div>
          </div>

          {/* Seasonal Note */}
          <div className="!mt-12 !text-center !bg-white !rounded-xl !p-6 !shadow-lg">
            <p className="!text-lg !text-gray-700">
              <strong className="!text-[#176B87]">Extended Hours:</strong> We stay open later on Friday and Saturday nights so you can enjoy more thrills!
            </p>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
