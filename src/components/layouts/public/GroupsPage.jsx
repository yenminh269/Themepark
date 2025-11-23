import "../customer/Homepage.css";
import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { MdDiscount } from "react-icons/md";
import { MdOutlinePriorityHigh } from "react-icons/md";
import { IoFastFood } from "react-icons/io5";
import { GiLifeSupport } from "react-icons/gi";
import { TbPackages } from "react-icons/tb";
import { MdOutlineQuestionAnswer } from "react-icons/md";

export default function GroupsPage() {
  const groupTypes = [
    {
      title: "School & Youth Groups",
      color: "!border-blue-500",
      bgColor: "!bg-blue-50",
      description: "Ideal for field trips, summer camps, and youth programs.",
      features: [
        "Discounted admission for groups of 15 or more",
        "Optional STEM learning add-ons",
        "Meal vouchers or pre-arranged group lunches available",
        "Educational materials and guided tours",
        "Chaperone tickets at reduced rates"
      ]
    },
    {
      title: "Corporate & Team Events",
      color: "!border-purple-500",
      bgColor: "!bg-purple-50",
      description: "Perfect for team-building, employee appreciation, or client outings.",
      features: [
        "Private pavilions and meeting spaces",
        "Catering and hosted-package options",
        "Exclusive ride time (ERT) available for large groups",
        "Team-building activities and challenges",
        "Custom event planning support"
      ]
    },
    {
      title: "Celebrations & Parties",
      color: "!border-pink-500",
      bgColor: "!bg-pink-50",
      description: "For birthdays, reunions, or special occasions.",
      features: [
        "Celebration bundles with reserved seating",
        "Add-on FastPass options",
        "Group photo packages",
        "Dedicated party hosts",
        "Custom cake and catering options"
      ]
    }
  ];

  const benefits = [
    {
      icon: <MdDiscount />,
      title: "Discounted Rates",
      description: "Save on admission with group pricing for 15+ guests"
    },
    {
      icon: <MdOutlinePriorityHigh />,
      title: "Priority Access",
      description: "Skip the lines with FastPass add-ons and exclusive ride times"
    },
    {
      icon: <IoFastFood />,
      title: "Catering Options",
      description: "Pre-arranged meals, snacks, and dining packages available"
    },
    {
      icon: <GiLifeSupport />,
      title: "Dedicated Support",
      description: "Personal event coordinator to help plan every detail"
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
              Groups & Special Events
            </div>
            <h3 className="!text-4xl md:!text-5xl !font-black !mb-4 !text-[#176B87]">
              Group Visits & Special Events
            </h3>
            <p className="!text-xl !text-gray-700 !max-w-3xl !mx-auto">
              Velocity Valley welcomes groups of all sizes with discounted tickets, custom experiences,
              and dedicated support to help you plan the perfect visit.
            </p>
          </div>

          {/* Group Benefits */}
          <div className="!grid md:!grid-cols-2 lg:!grid-cols-4 !gap-6 !mb-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col items-center !border-2 !border-[#86B6F6] !bg-white !rounded-xl !shadow-lg !p-4 !text-center hover:!shadow-2xl !transition-all"
              >
                <div className="!text-3xl !text-[#86B6F6]">{benefit.icon}</div>
                <h3 className="!text-xl !font-bold !text-[#749BC2] !mb-2">
                  {benefit.title}
                </h3>
                <p className="!text-gray-700 !text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Group Types */}
          <div className="!space-y-6 !mb-12">
            {groupTypes.map((group, index) => (
              <div
                key={index}
                className={`!bg-white !rounded-2xl !shadow-lg !p-8 !border-l-4 ${group.color}`}
              >
                <div className="!flex !flex-col md:!flex-row md:!items-start md:!justify-between !mb-4">
                  <div className="!mb-4 md:!mb-0">
                    <h3 className="!text-3xl !font-bold !text-[#176B87] !mb-2">
                      {group.title}
                    </h3>
                    <p className="!text-lg !text-gray-700 !italic">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="!grid md:!grid-cols-2 !gap-4">
                  {group.features.map((feature, idx) => (
                    <div key={idx} className="!flex !items-start !gap-3">
                      <span className="!text-green-600 !font-bold !text-xl !mt-1">✓</span>
                      <span className="!text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Group Size Guide */}
          <div className=" !rounded-2xl !p-8 !mb-12 !shadow-lg !border-2 !border-[#86B6F6]">
            <h2 className="!text-3xl !font-bold !text-[#176B87] !mb-6 !text-center">
              Group Size Guidelines
            </h2>
            <div className="!grid md:!grid-cols-3 !gap-6">
              <div className="!bg-white !rounded-xl !p-6 !text-center !shadow-md">
                <div className="!text-4xl !font-black !text-[#176B87] !mb-2">
                  15-30
                </div>
                <div className="!font-bold !text-gray-700 !mb-2">Small Groups</div>
                <p className="!text-sm !text-gray-600">
                  Perfect for birthday parties, small school groups, or family reunions
                </p>
              </div>
              <div className="!bg-white !rounded-xl !p-6 !text-center !shadow-md">
                <div className="!text-4xl !font-black !text-[#176B87] !mb-2">
                  31-100
                </div>
                <div className="!font-bold !text-gray-700 !mb-2">Medium Groups</div>
                <p className="!text-sm !text-gray-600">
                  Ideal for corporate events, larger school trips, or community organizations
                </p>
              </div>
              <div className="!bg-white !rounded-xl !p-6 !text-center !shadow-md">
                <div className="!text-4xl !font-black !text-[#176B87] !mb-2">
                  100+
                </div>
                <div className="!font-bold !text-gray-700 !mb-2">Large Groups</div>
                <p className="!text-sm !text-gray-600">
                  Best for major corporate events, conferences, or large school districts
                </p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="!bg-white !rounded-2xl !p-8 !mb-12 !shadow-lg">
            <h2 className="!text-3xl flex  justify-center !font-bold !text-[#176B87] !mb-6 !text-center">
              <TbPackages className="!mr-3" /> What's Included with Group Packages
            </h2>
            <div className="!grid md:!grid-cols-2 !gap-8">
              <div>
                <h3 className="!text-xl !font-bold !text-[#176B87] !mb-4">Standard Package</h3>
                <ul className="!space-y-3">
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Discounted park admission</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Designated group check-in area</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Reserved picnic area (based on availability)</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Group event coordinator assistance</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Free parking for buses and vehicles</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="!text-xl !font-bold !text-[#176B87] !mb-4">Premium Add-Ons</h3>
                <ul className="!space-y-3">
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">FastPass wristbands for shorter wait times</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Catered meals and beverage packages</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Private cabanas or event spaces</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Exclusive ride time (ERT) before/after park hours</span>
                  </li>
                  <li className="!flex !items-start !gap-2">
                    <span className="!text-[#176B87] !font-bold">•</span>
                    <span className="!text-gray-700">Professional photography packages</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Booking & Contact */}
          <div className="!bg-gradient-to-r !from-[#176B87] !to-[#4682A9] !rounded-2xl !shadow-2xl !p-8 !text-white !mb-12">
            <div className="!text-center">
              <h2 className="!text-3xl !font-bold !mb-4">Booking & Contact</h2>
              <p className="!text-lg !mb-6 !text-gray-100">
                All group visits require advance reservation.
              </p>
              <p className="!text-xl !mb-8 !font-semibold !text-gray-100">
                To request rates or start planning, contact our Sales Team:
              </p>

              <div className="!grid md:!grid-cols-2 !gap-6 !mb-6 !max-w-3xl !mx-auto">
                <div className="!bg-white/10 !rounded-lg !p-6 backdrop-blur-sm">
                  <MdOutlineEmail className="!text-[30pt] !mb-3 !mx-auto" />
                  <h3 className="!font-bold !mb-2 !text-xl">Email Us</h3>
                  <a
                    href="mailto:groups@velocityvalley.com"
                    className="!text-[#AAE2FF] hover:!text-white !no-underline !text-lg !break-all"
                  >
                    sales@velocityvalley.com
                  </a>
                  <p className="!text-sm !text-gray-200 !mt-3">
                    We respond within 24-48 hours
                  </p>
                </div>

                <div className="!bg-white/10 !rounded-lg !p-6 backdrop-blur-sm">
                  <FaPhoneAlt className="!text-[25pt] !mb-3 !mx-auto" />
                  <h3 className="!font-bold !mb-2 !text-xl">Call Us</h3>
                  <a
                    href="tel:5555550199"
                    className="!text-[#AAE2FF] hover:!text-white !no-underline !text-lg"
                  >
                    (555) 555-0199
                  </a>
                  <p className="!text-sm !text-gray-200 !mt-3">
                    Mon-Fri: 9AM-5PM
                  </p>
                </div>
              </div>

              <div className="!bg-white/20 !rounded-lg !p-4 !max-w-2xl !mx-auto">
                <p className="!text-sm !text-gray-100">
                  💡 <strong>Tip:</strong> Book at least 2-3 weeks in advance for best availability.
                  Large groups (100+) should book 4-6 weeks ahead.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ for Groups */}
          <div className="!bg-white !rounded-xl !p-8 !shadow-lg">
            <h2 className="!text-3xl flex justify-center !font-bold !text-[#176B87] !text-center mb-3">
              <MdOutlineQuestionAnswer className="!mt-2 !mr-2" />Frequently Asked Questions
            </h2>
            <div className="!space-y-4">
              <div className="!border-b !border-gray-200">
                <h4 className="!font-bold !text-[#176B87] !mb-2">
                  How far in advance should I book?
                </h4>
                <p className="!text-gray-700">
                  We recommend booking 2-3 weeks in advance for groups of 15-50, and 4-6 weeks for groups over 50.
                </p>
              </div>
              <div className="!border-b !border-gray-200">
                <h4 className="!font-bold !text-[#176B87] !mb-2">
                  What is the minimum group size?
                </h4>
                <p className="!text-gray-700">
                  Groups must have a minimum of 15 paid attendees to qualify for group rates.
                </p>
              </div>
              <div className="!border-b !border-gray-200">
                <h4 className="!font-bold !text-[#176B87] !mb-2">
                  Can we bring our own food?
                </h4>
                <p className="!text-gray-700">
                  Groups with reserved picnic areas may bring outside food. Otherwise, catering packages are available.
                </p>
              </div>
              <div className="!border-b !border-gray-200 ">
                <h4 className="!font-bold !text-[#176B87] !mb-2">
                  What is Exclusive Ride Time (ERT)?
                </h4>
                <p className="!text-gray-700">
                  ERT allows your group private access to select attractions before or after regular park hours. Available for groups of 100+.
                </p>
              </div>
              <div>
                <h4 className="!font-bold !text-[#176B87] !mb-2">
                  What is your cancellation policy?
                </h4>
                <p className="!text-gray-700">
                  Cancellations made 14+ days before your visit receive a full refund. Cancellations within 14 days may incur a fee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
