import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useAuth } from "./AuthContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { fetchCurrentCustomer, updateCustomer, api } from "../../../services/api";

export default function UserInfoPage() {
const { user, signout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [rideOrders, setRideOrders] = useState([]);
  const [storeOrders, setStoreOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
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
          // Clear AuthContext user state as well
          signout();
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
        // If there's an authentication error, sign out
        if (err.message.includes("token") || err.message.includes("authentication")) {
          signout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user, signout]);

  // Fetch orders when Orders tab is active
  useEffect(() => {
  if (activeTab === 'orders') {
  const fetchOrders = async () => {
  setOrdersLoading(true);
  try {
  const [rideOrderData, storeOrderData] = await Promise.all([
    api.getRideOrders(),
      api.getStoreOrders()
  ]);
  setRideOrders(rideOrderData);
  setStoreOrders(storeOrderData);
  } catch (err) {
  console.error('Error fetching orders:', err);
    // If authentication error, sign out
  if (err.message.includes("token") || err.message.includes("authentication")) {
      signout();
      }
    } finally {
        setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, signout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const updatedCustomer = await updateCustomer(customerData.customer_id, form);
      toast({
        title: 'Changes saved successfully!',
        description: 'Your personal information has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      // Refresh the data
      setCustomerData(updatedCustomer);
    } catch (err) {
      console.error("Error saving customer data:", err);
      // If authentication error, sign out
      if (err.message.includes("token") || err.message.includes("authentication")) {
        signout();
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: 'Error saving changes',
          description: err.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
      }
    }
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
      {/* Navbar is now global in App.jsx */}

      {/* Content */}
      <main className="!flex !flex-1 !max-w-6xl !mx-auto !w-full !p-6 !gap-6 ">
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
            <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-6">
            📦 Order History
            </h2>

            {ordersLoading ? (
            <div className="!text-center !py-10">
            <p className="!text-lg !text-[#176B87]">Loading orders...</p>
            </div>
            ) : (rideOrders.length === 0 && storeOrders.length === 0) ? (
            <div className="!text-center !py-10 !bg-white/50 !rounded-xl">
            <p className="!text-lg !text-gray-500 !mb-4">No orders yet!</p>
            <div className="!flex !gap-4 !justify-center">
            <button
              onClick={() => navigate('/tickets')}
                className="!px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none"
            >
                🎢 Browse Rides
                </button>
                  <button
                  onClick={() => navigate('/stores')}
                className="!px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none"
            >
            🛍️ Shop Stores
            </button>
            </div>
            </div>
            ) : (
            <div className="!space-y-6">
            {/* Ride Orders */}
            {rideOrders.length > 0 && (
            <div>
            <h3 className="!text-xl !font-bold !text-[#176B87] !mb-4">🎢 Ride Tickets</h3>
            <div className="!space-y-4">
            {rideOrders.map((order) => (
            <div
            key={order.order_id}
              className="!bg-white !rounded-xl !shadow-md !p-6 !border !border-[#B4D4FF] hover:!shadow-lg !transition"
              >
                <div className="!flex !justify-between !items-start !mb-4">
                <div>
                <h4 className="!text-lg !font-bold !text-[#176B87]">
                    Order #{order.order_id}
                  </h4>
                <p className="!text-sm !text-gray-600">
                {new Date(order.order_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                    })}
                </p>
                </div>
                  <div className="!text-right">
                      <p className="!text-2xl !font-bold !text-[#176B87]">
                                  ${parseFloat(order.total_amount).toFixed(2)}
                      </p>
                    <span className={`!inline-block !px-3 !py-1 !rounded-full !text-sm !font-semibold ${
                      order.status === 'completed'
                      ? '!bg-green-100 !text-green-800'
                    : order.status === 'pending'
                  ? '!bg-yellow-100 !text-yellow-800'
                : '!bg-red-100 !text-red-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            </div>
            </div>

                <div className="!border-t !border-gray-200 !pt-4">
                    <h5 className="!font-semibold !text-gray-700 !mb-2">Ride Tickets:</h5>
                      <ul className="!space-y-2">
                          {order.items.map((item, idx) => (
                              <li key={idx} className="!flex !justify-between !text-sm">
                                  <span className="!text-gray-700">
                                      {item.ride_name} × {item.number_of_tickets}
                                    </span>
                                    <span className="!font-semibold !text-[#176B87]">
                                      ${parseFloat(item.subtotal).toFixed(2)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Store Orders */}
                  {storeOrders.length > 0 && (
                    <div>
                      <h3 className="!text-xl !font-bold !text-[#176B87] !mb-4">🛍️ Store Purchases</h3>
                      <div className="!space-y-4">
                        {storeOrders.map((order) => (
                          <div
                            key={order.store_order_id}
                            className="!bg-white !rounded-xl !shadow-md !p-6 !border !border-[#B4D4FF] hover:!shadow-lg !transition"
                          >
                            <div className="!flex !justify-between !items-start !mb-4">
                              <div>
                                <h4 className="!text-lg !font-bold !text-[#176B87]">
                                  Order #{order.store_order_id}
                                </h4>
                                <p className="!text-sm !text-gray-600">
                                  {order.store_name} • {new Date(order.order_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                                <p className="!text-xs !text-gray-500">Paid by {order.payment_method.replace('_', ' ')}</p>
                              </div>
                              <div className="!text-right">
                                <p className="!text-2xl !font-bold !text-[#176B87]">
                                  ${parseFloat(order.total_amount).toFixed(2)}
                                </p>
                                <span className={`!inline-block !px-3 !py-1 !rounded-full !text-sm !font-semibold ${
                                  order.status === 'completed'
                                    ? '!bg-green-100 !text-green-800'
                                    : order.status === 'pending'
                                    ? '!bg-yellow-100 !text-yellow-800'
                                    : '!bg-red-100 !text-red-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="!border-t !border-gray-200 !pt-4">
                              <h5 className="!font-semibold !text-gray-700 !mb-2">Items Purchased:</h5>
                              <ul className="!space-y-2">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="!flex !justify-between !text-sm">
                                    <span className="!text-gray-700">
                                      {item.item_name} × {item.quantity}
                                    </span>
                                    <span className="!font-semibold !text-[#176B87]">
                                      ${parseFloat(item.subtotal).toFixed(2)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
