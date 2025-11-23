import "../customer/Homepage.css";
import { FaMap } from "react-icons/fa";
import { RiSecurePaymentFill } from "react-icons/ri";

export default function ParkingPage() {
  const parkingOptions = [
    {
      title: "General Parking",
      price: "FREE",
      features: [
        "Over 5,000 available spots",
        "Short walk to park entrance",
        "All parking areas are well-lit and monitored 24/7",
        "Clearly marked aisles and sections",
        "Family-friendly pathways"
      ]
    },
    {
      title: "Preferred Parking",
      price: "$15",
      features: [
        "Closest spots to the entrance gate",
        "Reserved sections",
        "Guaranteed availability",
        "Premium covered areas",
        "First to exit at closing time"
      ]
    },
    {
      title: "Accessible Parking",
      price: "FREE",
      features: [
        "ADA-compliant spaces",
        "Located near all park entrances",
        "Extra-wide parking stalls",
        "Accessible pathways to entrance",
        "Valid permit required"
      ]
    },
    {
      title: "EV Charging Stations",
      price: "FREE*",
      features: [
        "50+ electric vehicle charging stations",
        "Level 2 and DC Fast Charging available",
        "Complimentary charging while you visit",
        "Monitored charging bays",
        "Mobile app notifications available"
      ],
      note: "*Free with park admission"
    },
    {
      title: "Oversized Vehicle Parking",
      price: "$20",
      features: [
        "For RVs, buses, and trailers",
        "Extra-large parking spaces",
        "Separate designated area",
        "Easy in-and-out access",
        "Security patrol"
      ]
    },
    {
      title: "Motorcycle Parking",
      price: "FREE",
      features: [
        "Dedicated motorcycle section",
        "Covered parking available",
        "Close to main entrance",
        "Extra security monitoring",
        "Helmet storage lockers nearby"
      ]
    }
  ];

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
      {/* Main Content */}
      <main className="!flex-1 !relative">
        <div className="!max-w-6xl !mx-auto !px-6 !py-6">
          {/* Header Section */}
          <div className="!text-center !mb-8">
            <div className="!inline-block !px-6 !py-3 !bg-[#4682A9] !rounded-full !text-white !font-semibold !mb-6 !shadow-lg">
              Parking Information
            </div>
            <h3 className="!text-4xl md:!text-5xl !font-black !mb-4 !text-[#176B87]">
              Park with Ease
            </h3>
            <p className="!text-xl !text-gray-700 !max-w-2xl !mx-auto">
              Velocity Valley offers convenient, safe, and accessible parking for all guests. Choose the option that's right for you!
            </p>
          </div>

          {/* Parking Options Grid */}
          <div className="!grid md:!grid-cols-2 lg:!grid-cols-3 !gap-6 !mb-12">
            {parkingOptions.map((option, index) => (
              <div
                key={index}
                className="!bg-white !rounded-2xl !shadow-lg hover:!shadow-2xl !p-6 !transition-all hover:!scale-[1.02] !border-2 !border-[#B4D4FF]"
              >
                <div className="!text-center !mb-4">
                  <h3 className="!text-2xl !font-bold !text-[#176B87]">
                    {option.title}
                  </h3>
                  <div className="!text-3xl !font-black !text-[#91C8E4]">
                    {option.price}
                  </div>
                  {option.note && (
                    <p className="!text-xs !text-gray-600 !italic !mt-1">{option.note}</p>
                  )}
                </div>

                <div className="!space-y-2">
                  {option.features.map((feature, idx) => (
                    <div key={idx} className="!flex !items-start !gap-2">
                      <span className="!text-green-600 !font-bold !mt-1">✓</span>
                      <span className="!text-gray-700 !text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Parking Map Section */}
            <h2 className="flex justify-center !text-3xl !font-bold !text-[#176B87] !mb-6">
              <FaMap className="!text-2xl !mr-2 mt-2" />Parking Lot Layout
            </h2>
            <div className="!bg-[#B4D4FF] !rounded-xl !p-8 !font-mono !text-sm mb-5">
              <div className="!text-center !mb-4 !text-lg !font-bold !text-[#176B87]">
                [ PARK ENTRANCE ]
                <br />
                ↑
              </div>

              <div className="!grid md:!grid-cols-3 !gap-4 !mb-6">
                <div className="!bg-white !rounded-lg !p-4 !text-center !shadow-md">
                  <div className="!font-bold !text-[#176B87]">Accessible</div>
                  <div className="!text-xs !text-gray-600">Section A</div>
                </div>
                <div className="!bg-white !rounded-lg !p-4 !text-center !shadow-md">
                  <div className="!font-bold !text-[#176B87]">Preferred</div>
                  <div className="!text-xs !text-gray-600">Section B</div>
                </div>
                <div className="!bg-white !rounded-lg !p-4 !text-center !shadow-md">
                  <div className="!font-bold !text-[#176B87]">EV Charging</div>
                  <div className="!text-xs !text-gray-600">Section C</div>
                </div>
              </div>

              <div className="!grid md:!grid-cols-2 !gap-4 !mb-4">
                <div className="!bg-white !rounded-lg !p-6 !text-center !shadow-md">
                  <div className="!font-bold !text-[#176B87] !text-lg">General Parking</div>
                  <div className="!text-xs !text-gray-600">Sections D-M (5,000+ spots)</div>
                </div>
                <div className="!bg-white !rounded-lg !p-6 !text-center !shadow-md">
                  <div className="!font-bold !text-[#176B87] !text-lg">Motorcycles</div>
                  <div className="!text-xs !text-gray-600">Section N</div>
                </div>
              </div>

              <div className="!bg-white !rounded-lg !p-6 !text-center !shadow-md">
                <div className="!font-bold !text-[#176B87] !text-lg">Oversized Vehicles</div>
                <div className="!text-xs !text-gray-600">Section O (East Side)</div>
              </div>
            </div>
          {/* Important Information */}
          <div className="!grid md:!grid-cols-2 !gap-6 !mb-12">
            <div className="!bg-white !rounded-xl !p-6 !shadow-lg !border-2 !border-[#86B6F6]">
              <h3 className="!text-2xl underline !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
               Parking Guidelines
              </h3>
              <ul className="!space-y-3">
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Parking lots open 1 hour before park opening</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>All lots remain open until 2 hours after park closing</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Parking is at your own risk - lock your vehicle</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Take a photo of your parking section number</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>No overnight parking permitted</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Security patrols operate 24/7</span>
                </li>
              </ul>
            </div>

            <div className="!bg-white !rounded-xl !p-6 !shadow-lg !border-2 !border-[#86B6F6]">
              <h3 className="!underline !text-2xl !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
              Parking Tips
              </h3>
              <ul className="!space-y-3">
                <li className="!flex !items-start !gap-2">
                  <span className=" !font-bold">•</span>
                  <span>Arrive early on weekends and holidays for best spots</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Use our mobile app to check lot capacity in real-time</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Follow parking attendant directions during peak times</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className=" !font-bold">•</span>
                  <span>Keep valuables out of sight and doors locked.</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Remember your row number and color-coded section</span>
                </li>
                <li className="!flex !items-start !gap-2">
                  <span className="!font-bold">•</span>
                  <span>Lost car? Visit Guest Services for assistance</span>
                </li>
              </ul>
            </div>
          </div>

           <div  className="!bg-gradient-to-r !from-red-50 !to-orange-50 !rounded-2xl !p-6 !mb-10 !border-2 !border-red-200">
              <h5 className="!text-gray-700 !mb-4">Velocity Valley is committed to providing a safe and secure environment for all guests.</h5>
              <ul>
                <li className="!flex !items-start !gap-2">
                  <span className="font-bold">•</span>
                  We take safety and security very seriously. Our lots are monitored 24/7 and we have a team of security officers on duty.</li>
                <li className="!flex !items-start !gap-2">
                  <span className="font-bold">•</span>
                  Velocity Valley is not responsible for lost or damaged items left in vehicles.
                </li>
                <li className="!flex !items-start !gap-2">
                   <span className="font-bold">•</span>
                  Report any suspicious activity to Parking Security.</li>
              </ul>
            </div>

          {/* Payment & Reservations */}
          <div className="!bg-gradient-to-r !from-[#176B87] !to-[#4682A9] !rounded-2xl !shadow-2xl !p-8 !text-white !mb-12">
            <h2 className="!text-3xl flex justify-center !font-bold !mb-6">
              <RiSecurePaymentFill className="!text-2xl !mr-2 mt-2" />Payment & Reservations
            </h2>
            <div className="!grid md:!grid-cols-2 !gap-8">
              <div>
                <h3 className="!text-xl !font-bold !mb-3 !text-[#AAE2FF]">Payment Methods</h3>
                <ul className="!space-y-2">
                  <li className="!flex !items-center !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Credit/Debit Cards accepted at entry.</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Mobile payment (Apple Pay, Google Pay).</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Cash accepted at attended booths.</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Prepaid parking with ticket purchase.</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="!text-xl !font-bold !mb-3 !text-[#AAE2FF]">Reserve Preferred Parking</h3>
                <p className="!mb-4 text-white">
                  Guarantee your spot! Book preferred parking online and skip the entrance line.
                </p>
                <button className="!px-6 !py-3 !bg-white !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#AAE2FF] !transition-colors !w-full !border-none !cursor-pointer !text-lg">
                  Reserve Parking Online
                </button>
                <p className="text-sm !mt-3 !text-[#AAE2FF]">
                  *Save $5 when you book online in advance
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="!bg-white !rounded-xl !p-6 !shadow-lg !text-center">
            <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4">
              Questions About Parking?
            </h3>
            <p className="!text-gray-700">
              Our parking team is here to help! Contact us for assistance or special accommodations.
            </p>
            <div className="!flex !flex-wrap !justify-center !gap-4">
              <a
                href="tel:5551234567"
                className="!px-6 !py-3 !bg-[#176B87] !text-white !font-bold !rounded-lg hover:!bg-[#0f4f66] !transition-colors !no-underline"
              >
                📞 (555) 123-4567
              </a>
              <a
                href="mailto:parking@velocityvalley.com"
                className="!px-6 !py-3 !bg-[#91C8E4] !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#B4D4FF] !transition-colors !no-underline"
              >
                ✉️ parking@velocityvalley.com
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
