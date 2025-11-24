import "../customer/Homepage.css";
import accessibilityGuidePDF from "../../../assets/accessibility-guide.pdf";

export default function AccessibilityPage() {
  const accessibilityServices = [
    {
      title: "Parking & Entry",
      color: "!border-blue-500",
      bgColor: "!bg-blue-50",
      items: [
        "Reserved ADA parking spaces located in Preferred Parking (closest to the entrance).",
        "A valid disabled parking permit or placard is required.",
        "Curb cuts and accessible ramps connect directly to the main entry plaza."
      ]
    },
    {
      title: "Park Accessibility",
      color: "!border-green-500",
      bgColor: "!bg-green-50",
      items: [
        "All main pathways are wheelchair accessible.",
        "Elevators are available in multi-level structures where needed.",
        "Wide turning spaces are provided in queues and dining areas."
      ]
    },
    {
      title: "Ride Accessibility & Policies",
      color: "!border-purple-500",
      bgColor: "!bg-purple-50",
      items: [
        "Each ride has posted accessibility requirements and transfer information.",
        "Attractions are categorized by accessibility type (see below for details).",
        "Attractions with high-speed or intense motion may have restrictions for safety.",
        "A full Accessible Ride Guide is available at Guest Services or the park website/app."
      ]
    },
    {
      title: "Wheelchair Rental",
      color: "!border-orange-500",
      bgColor: "!bg-orange-50",
      items: [
        "Standard manual wheelchairs and ECV (Electric Convenience Vehicles) are available.",
        "Rental Location: Guest Services near the Main Hub.",
        "Availability is first-come, first-served."
      ]
    },
    {
      title: "Service Animals",
      color: "!border-teal-500",
      bgColor: "!bg-teal-50",
      items: [
        "Fully trained service animals are permitted in most areas.",
        "Some attractions do not allow animals for safety reasons — designated waiting areas are available.",
        "Relief areas for service animals are located in each major zone and listed on the park map."
      ]
    },
    {
      title: "Guests with Hearing or Visual Needs",
      color: "!border-pink-500",
      bgColor: "!bg-pink-50",
      items: [
        "Assistive listening devices available for shows and theaters.",
        "Captioning devices for select attractions.",
        "Braille park maps available at Guest Services.",
        "Tactile guide paths in central walkways.",
        "Audio descriptions for select attractions."
      ]
    },
    {
      title: "Guests with Cognitive Disabilities",
      color: "!border-indigo-500",
      bgColor: "!bg-indigo-50",
      items: [
        "Calming spaces located in the Main Hub and Rapids Ridge.",
        "Attraction preview sheets describing ride intensity, duration, and sensory elements.",
        "Allowances for more flexible boarding when necessary."
      ]
    }
  ];

  const rideAccessibilityTypes = [
    {
      type: "Wheelchair Transfer",
      description: "Guest must be able to transfer from wheelchair to ride vehicle with assistance.",
      color: "!bg-blue-100 !text-blue-800"
    },
    {
      type: "Ambulatory Access",
      description: "Guest must be able to walk short distances and navigate stairs or steps.",
      color: "!bg-green-100 !text-green-800"
    },
    {
      type: "No Transfer Required",
      description: "Ride accessible with wheelchair - no transfer needed.",
      color: "!bg-purple-100 !text-purple-800"
    },
    {
      type: "Restricted Access",
      icon: "⚠️",
      description: "Attraction may have specific restrictions due to safety requirements.",
      color: "!bg-orange-100 !text-orange-800"
    }
  ];

  const rentalRates = [
    { item: "Standard Manual Wheelchair", price: "$15/day" },
    { item: "Electric Convenience Vehicle (ECV)", price: "$30/day"},
    { item: "Assistive Listening Device", price: "FREE" },
    { item: "Captioning Device", price: "FREE" }
  ];

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
      {/* Main Content */}
      <main className="!flex-1 !relative">
        <div className="!max-w-6xl !mx-auto !px-6 !py-6">
          {/* Header Section */}
          <div className="!text-center !mb-8">
            <div className="!inline-block !px-6 !py-3 !bg-[#4682A9] !rounded-full !text-white !font-semibold !mb-5 !shadow-lg">
             Accessibility Services
            </div>
             <h3 className="!text-4xl md:!text-5xl !font-black !mb-4 !text-[#176B87]">
              Accessibility Information
            </h3>
            <p className="!text-lg !text-gray-700 !max-w-3xl !mx-auto !leading-relaxed">
              Velocity Valley is committed to ensuring that all guests have a safe and enjoyable experience.
              We follow ADA guidelines and provide accessibility accommodations across the entire park.
            </p>
          </div>

          {/* Quick Guide Download */}
          <div className="!bg-gradient-to-r !from-[#176B87] !to-[#4682A9] !rounded-2xl !p-6 !text-white !mb-12">
            <div className="!text-center">
              <h3 className="!text-2xl !font-bold !mb-4">Download Our Accessibility Guide</h3>
              <p className="!mb-6 !text-gray-100">
                Get the complete Accessible Ride Guide and detailed park map in PDF format
              </p>
              <div className="!flex !flex-wrap !justify-center !gap-4">
                <a
                  href={accessibilityGuidePDF}
                  download="Velocity-Valley-Accessibility-Guide.pdf"
                  className="!px-6 !py-3 !bg-white !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#AAE2FF] !transition-colors !no-underline !inline-block"
                >
                  📄 Download Accessibility Guide (PDF)
                </a>
                <a
                 
                  download="Velocity-Valley-Accessible-Map.pdf"
                  className="!px-6 !py-3 !bg-white !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#AAE2FF] !transition-colors !no-underline !inline-block"
                >
                  🗺️ Download Accessible Map (PDF)
                </a>
              </div>
            </div>
          </div>

          {/* Accessibility Services Grid */}
          <div className="!grid md:!grid-cols-2 !gap-6 !mb-12">
            {accessibilityServices.map((service, index) => (
              <div
                key={index}
                className={`!bg-white !rounded-2xl !shadow-lg !p-6 !transition-all hover:!shadow-2xl !border-l-4 ${service.color}`}
              >
                <div className="!flex !items-center !gap-3 !mb-4">
                  <h3 className="!text-2xl !font-bold !text-[#176B87]">
                    {service.title}
                  </h3>
                </div>

                <ul className="!space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="!flex !items-start !gap-3">
                      <span className="!text-[#176B87] !font-bold !mt-1 !flex-shrink-0">•</span>
                      <span className="!text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Ride Accessibility Types */}
          <div className="!bg-white !rounded-2xl !p-8 !mb-12">
            <h2 className="!text-3xl !font-bold !text-[#176B87] !text-center">
              Ride Accessibility Types
            </h2>
            <p className="!text-gray-700 !text-center !max-w-3xl !mx-auto">
              Each attraction is categorized to help you plan your visit. Look for these symbols at ride entrances:
            </p>

            <div className="!grid md:!grid-cols-2 !gap-6">
              {rideAccessibilityTypes.map((type, index) => (
                <div
                  key={index}
                  className="!bg-[#EEF5FF] !rounded-xl !p-4 !shadow-md"
                >
                  <div className="!flex !items-start !gap-4">
                    <div className="!flex-1">
                      <div className={`!inline-block !px-3 !py-1 !rounded-full !font-bold !text-sm !mb-3 ${type.color}`}>
                        {type.type}
                      </div>
                      <p className="!text-gray-700">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="!mt-3 !bg-[#91C8E4]/20 !rounded-lg !p-4 !border-l-4 !border-[#176B87]">
              <p className="!text-sm !text-gray-700">
                <strong className="!text-[#176B87]">Note:</strong> For detailed accessibility information for specific rides,
                please consult the Accessible Ride Guide available at Guest Services or download it from our website.
              </p>
            </div>
          </div>

          {/* Rental Rates */}
          <div className="!bg-white !rounded-2xl !p-6 !mb-12 !border-2 !border-[#86B6F6]">
            <h2 className="!text-3xl !font-bold !text-[#176B87] !mb-6 !text-center">
              Rental Rates
            </h2>
            <div className="!grid md:!grid-cols-2 !gap-6">
              {rentalRates.map((rental, index) => (
                <div
                  key={index}
                  className="!bg-gradient-to-r !from-[#EEF5FF] !to-[#B4D4FF]/30 !rounded-xl !p-6 !shadow-md !flex !items-center !justify-between"
                >
                  <div className="!flex !items-center !gap-4">
                    <div className="!text-4xl">{rental.icon}</div>
                    <div>
                      <div className="!font-bold !text-[#176B87] !text-lg">
                        {rental.item}
                      </div>
                    </div>
                  </div>
                  <div className="!text-2xl !font-black !text-[#176B87]">
                    {rental.price}
                  </div>
                </div>
              ))}
            </div>

            <div className="!mt-6 !text-center !text-gray-600">
              <p>
                <strong className="!text-[#176B87]">Rental Location:</strong> Guest Services, Main Hub (Central Plaza)
              </p>
              <p className="!mt-2">
                A valid ID and refundable deposit may be required for equipment rentals
              </p>
            </div>
          </div>

          {/* Guest Services & Accessibility Pass */}
          <div className="!grid md:!grid-cols-2 !gap-6 !mb-12">
            <div className="!bg-white !rounded-xl !p-6 !shadow-lg">
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
                Accessibility Pass
              </h3>
              <p className="!text-gray-700 !mb-4">
                Guests with disabilities who cannot wait in traditional queues may request an Accessibility Pass at Guest Services.
              </p>
              <div className="!bg-[#EEF5FF] !rounded-lg !p-4 !space-y-2">
                <div className="!flex !items-start !gap-2">
                  <span className="!text-green-600 !font-bold">✓</span>
                  <span className="!text-gray-700">Provides alternative queue access</span>
                </div>
                <div className="!flex !items-start !gap-2">
                  <span className="!text-green-600 !font-bold">✓</span>
                  <span className="!text-gray-700">Valid for your entire visit</span>
                </div>
                <div className="!flex !items-start !gap-2">
                  <span className="!text-green-600 !font-bold">✓</span>
                  <span className="!text-gray-700">Available for guest + up to 5 companions</span>
                </div>
                <div className="!flex !items-start !gap-2">
                  <span className="!text-green-600 !font-bold">✓</span>
                  <span className="!text-gray-700">No additional documentation required</span>
                </div>
              </div>
            </div>

            <div className="!bg-white !rounded-xl !p-6 !shadow-lg">
              <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4 !flex !items-center !gap-2">
                Guest Services
              </h3>
              <p className="!text-gray-700 !mb-4">
                Our Guest Services team is here to assist with all accessibility needs.
              </p>
              <div className="!space-y-3">
                <div className="!bg-[#EEF5FF] !rounded-lg !p-4">
                  <div className="!font-bold !text-[#176B87] !mb-2">Location:</div>
                  <div className="!text-gray-700">Main Hub (Central Plaza)</div>
                </div>
                <div className="!bg-[#EEF5FF] !rounded-lg !p-4">
                  <div className="!font-bold !text-[#176B87] !mb-2">Services Provided:</div>
                  <ul className="!text-gray-700 !space-y-1">
                    <li>• Accessibility Passes</li>
                    <li>• Equipment Rentals</li>
                    <li>• Braille Maps</li>
                    <li>• Attraction Preview Sheets</li>
                    <li>• General Assistance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sensory-Friendly Features */}
          <div className="!bg-gradient-to-r !from-purple-50 !to-pink-50 !rounded-2xl !shadow-lg !p-8 !mb-12 !border-2 !border-purple-200">
            <h2 className="!text-3xl !font-bold !text-[#176B87] !mb-6 !text-center !flex !items-center !justify-center !gap-2">
              Sensory-Friendly Features
            </h2>

            <div className="!grid md:!grid-cols-2 !gap-6">
              <div className="!bg-white !rounded-lg !p-6 !shadow-md">
                <h3 className="!text-xl !font-bold !text-purple-700 !mb-3">Calming Spaces</h3>
                <p className="!text-gray-700 !mb-4">
                  Designated quiet areas for guests who need a break from sensory stimulation:
                </p>
                <ul className="!space-y-2 !text-gray-700">
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-purple-600">📍</span>
                    <span>Main Hub — Guest Services building</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-purple-600">📍</span>
                    <span>Rapids Ridge — Near First Aid station</span>
                  </li>
                </ul>
              </div>

              <div className="!bg-white !rounded-lg !p-6 !shadow-md">
                <h3 className="!text-xl !font-bold !text-pink-700 !mb-3">Attraction Preview Sheets</h3>
                <p className="!text-gray-700 !mb-4">
                  Detailed information sheets available for each attraction describing:
                </p>
                <ul className="!space-y-2 !text-gray-700">
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-pink-600">•</span>
                    <span>Ride intensity level</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-pink-600">•</span>
                    <span>Duration and wait times</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-pink-600">•</span>
                    <span>Sensory elements (lights, sounds, motion)</span>
                  </li>
                  <li className="!flex !items-center !gap-2">
                    <span className="!text-pink-600">•</span>
                    <span>Photo/video preview available</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="!bg-white !rounded-xl !p-8 !shadow-lg !text-center">
            <h3 className="!text-2xl !font-bold !text-[#176B87] !mb-4">
              Questions About Accessibility?
            </h3>
            <p className="!text-gray-700 !mb-6 !max-w-2xl !mx-auto">
              We're here to help make your visit comfortable and enjoyable. Contact our accessibility team
              to discuss specific needs or accommodations.
            </p>
            <div className="!flex !flex-wrap !justify-center !gap-4">
              <a
                href="tel:5551234568"
                className="!px-6 !py-3 !bg-[#176B87] !text-white !font-bold !rounded-lg hover:!bg-[#0f4f66] !transition-colors !no-underline"
              >
                📞 Call Guest Services: (555) 123-4568
              </a>
              <a
                href="mailto:accessibility@velocityvalley.com"
                className="!px-6 !py-3 !bg-[#91C8E4] !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#B4D4FF] !transition-colors !no-underline"
              >
                ✉️ accessibility@velocityvalley.com
              </a>
            </div>

            <div className="!mt-8 !flex !flex-wrap !justify-center !gap-4">
              <a
                href="/map"
                className="!px-4 !py-2 !bg-[#EEF5FF] !text-[#176B87] !font-semibold !rounded-lg hover:!bg-[#B4D4FF] !transition-colors !no-underline"
              >
                View Park Map
              </a>
              <a
                href="/faq"
                className="!px-4 !py-2 !bg-[#EEF5FF] !text-[#176B87] !font-semibold !rounded-lg hover:!bg-[#B4D4FF] !transition-colors !no-underline"
              >
                FAQ
              </a>
              <a
                href="/safety"
                className="!px-4 !py-2 !bg-[#EEF5FF] !text-[#176B87] !font-semibold !rounded-lg hover:!bg-[#B4D4FF] !transition-colors !no-underline"
              >
                Safety Guidelines
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
