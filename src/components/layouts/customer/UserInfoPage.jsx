import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useAuth } from "./AuthContext";
import PageFooter from "./PageFooter";
import Loading from '../admin/loading/Loading'
import "./Homepage.css";
import {
  fetchCurrentCustomer,
  updateCustomer,
  changeCustomerPassword,
  api,
} from "../../../services/api";

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
  const [ordersError, setOrdersError] = useState(null);

  // New: date range for order history filter
  const [dateRange, setDateRange] = useState("all"); // "all" | "today" | "7d" | "month"

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
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
          dob: customer.dob ? customer.dob.split("T")[0] : "",
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError(err.message);
        // If there's an authentication error, sign out
        if (
          err.message.includes("token") ||
          err.message.includes("authentication")
        ) {
          signout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user, signout]);

  // Fetch orders when Orders tab is active OR dateRange changes
  useEffect(() => {
    if (activeTab !== "orders") return;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const [rideOrderData, storeOrderData] = await Promise.all([
          api.getRideOrders(dateRange),
          api.getStoreOrders(dateRange),
        ]);
        setRideOrders(rideOrderData);
        setStoreOrders(storeOrderData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrdersError(err.message || "Failed to load orders.");
        // If authentication error, sign out
        if (
          err.message.includes("token") ||
          err.message.includes("authentication")
        ) {
          signout();
        }
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, dateRange, signout]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, "");

    // Format as XXX-XXX-XXXX when complete
    if (phoneNumber.length === 10) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(
        3,
        6
      )}-${phoneNumber.slice(6, 10)}`;
    } else {
      return phoneNumber;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Apply phone formatting if it's the phone field
    if (name === "phone") {
      const formatted = formatPhoneNumber(value);
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const updatedCustomer = await updateCustomer(
        customerData.customer_id,
        form
      );
      toast({
        title: "Changes saved successfully!",
        description: "Your personal information has been updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      // Refresh the data
      setCustomerData(updatedCustomer);
    } catch (err) {
      console.error("Error saving customer data:", err);
      // If authentication error, sign out
      if (
        err.message.includes("token") ||
        err.message.includes("authentication")
      ) {
        signout();
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Error saving changes",
          description: err.message,
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: "Same password",
        description: "New password must be different from current password",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeCustomerPassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast({
        title: "Success!",
        description: "Password changed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
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
          <button
            onClick={() => setActiveTab("password")}
            className={`!py-2 !px-4 !rounded-md !font-semibold ${
              activeTab === "password"
                ? "!bg-[#176B87] !text-white !border-none"
                : "!bg-white !border !border-[#B4D4FF] !text-[#176B87] hover:!bg-[#EEF5FF]"
            }`}
          >
            Change Password
          </button>
        </aside>

        {/* Right Content */}
        <section className="!flex-1 !bg-white/70 !rounded-xl !shadow !p-6">
          {activeTab === "info" ? (
            <>
              {loading && (
                <div className="!text-center !py-10">
                  <Loading />
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
                    👤Personal Information
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
                      disabled
                      style={{ backgroundColor: "#91C8E4" }}
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
                      maxLength="10"
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
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="!block !text-sm !font-semibold !text-slate-700">
                        Date of Birth
                      </label>
                      <input
                        name="dob"
                        value={form.dob}
                        disabled
                        style={{ backgroundColor: "#91C8E4" }}
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
          ) : activeTab === "orders" ? (
            <div>
              <div className="!flex !justify-between !items-center !mb-6">
                <h2 className="!text-2xl !font-bold !text-[#176B87]">
                  📦 Order History
                </h2>

                {/* Date Range Filter */}
                <div className="!flex !items-center !gap-2">
                  <label className="!text-sm !font-semibold !text-slate-700">
                    Show:
                  </label>
                  <select
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    className="!px-3 !py-2 !rounded-lg !border !border-[#B4D4FF] !bg-white !text-slate-800"
                  >
                    <option value="all">All time</option>
                    <option value="today">Today</option>
                    <option value="7d">Last 7 days</option>
                    <option value="month">Last month</option>
                  </select>
                </div>
              </div>

              {ordersError && (
                <div className="!bg-red-100 !border !border-red-400 !text-red-700 !px-4 !py-3 !rounded !mb-4">
                  <p>{ordersError}</p>
                </div>
              )}

              {ordersLoading ? (
                <div className="!text-center !py-10">
                  <p className="!text-lg !text-[#176B87]">Loading orders...</p>
                </div>
              ) : rideOrders.length === 0 && storeOrders.length === 0 ? (
                <div className="!text-center !py-10 !bg-white/50 !rounded-xl">
                  <p className="!text-lg !text-gray-500 !mb-4">
                    No orders in this period!
                  </p>
                  <div className="!flex !gap-4 !justify-center">
                    <button
                      onClick={() => navigate("/tickets")}
                      className="!px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none"
                    >
                      🎢 Browse Rides
                    </button>
                    <button
                      onClick={() => navigate("/stores")}
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
                      <h3 className="!text-xl !font-bold !text-[#176B87] !mb-4">
                        🎢 Ride Tickets
                      </h3>
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
                                  {new Date(
                                    order.order_date
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="!text-right">
                                <p className="!text-2xl !font-bold !text-[#176B87]">
                                  $
                                  {parseFloat(
                                    order.total_amount
                                  ).toFixed(2)}
                                </p>
                                <span
                                  className={`!inline-block !px-3 !py-1 !rounded-full !text-sm !font-semibold ${
                                    order.status === "completed"
                                      ? "!bg-green-100 !text-green-800"
                                      : order.status === "pending"
                                      ? "!bg-yellow-100 !text-yellow-800"
                                      : "!bg-red-100 !text-red-800"
                                  }`}
                                >
                                  {order.status
                                    .charAt(0)
                                    .toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="!border-t !border-gray-200 !pt-4">
                              <h5 className="!font-semibold !text-gray-700 !mb-2">
                                Ride Tickets:
                              </h5>
                              <ul className="!space-y-2">
                                {order.items.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="!flex !justify-between !items-start !text-sm"
                                  >
                                    <div className="!flex-1">
                                      <span className="!text-gray-700 !font-medium">
                                        {item.ride_name}
                                      </span>
                                      <div className="!text-xs !text-gray-500 !mt-1">
                                        $
                                        {parseFloat(
                                          item.price_per_ticket
                                        ).toFixed(2)}{" "}
                                        each × {item.number_of_tickets}
                                      </div>
                                    </div>
                                    <span className="!font-semibold !text-[#176B87]">
                                      $
                                      {parseFloat(
                                        item.subtotal
                                      ).toFixed(2)}
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
                      <h3 className="!text-xl !font-bold !text-[#176B87] !mb-4">
                        🛍️ Store Purchases
                      </h3>
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
                                  {order.store_name} •{" "}
                                  {new Date(
                                    order.order_date
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="!text-xs !text-gray-500">
                                  Paid by{" "}
                                  {order.payment_method.replace("_", " ")}
                                </p>
                              </div>
                              <div className="!text-right">
                                <p className="!text-2xl !font-bold !text-[#176B87]">
                                  $
                                  {parseFloat(
                                    order.total_amount
                                  ).toFixed(2)}
                                </p>
                                <span
                                  className={`!inline-block !px-3 !py-1 !rounded-full !text-sm !font-semibold ${
                                    order.status === "completed"
                                      ? "!bg-green-100 !text-green-800"
                                      : order.status === "pending"
                                      ? "!bg-yellow-100 !text-yellow-800"
                                      : "!bg-red-100 !text-red-800"
                                  }`}
                                >
                                  {order.status
                                    .charAt(0)
                                    .toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="!border-t !border-gray-200 !pt-4">
                              <h5 className="!font-semibold !text-gray-700 !mb-2">
                                Items Purchased:
                              </h5>
                              <ul className="!space-y-2">
                                {order.items.map((item, idx) => (
                                  <li
                                    key={idx}
                                    className="!flex !justify-between !items-start !text-sm"
                                  >
                                    <div className="!flex-1">
                                      <span className="!text-gray-700 !font-medium">
                                        {item.item_name}
                                      </span>
                                      <div className="!text-xs !text-gray-500 !mt-1">
                                        $
                                        {parseFloat(
                                          item.price_per_item
                                        ).toFixed(2)}{" "}
                                        each × {item.quantity}
                                      </div>
                                    </div>
                                    <span className="!font-semibold !text-[#176B87]">
                                      $
                                      {parseFloat(
                                        item.subtotal
                                      ).toFixed(2)}
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
          ) : activeTab === "password" ? (
            <div>
              <h2 className="!text-2xl !font-bold !text-[#176B87] !mb-6">
                🛡️ Change Password
              </h2>
              <form
                onSubmit={handlePasswordChange}
                className="!max-w-xl !space-y-4"
              >
                <div>
                  <label className="!block !text-sm !font-semibold !text-slate-700 !mb-2">
                    Current Password
                  </label>
                  <div className="!relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      className="!w-full !p-3 !pr-12 !rounded-lg !border !border-[#B4D4FF] focus:!border-[#176B87] focus:!outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !text-gray-500 hover:!text-[#176B87] !transition !border-none !bg-transparent"
                    >
                      {showPasswords.current ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="!block !text-sm !font-semibold !text-slate-700 !mb-2">
                    New Password
                  </label>
                  <div className="!relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password (min 8 characters)"
                      className="!w-full !p-3 !pr-12 !rounded-lg !border !border-[#B4D4FF] focus:!border-[#176B87] focus:!outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !text-gray-500 hover:!text-[#176B87] !transition !border-none !bg-transparent"
                    >
                      {showPasswords.new ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="!block !text-sm !font-semibold !text-slate-700 !mb-2">
                    Confirm New Password
                  </label>
                  <div className="!relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Re-type new password"
                      className="!w-full !p-3 !pr-12 !rounded-lg !border !border-[#B4D4FF] focus:!border-[#176B87] focus:!outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="!absolute !right-3 !top-1/2 !-translate-y-1/2 !text-gray-500 hover:!text-[#176B87] !transition !border-none !bg-transparent"
                    >
                      {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="!bg-blue-50 !border !border-blue-200 !rounded-lg !p-4">
                  <p className="!text-sm !text-blue-800">
                    <strong>Password requirements:</strong>
                    <br />
                    • Minimum 8 characters
                    <br />
                    • Must be different from current password
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="!w-full !px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition disabled:!opacity-50 disabled:!cursor-not-allowed !border-none"
                >
                  {isChangingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </form>
            </div>
          ) : null}
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
