import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import PageFooter from "./PageFooter";
import { round } from "../../../utils/money";
import "./Homepage.css";
import { api } from "../../../services/api";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const TAX_RATE = 0.0825; // 8.25% — adjust if needed
  const tax = round(total * TAX_RATE);
  const grandTotal = round(total + tax);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    email: user?.email || "",
    paymentMethod: "credit_card",
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
      // Separate ride items from store items
      const rideItems = cart.filter(item => item.type === 'ride');
      const storeItems = cart.filter(item => item.type === 'store');

      const orders = [];

      // Create ride order if there are ride items
      if (rideItems.length > 0) {
        const rideSubtotal = rideItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const rideTax = round(rideSubtotal * TAX_RATE);
        const rideTotal = round(rideSubtotal + rideTax);

        const rideOrder = await api.createRideOrder({
          cart: rideItems,
          subtotal: rideSubtotal,
          tax: rideTax,
          total: rideTotal,
          payment_method: form.paymentMethod,
        });

        orders.push({ type: 'ride', ...rideOrder });
      }

      // Create store order if there are store items
      if (storeItems.length > 0) {
        // Group store items by store
        const storeGroups = storeItems.reduce((groups, item) => {
          if (!groups[item.storeId]) {
            groups[item.storeId] = [];
          }
          groups[item.storeId].push(item);
          return groups;
        }, {});

        // Create separate order for each store (with tax)
        for (const [storeId, items] of Object.entries(storeGroups)) {
          const storeSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const storeTax = round(storeSubtotal * TAX_RATE);
          const storeTotal = round(storeSubtotal + storeTax);

          const storeOrder = await api.createStoreOrder({
            store_id: parseInt(storeId, 10),
            cart: items,
            subtotal: storeSubtotal,
            tax: storeTax,
            total: storeTotal,
            payment_method: form.paymentMethod,
          });
          orders.push({ type: 'store', ...storeOrder });
        }
      }

      // Clear cart after successful order
      clearCart();

      // Navigate to confirmation with order info
      navigate("/confirmation", { state: { orders } });
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
            Order Summary
          </h3>
          {cart.length === 0 ? (
            <p className="!text-slate-600">
              Your cart is empty. Add some rides or store items!
            </p>
          ) : (
            <table className="!w-full !border !border-[#B4D4FF] !text-left !rounded-md !overflow-hidden">
              <thead className="!bg-[#749BC2] !text-white">
                <tr>
                  <th className="!px-4 !py-2">Item</th>
                  <th className="!px-4 !py-2">Type</th>
                  <th className="!px-4 !py-2">Price</th>
                  <th className="!px-4 !py-2">Quantity</th>
                  <th className="!px-4 !py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.type}-${item.id}-${index}`} className="!bg-white/80">
                    <td className="!px-4 !py-2">
                      {item.name}
                      {item.storeName && <div className="!text-xs !text-gray-500">from {item.storeName}</div>}
                    </td>
                    <td className="!px-4 !py-2">
                      <span className={`!px-2 !py-1 !rounded !text-xs !font-semibold ${
                        item.type === 'ride'
                          ? '!bg-blue-100 !text-blue-700'
                          : '!bg-green-100 !text-green-700'
                      }`}>
                        {item.type === 'ride' ? '🎢 Ride' : '🛍️ Store'}
                      </span>
                    </td>
                    <td className="!px-4 !py-2">${item.price.toFixed(2)}</td>
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
            <div className="!text-lg !font-semibold !text-[#176B87]">
              <p>Subtotal: ${total.toFixed(2)}</p>
              <p>Tax (8.25%): ${tax.toFixed(2)}</p>
              <h4>Total: ${grandTotal.toFixed(2)}</h4>
            </div>
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

          <div>
            <label className="!block !text-sm !font-semibold !text-slate-700">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="!w-full !p-3 !border !border-[#B4D4FF] !rounded-lg !bg-white"
              required
            >
              <option value="credit_card">💳 Credit Card</option>
              <option value="cash">💵 Cash (In-Park Only)</option>
            </select>
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
