import React, { useState } from "react";
import "../customer/Homepage.css";
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

export default function FaqPage() {
  const [openCategory, setOpenCategory] = useState(null);
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqCategories = [
    {
      title: "Tickets & Entry",
      color: "!border-purple-500",
      questions: [
        {
          q: "Can I buy tickets online?",
          a: "Yes. Tickets can be purchased on our website or at the front gate."
        },
        {
          q: "Do you offer student, group, or military discounts?",
          a: "Yes! Discounts are available with valid ID at the ticket booth."
        },
        {
          q: "What's included with park admission?",
          a: "Park admission includes access to all rides and attractions. Food, beverages, and merchandise are sold separately."
        },
        {
          q: "Can I get a refund on my ticket?",
          a: "Tickets are non-refundable but can be rescheduled up to 24 hours before your visit date."
        }
      ]
    },
    {
      title: "Park Hours",
      color: "!border-blue-500",
      questions: [
        {
          q: "What time does the park open and close?",
          a: "Velocity Valley typically operates 10:00 AM – 9:00 PM, with extended hours during holidays. Check our Hours page for the most current schedule."
        },
        {
          q: "What happens if it rains?",
          a: "Outdoor rides may temporarily close for guest safety. They will reopen once conditions improve. Indoor attractions remain open during rain."
        },
        {
          q: "Are you open year-round?",
          a: "Yes! Velocity Valley is open 365 days a year, including major holidays."
        },
        {
          q: "What time should I arrive?",
          a: "We recommend arriving 30-45 minutes before park opening to allow time for parking and security screening."
        }
      ]
    },
    {
      title: "Parking",
      color: "!border-green-500",
      questions: [
        {
          q: "Is parking free?",
          a: "General parking is free. Preferred parking is available for an additional fee of $15."
        },
        {
          q: "Can I leave and re-enter the park?",
          a: "Yes — get your hand stamped at the exit and show it along with your ticket for re-entry."
        },
        {
          q: "Do you have electric vehicle charging?",
          a: "Yes! We have 50+ EV charging stations available for free with park admission."
        },
        {
          q: "Where should I park if I have accessibility needs?",
          a: "Accessible parking is located in Section A, closest to the main entrance. These spots are free with a valid accessibility permit."
        }
      ]
    },
    {
      title: "Food & Drink",
      color: "!border-orange-500",
      questions: [
        {
          q: "Can I bring outside food into the park?",
          a: "Only sealed water bottles and medically necessary items are allowed. Full meals must be purchased inside the park."
        },
        {
          q: "Do you have vegetarian, vegan, or allergy-friendly options?",
          a: "Yes — most dining locations offer diverse menu choices including vegetarian, vegan, and gluten-free options. Ask staff for assistance."
        },
        {
          q: "Are there water fountains in the park?",
          a: "Yes, water fountains and bottle refill stations are located throughout the park."
        },
        {
          q: "Can I bring a reusable water bottle?",
          a: "Absolutely! We encourage bringing reusable bottles. Refill stations are available in all zones."
        }
      ]
    },
    {
      title: "Rides & Attractions",
      color: "!border-red-500",
      questions: [
        {
          q: "What if a ride is closed?",
          a: "Rides may close for maintenance or weather. Check the Velocity Valley app for live updates on ride status."
        },
        {
          q: "Are rides safe for people with medical conditions?",
          a: "Some attractions may not be appropriate for guests with certain medical conditions. Check posted signs or ask staff if you're unsure."
        },
        {
          q: "Is there a height requirement?",
          a: "Yes. Each ride lists its height requirements at the entrance and on our website/app. Height is measured with shoes on."
        },
        {
          q: "Can I use my phone on rides?",
          a: "No. All loose items including phones must be secured in pockets or stored in lockers before boarding."
        },
        {
          q: "Are there lockers available?",
          a: "Yes, free lockers are available near all major attractions for storing loose items."
        }
      ]
    },
    {
      title: "Children & Families",
      color: "!border-pink-500",
      questions: [
        {
          q: "Do you have stroller rentals?",
          a: "Yes — strollers are available for rent near the main entrance for $10/day."
        },
        {
          q: "Are there family restrooms?",
          a: "Yes — family restrooms with changing tables are located in each major zone."
        },
        {
          q: "Can I bring my baby on rides?",
          a: "Only on designated family rides. Check signs for age and height restrictions at each attraction."
        },
        {
          q: "Is there a nursing room?",
          a: "Yes, a quiet nursing room is available at Guest Services in the Main Hub."
        },
        {
          q: "What if my child gets lost?",
          a: "Immediately notify the nearest staff member or visit Guest Services. We recommend taking a photo of your child at the entrance and establishing a meeting point."
        }
      ]
    },
    {
      title: "Service Animals",
      color: "!border-teal-500",
      questions: [
        {
          q: "Are service animals allowed?",
          a: "Yes — certified service animals are welcome throughout the park."
        },
        {
          q: "Can service animals go on rides?",
          a: "Some attractions may prohibit animals for safety reasons. Ask the ride operator for specific guidelines."
        },
        {
          q: "Are emotional support animals allowed?",
          a: "Only certified service animals trained to perform specific tasks are permitted. Emotional support animals are not allowed."
        }
      ]
    },
    {
      title: "Lost & Found",
      color: "!border-indigo-500",
      questions: [
        {
          q: "What if I lose something?",
          a: "Visit Lost & Found at Guest Services in the Main Hub or submit a claim through the Velocity Valley app."
        },
        {
          q: "How long do you keep lost items?",
          a: "Items are held for 30 days. Valuable items (phones, wallets, jewelry) are held for 90 days."
        },
        {
          q: "Can I check for lost items online?",
          a: "Yes, check our Lost & Found database on the website or app, updated daily."
        }
      ]
    },
    {
      title: "Accessibility",
      color: "!border-cyan-500",
      questions: [
        {
          q: "Are all attractions wheelchair accessible?",
          a: "Most attractions are accessible. Some rides require the ability to transfer from wheelchair to ride vehicle. Check our accessibility guide for details."
        },
        {
          q: "Do you rent wheelchairs or ECVs?",
          a: "Yes, wheelchairs ($15/day) and electric convenience vehicles ($30/day) are available for rent at the main entrance."
        },
        {
          q: "Is there an accessibility pass for shorter wait times?",
          a: "Yes, guests with disabilities can request an Accessibility Pass at Guest Services for alternative queue access."
        }
      ]
    },
    {
      title: "Payment & Purchases",
      color: "!border-yellow-500",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept cash, credit/debit cards, Apple Pay, and Google Pay throughout the park."
        },
        {
          q: "Is there an ATM in the park?",
          a: "Yes, ATMs are located at the Main Hub, Quantum Loop District, and near the South Exit."
        },
        {
          q: "Can I get a season pass?",
          a: "Yes! Season passes are available for purchase online or at the ticket booth with various benefit levels."
        }
      ]
    }
  ];

  const toggleCategory = (index) => {
    if (openCategory === index) {
      setOpenCategory(null);
      setOpenQuestion(null);
    } else {
      setOpenCategory(index);
      setOpenQuestion(null);
    }
  };

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenQuestion(openQuestion === key ? null : key);
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
      {/* Main Content */}
      <main className="!flex-1 !relative">
        <div className="!max-w-5xl !mx-auto !px-6 !py-6">
          {/* Header Section */}
          <div className="!text-center !mb-12">
            <div className="!inline-block !px-6 !py-3 !bg-[#4682A9] !rounded-full !text-white !font-semibold !mb-6 !shadow-lg">
              Need Help?
            </div>
             <h3 className="!text-4xl md:!text-5xl !font-black !mb-4 !text-[#176B87]">
             Frequently Asked Questions
            </h3>
            <p className="!text-xl !text-gray-700 !max-w-2xl !mx-auto">
              Find answers to common questions about tickets, rides, parking, and more!
            </p>
          </div>

          {/* Quick Search Tip */}
          <div className="!bg-white !rounded-xl !p-4 !shadow-lg !mb-8 !text-center">
            <p className="!text-gray-700">
              💡 <strong className="!text-[#176B87]">Tip:</strong> Use Ctrl+F (or Cmd+F on Mac) to search for keywords on this page
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="!space-y-4">
            {faqCategories.map((category, catIndex) => (
              <div
                key={catIndex}
                className="!bg-white !rounded-xl !shadow-lg !overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(catIndex)}
                  className={`!w-full !flex !items-center !justify-between !p-6 !transition-all hover:!bg-[#EEF5FF] !border-l-4 ${category.color} !border-none !cursor-pointer !text-left`}
                >
                  <div className="!flex !items-center !gap-4">
                    <h3 className="!text-2xl !font-bold !text-[#176B87]">
                      {category.title}
                    </h3>
                  </div>
                  <span className="!text-3xl !text-gray-400">
                    {openCategory === catIndex ? "−" : "+"}
                  </span>
                </button>

                {/* Questions List */}
                {openCategory === catIndex && (
                  <div className="!border-t !border-gray-200">
                    {category.questions.map((item, qIndex) => (
                      <div key={qIndex} className="!border-b !border-gray-200 last:!border-b-0">
                        {/* Question */}
                        <button
                          onClick={() => toggleQuestion(catIndex, qIndex)}
                          className="!w-full !flex !items-center !justify-between !p-5 !pl-16 hover:!bg-[#EEF5FF] !transition-colors !border-none !cursor-pointer !text-left"
                        >
                          <span className="!font-semibold !text-gray-700 !pr-4">
                            Q: {item.q}
                          </span>
                          <span className="!text-xl !text-gray-400 !flex-shrink-0">
                            {openQuestion === `${catIndex}-${qIndex}` ? "▼" : "▶"}
                          </span>
                        </button>

                        {/* Answer */}
                        {openQuestion === `${catIndex}-${qIndex}` && (
                          <div className="!bg-[#EEF5FF] !p-5 !pl-16">
                            <p className="!text-gray-700">
                              <strong className="!text-[#176B87]">A:</strong> {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions Section */}
          <div className="!mt-12 !bg-gradient-to-r !from-[#176B87] !to-[#4682A9] !rounded-2xl !shadow-2xl !p-8 !text-white">
            <div className="!text-center">
              <h2 className="!text-3xl !font-bold !mb-4">Still Have Questions?</h2>
              <p className="!text-lg !mb-6 !text-gray-100">
                Can't find what you're looking for? Our Guest Services team is here to help!
              </p>

              <div className="!grid md:!grid-cols-3 !gap-6 !mb-6">
                <div className="!bg-white/10 flex flex-col items-center justify-between !rounded-lg !p-6 backdrop-blur-sm">
                  <FaPhoneAlt className='mb-2 !text-[17pt]'/>
                  <h3 className="!font-bold !mb-2">Call Us</h3>
                  <a href="tel:5551234567" className="!text-[#AAE2FF] hover:!text-white !no-underline">
                    (555) 123-4567
                  </a>
                  <p className="!text-sm !text-gray-200 !mt-2">Mon-Sun: 8AM-10PM</p>
                </div>

                <div className="!bg-white/10 flex flex-col items-center !rounded-lg !p-6 backdrop-blur-sm">
                  <MdOutlineEmail className='mb-2 !text-[20pt]'/>
                  <h3 className="!font-bold !mb-2">Email Us</h3>
                  <a href="mailto:info@velocityvalley.com" className="!text-[#AAE2FF] hover:!text-white !no-underline !break-all">
                    info@velocityvalley.com
                  </a>
                  <p className="!text-sm !text-gray-200 !mt-2">We respond within 24 hours</p>
                </div>

                <div className="!bg-white/10 !rounded-lg flex flex-col items-center justify-between !p-6 backdrop-blur-sm">
                  <IoChatbubbleEllipsesSharp className='mb-2 !text-[17pt]' />
                  <h3 className="!font-bold !mb-2">Live Chat</h3>
                  <button className="!text-[#AAE2FF] hover:!text-white !bg-transparent !border-none !cursor-pointer">
                    Start Chat →
                  </button>
                  <p className="!text-sm !text-gray-200 !mt-2">Available during park hours</p>
                </div>
              </div>

              <div className="!flex !flex-wrap !justify-center !gap-4">
                <a
                  href="/map"
                  className="!px-6 !py-3 !bg-white !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#AAE2FF] !transition-colors !no-underline"
                >
                  View Park Map
                </a>
                <a
                  href="/safety"
                  className="!px-6 !py-3 !bg-white !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#AAE2FF] !transition-colors !no-underline"
                >
                  Safety Guidelines
                </a>
                <a
                  href="/hours"
                  className="!px-6 !py-3 !bg-white !text-[#176B87] !font-bold !rounded-lg hover:!bg-[#AAE2FF] !transition-colors !no-underline"
                >
                  Park Hours
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
