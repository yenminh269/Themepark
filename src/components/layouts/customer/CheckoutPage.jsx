import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import PageFooter from "./PageFooter";
import "./Homepage.css";
import { api } from "../../../services/api";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to complete your purchase');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Create the order in the database
      const order = await api.createRideOrder(cart, total);

      // Clear cart after successful order
      clearCart();

      // Navigate to confirmation with order info
      navigate("/confirmation", { state: { order } });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to complete your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-br !from-[#EEF5FF] !to-[#B4D4FF] !text-slate-800">
      {/* Navbar is now global in App.jsx */}

      <main className=" !mb-5 !flex-1 !max-w-4xl !mx-auto !p-6 !mt-6 !bg-white/80 !rounded-xl !shadow">
        <h2 className="!text-3xl !font-bold !text-[#176B87] !mb-6 !text-center">
          Review & Payment
        </h2>

        {/* Cart Summary */}
        <div className="!mb-3">
          <h3 className="!text-xl !font-semibold !mb-3 !text-[#176B87]">
            Your Tickets
          </h3>
          {cart.length === 0 ? (
            <p className="!text-slate-600">
              No tickets selected. Go back and add some rides!
            </p>
          ) : (
            <table className="!w-full !border !border-[#B4D4FF] !text-left !rounded-md !overflow-hidden">
              <thead className="!bg-[#B4D4FF] !text-white">
                <tr>
                  <th className="!px-4 !py-2">Ride</th>
                  <th className="!px-4 !py-2">Price</th>
                  <th className="!px-4 !py-2">Quantity</th>
                  <th className="!px-4 !py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="!bg-white/80">
                    <td className="!px-4 !py-2">{item.name}</td>
                    <td className="!px-4 !py-2">${item.price}</td>
                    <td className="!px-4 !py-2">{item.quantity}</td>
                    <td className="!px-4 !py-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="!flex !justify-end !mt-4">
            <p className="!text-lg !font-semibold !text-[#176B87]">
              Total: ${total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleConfirm} className="!space-y-4">
          <div>
            <label className="!block !text-sm !font-semibold !text-slate-700">
              Card Number
            </label>
            <input
              name="cardNumber"
              value={form.cardNumber}
              onChange={handleChange}
              className="!w-full !p-3 !border !border-[#B4D4FF] !rounded-lg"
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>

          <div className="!flex !gap-4">
            <div className="!flex-1">
              <label className="!block !text-sm !font-semibold !text-slate-700">
                Expiry
              </label>
              <input
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                className="!w-full !p-3 !border !border-[#B4D4FF] !rounded-lg"
                placeholder="MM/YY"
                required
              />
            </div>

            <div className="!flex-1">
              <label className="!block !text-sm !font-semibold !text-slate-700">
                CVV
              </label>
              <input
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                className="!w-full !p-3 !border !border-[#B4D4FF] !rounded-lg"
                placeholder="123"
                required
              />
            </div>
          </div>

          <div>
            <label className="!block !text-sm !font-semibold !text-slate-700">
              Email for Receipt
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="!w-full !p-3 !border !border-[#B4D4FF] !rounded-lg"
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="!flex !justify-between !items-center !mt-6">
            <button
              type="button"
              onClick={() => navigate("/tickets")}
              className="!px-6 !py-3 !bg-white !border !border-[#176B87] !text-[#176B87] !rounded-lg !font-bold hover:!bg-[#EEF5FF] !transition"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="!px-6 !py-3 !bg-[#176B87] !text-white !rounded-lg !font-bold hover:!opacity-90 !transition !border-none disabled:!opacity-50 disabled:!cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </main>

      <PageFooter />
    </div>
  );
}
