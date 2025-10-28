import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { fetchCurrentCustomer, updateCustomer } from "../../../services/api";

export default function UserInfoPage() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });

  // Fetch customer data from backend
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const customer = await fetchCurrentCustomer();

        if (!customer) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        setCustomerData(customer);
        setForm({
          first_name: customer.first_name || "",
          last_name: customer.last_name || "",
          email: customer.email || "",
          phone: customer.phone || "",
          gender: customer.gender || "",
          dob: customer.dob ? customer.dob.split('T')[0] : "",
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const updatedCustomer = await updateCustomer(customerData.customer_id, form);
      alert("Changes saved successfully!");

      // Refresh the data
      setCustomerData(updatedCustomer);
    } catch (err) {
      console.error("Error saving customer data:", err);
      alert(`Error saving changes: ${err.message}`);
    }
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
          <button
            onClick={() => navigate("/")}
            className="!text-2xl !font-extrabold !tracking-wide !text-[#176B87] hover:!opacity-80 !transition !bg-transparent !border-none"
          >
            🎢 ThemePark
          </button>
          <div className="!flex !items-center !gap-3">
            <span className="!hidden sm:!inline !text-sm !text-slate-700">
              Signed in as <strong>{user?.email}</strong>
            </span>
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

      {/* Content */}
      <main className="!flex !flex-1 !max-w-6xl !mx-auto !w-full !p-6 !gap-6">
        {/* Left Sidebar Tabs */}
        <aside className="!w-1/4 !bg-white/70 !rounded-xl !shadow !p-4 !flex !flex-col !gap-3">
          <button
            onClick={() => setActiveTab("info")}
            className={`!py-2 !px-4 !rounded-md !font-semibold ${
              activeTab === "info"
                ? "!bg-[#176B87] !text-white !border-none"
                : "!bg-white !border !border-[#B4D4FF] !text-[#176B87] hover:!bg-[#EEF5FF]"
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`!py-2 !px-4 !rounded-md !font-semibold ${
              activeTab === "orders"
                ? "!bg-[#176B87] !text-white !border-none"
                : "!bg-white !border !border-[#B4D4FF] !text-[#176B87] hover:!bg-[#EEF5FF]"
            }`}
          >
            Order History
          </button>
        </aside>

        {/* Right Content */}
        <section className="!flex-1 !bg-white/70 !rounded-xl !shadow !p-6">
          {activeTab === "info" ? (
            <>
              {loading && (
                <div className="!text-center !py-10">
                  <p className="!text-lg !text-[#176B87]">Loading customer information...</p>
                </div>
              )}

              {error && (
                <div className="!bg-red-100 !border !border-red-400 !text-red-700 !px-4 !py-3 !rounded !mb-6">
                  <p>Error: {error}</p>
                </div>
              )}

              {!loading && !error && (
                <form onSubmit={handleSave} className="!space-y-4">
                  <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-4">
                    Personal Information
                  </h2>

                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    <div>
                      <label className="!block !text-sm !font-semibold !text-slate-700">
                        First Name
                      </label>
                      <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="!w-full !p-3 !rounded-lg !border !border-[#B4D4FF]"
                      />
                    </div>
                    <div>
                      <label className="!block !text-sm !font-semibold !text-slate-700">
                        Last Name
                      </label>
                      <input
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="!w-full !p-3 !rounded-lg !border !border-[#B4D4FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="!block !text-sm !font-semibold !text-slate-700">
                      Email
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      type="email"
                      className="!w-full !p-3 !rounded-lg !border !border-[#B4D4FF]"
                    />
                  </div>

                  <div>
                    <label className="!block !text-sm !font-semibold !text-slate-700">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      type="tel"
                      className="!w-full !p-3 !rounded-lg !border !border-[#B4D4FF]"
                    />
                  </div>

                  <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                    <div>
                      <label className="!block !text-sm !font-semibold !text-slate-700">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="!w-full !p-3 !rounded-lg !border !border-[#B4D4FF]"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="!block !text-sm !font-semibold !text-slate-700">
                        Date of Birth
                      </label>
                      <input
                        name="dob"
                        value={form.dob}
                        onChange={handleChange}
                        type="date"
                        className="!w-full !p-3 !rounded-lg !border !border-[#B4D4FF]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="!mt-4 !px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none"
                  >
                    Save Changes
                  </button>
                </form>
              )}
            </>
          ) : (
            <div>
              <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-4">
                Order History
              </h2>
              <table className="!w-full !border !border-[#B4D4FF] !text-left !rounded-md !overflow-hidden">
                <thead className="!bg-[#B4D4FF] !text-white">
                  <tr>
                    <th className="!px-4 !py-2">Order ID</th>
                    <th className="!px-4 !py-2">Date</th>
                    <th className="!px-4 !py-2">Total</th>
                    <th className="!px-4 !py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="!bg-white/80">
                    <td className="!px-4 !py-2">#0001</td>
                    <td className="!px-4 !py-2">2025-10-20</td>
                    <td className="!px-4 !py-2">$42.50</td>
                    <td className="!px-4 !py-2">Completed</td>
                  </tr>
                  <tr className="!bg-white">
                    <td className="!px-4 !py-2">#0002</td>
                    <td className="!px-4 !py-2">2025-10-10</td>
                    <td className="!px-4 !py-2">$15.00</td>
                    <td className="!px-4 !py-2">Completed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
