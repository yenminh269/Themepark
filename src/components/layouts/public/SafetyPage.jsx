import "../customer/Homepage.css";
import { FcHighPriority } from "react-icons/fc";
import { GiBodyHeight } from "react-icons/gi";
import { TiWeatherDownpour } from "react-icons/ti";

export default function SafetyPage() {
  const safetyCategories = [
    {
      title: "General Park Safety",
      color: "!border-green-500",
      rules: [
        "Follow all posted signs and ride instructions at all times.",
        "Children under 12 must be supervised by a parent or guardian.",
        "Remain on designated paths and do not enter restricted areas.",
        "Report any unsafe behavior or hazards to the nearest staff member."
      ]
    },
    {
      title: "Ride Safety Rules",
      color: "!border-blue-500",
      rules: [
        "Guests must meet the minimum height and health requirements for each ride.",
        "Secure all loose items (phones, hats, glasses, bags) before boarding.",
        "Keep hands, arms, legs, and feet inside ride vehicles at all times.",
        "Follow staff instructions during loading and unloading.",
        "If you feel dizzy, nauseous, or unwell, notify the ride operator immediately.",
        "Expectant mothers should not ride high-thrill attractions."
      ]
    },
    {
      title: "Health & Wellness",
      color: "!border-teal-500",
      rules: [
        "Stay hydrated, especially during hot weather.",
        "Take breaks between thrill rides to prevent dizziness.",
        "Bring sunscreen, refillable water bottle (sealed bottles allowed), and any necessary medications.",
        "Visit First Aid (located at the Main Hub) for any medical concerns."
      ]
    },
    {
      title: "Emergency Procedures",
      color: "!border-red-500",
      rules: [
        "In an emergency, remain calm and listen for staff directions.",
        "Evacuation routes are clearly marked across the park.",
        "Do not attempt to exit a ride vehicle unless instructed by staff.",
        "Emergency personnel are stationed within the park at all times."
      ]
    },
    {
      title: "Bag & Security Policy",
      color: "!border-purple-500",
      rules: [
        "All bags are subject to inspection at park entry.",
        "Prohibited items include: weapons, drones, alcohol, fireworks, and glass containers.",
        "Large items must be stored in lockers located near the Main Hub."
      ]
    },
    {
      title: "Cleanliness & Hygiene",
      color: "!border-cyan-500",
      rules: [
        "Dispose of trash in designated bins.",
        "Wash hands frequently or use hand sanitizing stations placed throughout the park.",
        "Do not enter water attractions with open wounds."
      ]
    }
  ];

  const heightRequirements = [
    { height: "Under 36\"", restriction: "Must be accompanied by supervising companion" },
    { height: "36\" - 42\"", restriction: "May ride select attractions with adult supervision" },
    { height: "42\" - 48\"", restriction: "Access to most attractions, some restrictions apply" },
    { height: "48\" - 54\"", restriction: "Access to all attractions except extreme thrill rides" },
    { height: "54\" and above", restriction: "Full access to all park attractions" }
  ];

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
      {/* Main Content */}
      <main className="!flex-1 !relative">
        <div className="!max-w-6xl !mx-auto !px-6 !py-6">
          {/* Header Section */}
          <div className="!text-center !mb-8">
            <div className="!inline-block !px-6 !py-3 !bg-[#4682A9] !rounded-full !text-white !font-semibold !mb-6 !shadow-lg">
              Your Safety is Our Priority
            </div>
            <h3 className="!text-4xl md:!text-5xl !font-black !mb-4 !text-[#176B87]">
             Safety Guidelines
            </h3>
            <p className="!text-xl !text-gray-700 !max-w-2xl !mx-auto">
              Please review these important safety guidelines to ensure a fun and secure experience for everyone at Velocity Valley.
            </p>
          </div>

          {/* Safety Categories Grid */}
          <div className="!grid md:!grid-cols-2 !gap-6 !mb-12">
            {safetyCategories.map((category, index) => (
              <div
                key={index}
                className={`!bg-white !rounded-2xl !shadow-lg !p-6 !transition-all hover:!shadow-2xl !border-l-4 ${category.color}`}
              >
                <div className="!flex !items-center !gap-3 !mb-4">
                  <div className="!text-4xl">{category.icon}</div>
                  <h3 className="!text-2xl !font-bold !text-[#176B87]">
                    {category.title}
                  </h3>
                </div>

                <ul className="!space-y-3">
                  {category.rules.map((rule, idx) => (
                    <li key={idx} className="!flex !items-start !gap-3">
                      <span className=" !font-bold !mt-1">•</span>
                      <span className="!text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Height Requirements Section */}
          <div className="!bg-white !rounded-2xl !shadow-2xl !p-6 !mb-12">
            <div className="!text-center">
              <h2 className="!text-3xl !font-bold !text-[#176B87] !mb-3 !flex !items-center !justify-center !gap-2">
                <GiBodyHeight />Height Requirements
              </h2>
              <p className="!text-gray-700">
                Safety restrictions are in place to ensure all guests can enjoy rides safely.
              </p>
            </div>

            <div className="!overflow-x-auto">
              <table className="!w-full !border-collapse">
                <thead>
                  <tr className="!bg-[#176B87] !text-white">
                    <th className="!p-4 !text-left !rounded-tl-lg">Height</th>
                    <th className="!p-4 !text-left !rounded-tr-lg">Ride Access</th>
                  </tr>
                </thead>
                <tbody>
                  {heightRequirements.map((req, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "!bg-[#EEF5FF]" : "!bg-gray-300"}
                    >
                      <td className="!p-4 !font-bold !text-[#176B87]">{req.height}</td>
                      <td className="!p-4 !text-gray-700">{req.restriction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="!mt-6 !bg-[#91C8E4]/20 !rounded-lg !p-2 !border-l-4 !border-[#176B87]">
              <p className="!text-md !text-gray-700">
                <strong className="!text-[#176B87]">Note:</strong> Height is measured with shoes on.
                If a guest is close to the height requirement, a staff member will measure them at the ride entrance.
              </p>
            </div>
          </div>

          {/* Prohibited Items */}
          <div className="!bg-gradient-to-r !from-red-50 !to-orange-50 !rounded-2xl !shadow-lg !p-8 !mb-12 !border-2 !border-red-200">
            <h2 className="!text-3xl !font-bold !text-red-700 !mb-6 !text-center !flex !items-center !justify-center !gap-2">
             <FcHighPriority /> Prohibited Items
            </h2>

            <div className="!grid md:!grid-cols-2 !gap-6">
              <div className="!bg-white !rounded-lg !p-6 !shadow-md">
                <h3 className="!text-xl !font-bold !text-red-700 !mb-4">Not Allowed in Park</h3>
                <ul className="!space-y-2 !text-gray-700">
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-red-600">✖</span>
                    <span>Weapons of any kind</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-red-600">✖</span>
                    <span>Drones or remote-controlled devices</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-red-600">✖</span>
                    <span>Alcoholic beverages</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-red-600">✖</span>
                    <span>Illegal substances</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-red-600">✖</span>
                    <span>Fireworks or explosives</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-red-600">✖</span>
                    <span>Glass containers</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-red-600">✖</span>
                    <span>Pets (except service animals)</span>
                  </li>
                </ul>
              </div>

              <div className="!bg-white !rounded-lg !p-6 !shadow-md">
                <h3 className="!text-xl !font-bold !text-orange-700 !mb-4">Not Allowed on Rides</h3>
                <ul className="!space-y-2 !text-gray-700">
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-orange-600">⚠</span>
                    <span>Loose jewelry or accessories</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-orange-600">⚠</span>
                    <span>Phones not secured in pockets</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-orange-600">⚠</span>
                    <span>Hats or headwear (unless secured)</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-orange-600">⚠</span>
                    <span>Cameras or recording devices</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-orange-600">⚠</span>
                    <span>Food or beverages</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-orange-600">⚠</span>
                    <span>Bags or backpacks</span>
                  </li>
                </ul>
                <p className="!text-sm !text-gray-600 !mt-4 !italic">
                  Free lockers are available near all major attractions
                </p>
              </div>
            </div>
          </div>

          {/* First Aid & Emergency Services */}
          <div className="!grid md:!grid-cols-2 !gap-6 !mb-12">
            <div className="!bg-white !rounded-xl !p-6 !shadow-lg !border-2 !border-[#86B6F6]">
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
                First Aid Services
              </h3>
              <div className="!space-y-3 !text-gray-700">
                <p>
                  Our First Aid station is located at the <strong>Main Hub (Central Plaza)</strong> and is staffed with certified medical professionals.
                </p>
                <div className="!bg-[#EEF5FF] !rounded-lg !p-4">
                  <h4 className="!font-bold !text-[#176B87] !mb-2">Services Provided:</h4>
                  <ul className="!space-y-1">
                    <li className="!flex !items-center !gap-2">
                      <span className="!text-green-600">✓</span>
                      <span>Basic medical care and first aid</span>
                    </li>
                    <li className="!flex !items-center !gap-2">
                      <span className="!text-green-600">✓</span>
                      <span>Ice packs and bandages</span>
                    </li>
                    <li className="!flex !items-center !gap-2">
                      <span className="!text-green-600">✓</span>
                      <span>Pain relief medication</span>
                    </li>
                    <li className="!flex !items-center !gap-2">
                      <span className="!text-green-600">✓</span>
                      <span>Rest area for feeling unwell</span>
                    </li>
                    <li className="!flex !items-center !gap-2">
                      <span className="!text-green-600">✓</span>
                      <span>Lost child assistance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="!bg-white !rounded-xl !p-6 !shadow-lg !border-2 !border-[#86B6F6]">
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
                Emergency Contact
              </h3>
              <div className="!space-y-4 !text-gray-700">
                <p>
                  In case of emergency, you can reach our security team or first aid services immediately.
                </p>
                <div className="!space-y-3">
                  <div className="!bg-red-50 !border-l-4 !border-red-500 !p-4 !rounded">
                    <div className="!font-bold !text-red-700 !mb-1">Emergency Hotline</div>
                    <a href="tel:911" className="!text-2xl !font-black !text-red-700 !no-underline">
                      911
                    </a>
                  </div>
                  <div className="!bg-[#EEF5FF] !border-l-4 !border-[#176B87] !p-4 !rounded">
                    <div className="!font-bold !text-[#176B87] !mb-1">Park Security</div>
                    <a href="tel:5551234567" className="!text-xl !font-bold !text-[#176B87] !no-underline">
                      (555) 123-4567
                    </a>
                  </div>
                  <div className="!bg-[#EEF5FF] !border-l-4 !border-[#176B87] !p-4 !rounded">
                    <div className="!font-bold !text-[#176B87] !mb-1">Guest Services</div>
                    <a href="tel:5551234568" className="!text-xl !font-bold !text-[#176B87] !no-underline">
                      (555) 123-4568
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weather & Closures */}
          <div className="!bg-gradient-to-r !from-[#176B87] !to-[#4682A9] !rounded-2xl !shadow-2xl !p-8 !text-white !mb-12">
            <h2 className="!text-3xl !font-bold !mb-6 !text-center !flex !items-center !justify-center !gap-2">
            <TiWeatherDownpour /> Weather & Ride Closures
            </h2>
            <div className="!grid md:!grid-cols-2 !gap-6">
              <div>
                <h3 className="!text-xl !font-bold !mb-3 !text-[#AAE2FF]">Inclement Weather</h3>
                <ul className="!space-y-2">
                  <li className="!flex !items-start !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Outdoor rides close during lightning within 10 miles.</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Some attractions may close during heavy rain.</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                   <span className="text-white !font-bold">•</span>
                    <span className="text-white">High wind speeds may affect tall rides.</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Extreme cold may impact water attractions.</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="!text-xl !font-bold !mb-3 !text-[#AAE2FF]">Planned Maintenance</h3>
                <ul className="!space-y-2">
                  <li className="!flex !items-start !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Daily safety inspections occur before park opening.</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Scheduled maintenance posted on our website.</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Download our app for real-time ride status.</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="text-white !font-bold">•</span>
                    <span className="text-white">Refunds available if major attractions are closed.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Important Reminder */}
          <div className="!bg-white !rounded-xl !p-8 !shadow-lg !text-center">
            <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4">
              Safety is Everyone's Responsibility
            </h3>
            <p className="!text-lg !text-gray-700 !max-w-3xl !mx-auto !mb-6">
              By following these guidelines, you help create a safe and enjoyable environment for all guests.
              If you see something unsafe or have concerns, please report it to the nearest staff member immediately.
            </p>
            <div className="!flex !flex-wrap !justify-center !gap-4">
              <a
                href="/map"
                className="!px-6 !py-3 !bg-[#176B87] !text-white !font-bold !rounded-lg hover:!bg-[#0f4f66] !transition-colors !no-underline"
              >
                View Park Map
              </a>
              <a
                href="/tickets"
                className="!px-6 !py-3 !bg-[#91C8E4] !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#B4D4FF] !transition-colors !no-underline"
              >
                Get Your Tickets
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
