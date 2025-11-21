import './Homepage.css'

export default function PageFooter(){
    return (
      <footer className="!bg-[#4682A9] !text-white">
        {/* Main Footer Content */}
        <div className="!max-w-7xl !mx-auto !px-6 !py-12">
          <div className="!grid md:!grid-cols-4 !gap-8">
            {/* About Section */}
            <div>
              <h4 className="!font-bold !mb-4 !text-[#AAE2FF]">Velocity Valley</h4>
              <div>
                <p className=" !text-[12pt] !text-white">📍 1450 Velocity Parkway</p>
                <p className=" !text-[12pt] !text-white">Aurora Springs, CO 80517</p>
                <p className="!text-[12pt] !text-white">📞 (555) 123-4567</p>
                <p className="!text-[12pt] !text-white">✉️ info@velocityvalley.com</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="!font-bold !mb-4 !text-[#AAE2FF]">Quick Links</h4>
              <ul className="!space-y-2 !text-[12pt]">
                <li>
                  <a href="/tickets" className=" hover:!text-white hover:!underline !transition-colors">
                    🎟️ Buy Tickets
                  </a>
                </li>
                <li>
                  <a href="/rides" className="hover:!text-white hover:!underline !transition-colors">
                    🎢 Our Rides
                  </a>
                </li>
                <li>
                  <a href="/events" className="hover:!text-white hover:!underline !transition-colors">
                    🎉 Events & Shows
                  </a>
                </li>
                <li>
                  <a href="/dining" className=" hover:!text-white hover:!underline !transition-colors">
                    🍔 Dining Options
                  </a>
                </li>
                <li>
                  <a href="/map" className="hover:!text-white hover:!underline !transition-colors">
                    🗺️ Park Map
                  </a>
                </li>
                <li>
                  <a href="/season-pass" className="hover:!text-white hover:!underline !transition-colors">
                    🎫 Season Passes
                  </a>
                </li>
              </ul>
            </div>

            {/* Visitor Info */}
            <div>
              <h4 className="!font-bold !mb-4 !text-[#AAE2FF]">Visitor Info</h4>
              <ul className="!space-y-2 !text-[12pt]">
                <li>
                  <a href="/hours" className="hover:!text-white hover:!underline !transition-colors">
                    🕐 Park Hours
                  </a>
                </li>
                <li>
                  <a href="/parking" className=" hover:!text-white hover:!underline !transition-colors">
                    🅿️ Parking Information
                  </a>
                </li>
                <li>
                  <a href="/accessibility" className=" hover:!text-white hover:!underline !transition-colors">
                    ♿ Accessibility
                  </a>
                </li>
                <li>
                  <a href="/safety" className=" hover:!text-white hover:!underline !transition-colors">
                    🛡️ Safety Guidelines
                  </a>
                </li>
                <li>
                  <a href="/faq" className="hover:!text-white hover:!underline !transition-colors">
                    ❓ FAQ
                  </a>
                </li>
                <li>
                  <a href="/groups" className="hover:!text-white hover:!underline !transition-colors">
                    👥 Group Visits
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us & Parking */}
            <div>
              <h4 className=" !font-bold !mb-4 !text-[#AAE2FF]">Follow Us</h4>
              <div className="!flex justify-center !gap-3 !mb-6">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!w-10 !h-10 !bg-white/10 hover:!bg-white/20 !rounded-full !flex !items-center !justify-center !transition-all hover:!scale-110"
                  aria-label="Facebook"
                >
                  <svg className="!w-5 !h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!w-10 !h-10 !bg-white/10 hover:!bg-white/20 !rounded-full !flex !items-center !justify-center !transition-all hover:!scale-110"
                  aria-label="Instagram"
                >
                  <svg className="!w-5 !h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!w-10 !h-10 !bg-white/10 hover:!bg-white/20 !rounded-full !flex !items-center !justify-center !transition-all hover:!scale-110"
                  aria-label="Twitter"
                >
                  <svg className="!w-5 !h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!w-10 !h-10 !bg-white/10 hover:!bg-white/20 !rounded-full !flex !items-center !justify-center !transition-all hover:!scale-110"
                  aria-label="YouTube"
                >
                  <svg className="!w-5 !h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>

              <div className="!bg-white/10 !rounded-lg !p-4 !mt-4">
                <h4 className="!font-semibold !mb-2 !flex !items-center !gap-2">
                  🅿️Parking
                </h4>
                <p className="!text-xs !text-gray-200 !leading-relaxed">
                  Free parking available! Over 5,000 spots including preferred parking,
                  accessible spaces, and electric vehicle charging stations.
                </p>
                <a
                  href="/parking"
                  className="!text-xs !text-[#86B6F6] hover:!text-white !underline !mt-2 !inline-block"
                >
                  View Parking Details →
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="!mt-12 !pt-8 !border-t !border-white/20">
            <div className="!text-center !max-w-2xl !mx-auto">
              <h3 className="!text-xl !font-bold !mb-3">🎊 Stay Updated with Park News!</h3>
              <p className="!text-[16px] !text-gray-200 !mb-4">
                Get exclusive offers, event announcements, and special promotions delivered to your inbox.
              </p>
              <div className="!flex !gap-2 !max-w-md !mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="!flex-1 !px-4 !py-2 !rounded-lg !bg-white/10 !border !border-white/30 !text-white placeholder:!text-gray-300 focus:!outline-none focus:!border-[#86B6F6]"
                />
                <button className="!px-6 !py-2 !bg-[#91C8E4] hover:!bg-[#B4D4FF] !text-[#176B87] !font-bold !rounded-lg !transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="!bg-[#749BC2] !py-4">
          <div className="!max-w-7xl !mx-auto !px-6">
            <div className="!flex !flex-col md:!flex-row !justify-between !items-center !gap-4 !text-sm">
              <div>
                © {new Date().getFullYear()} Velocity Valley Theme Park • 3380 Project • All Rights Reserved
              </div>
              <div className="!flex !gap-6 !flex-wrap !justify-center">
                <a href="/privacy" className="hover:!text-white !transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:!text-white !transition-colors">Terms of Service</a>
                <a href="/careers" className="hover:!text-white !transition-colors">Careers</a>
                <a href="/contact" className="hover:!text-white !transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
}